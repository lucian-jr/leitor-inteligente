import { useEffect, useRef, useState } from 'react';

// Clients json
import clientsJson from '../data/clients.json';

// API
import { getLastInsertedData, getLastInsertedId } from '../services/reads/reads.service';
import type { lastInsertedIdDataType } from '../services/reads/reads.types';

import Swal from 'sweetalert2';

type ClientType = {
  id: number;
  nome: string;
  icon: string;
  saldo: number;
  rfids: Array<string>;
  extrato: Array<{ descricao: string; valor: number; rfid: string }>;
};

export const useHome = () => {
  // timers (usamos setTimeout em cadeia, não setInterval)
  const intervalRefCompra = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRefDevol = useRef<ReturnType<typeof setTimeout> | null>(null);

  // flags/refs de ciclo de vida e estado fresco
  const aliveRef = useRef(true);
  const clientsRef = useRef<ClientType[]>(clientsJson);
  const lastIdRef = useRef<lastInsertedIdDataType | null>(null);

  // dedupe/controle de alertas
  const alertOpenRef = useRef(false);
  const lastAlertKeyRef = useRef<string | null>(null);
  const cooldownUntilRef = useRef(0);
  const ALERT_COOLDOWN_MS = 8000;

  const compraAlertKeyRef = useRef<string | null>(null);

  // estado React
  const [clients, setClients] = useState<ClientType[]>(clientsJson);
  const [clientCurrentId, setClientCurrentId] = useState<number | null>(null);
  const [lastIdData, setLastIdData] = useState<lastInsertedIdDataType | null>(null);
  const [waiting, setWaiting] = useState<Boolean>(false);

  // manter refs sincronizadas
  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);
  useEffect(() => {
    lastIdRef.current = lastIdData;
  }, [lastIdData]);

  // helpers de cleanup
  const clearCompra = () => {
    if (intervalRefCompra.current) {
      clearTimeout(intervalRefCompra.current);
      intervalRefCompra.current = null;
    }
  };
  const clearDevol = () => {
    if (intervalRefDevol.current) {
      clearTimeout(intervalRefDevol.current);
      intervalRefDevol.current = null;
    }
  };

  const handleCancel = () => {
    compraAlertKeyRef.current = null;
    clearCompra();
    setWaiting(false);
    setClientCurrentId(null);
  };

  // decide antena com base no extrato do cliente alvo
  const resolveAntenaForClient = (c: ClientType): 1 | 2 => {
    const compra = c.extrato.find(e => e.descricao === 'Compra Copo')?.valor ?? 0;
    const devolucao = c.extrato.find(e => e.descricao === 'Devolução Copo')?.valor ?? 0;
    if (compra > 0 && devolucao === 0) return 2; // aguardando devolução
    return 1; // compra padrão
  };

  // --------- Fluxo por cliente (COMPRA/DEVOLUÇÃO disparado no card) ----------
  const handleClientCard = async (id: number) => {
    if (!lastIdRef.current) return;

    compraAlertKeyRef.current = null;
    setWaiting(true);
    setClientCurrentId(id);

    // calcula antena sem depender do setState assíncrono
    const client = clientsRef.current.find(c => c.id === id);
    let antena: 1 | 2 = client ? resolveAntenaForClient(client) : 1;

    // se ambos os valores já estiverem preenchidos, reseta o cliente
    if (client) {
      const compraVal = client.extrato.find(e => e.descricao === 'Compra Copo')?.valor ?? 0;
      const devolVal = client.extrato.find(e => e.descricao === 'Devolução Copo')?.valor ?? 0;
      if (compraVal > 0 && devolVal > 0) {
        setClients(prev =>
          prev.map(c =>
            c.id !== id
              ? c
              : {
                  ...c,
                  extrato: c.extrato.map(item => ({ ...item, valor: 0 })),
                  saldo: 0
                }
          )
        );
        antena = 1;
      }
    }

    clearCompra(); // garante que só um polling esteja ativo

    const tick = async () => {
      if (!aliveRef.current) return;
      const last = lastIdRef.current;
      if (!last) {
        intervalRefCompra.current = setTimeout(tick, 2000);
        return;
      }

      try {
        const res = await getLastInsertedData(last.id, antena);
        if (!res) {
          intervalRefCompra.current = setTimeout(tick, 2000);
          return;
        }

        const rf = res.last_inserted_data?.rf_id ?? '';
        if (!rf) {
          intervalRefCompra.current = setTimeout(tick, 1500);
          return;
        }

        // 1) BLOQUEIA compra se o código já está com OUTRO cliente
        const linked = clientsRef.current.find(c => c.rf_id === rf);
        if (linked && linked.id !== id) {
          const key = `${res.last_inserted_data?.id ?? 'na'}:${rf}`;
          if (compraAlertKeyRef.current !== key) {
            compraAlertKeyRef.current = key;
            await Swal.fire({
              title: 'Copo já vinculado!',
              text: `Este copo está registrado para o cliente "${linked.nome}". É necessário realizar a devolução antes de registrar nova compra.`,
              icon: 'warning',
              confirmButtonColor: '#007b8b'
            });
          }
          // continua ouvindo a antena 1
          intervalRefCompra.current = setTimeout(tick, 1500);
          return;
        }

        // 2) SUCESSO — Compra (antena 1) ou Devolução (antena 2) do cliente atual
        clearCompra();
        if (!aliveRef.current) return;

        setWaiting(false);
        setLastIdData(res.last_inserted_data);
        setClientCurrentId(null);

        setClients(prev =>
          prev.map(c => {
            if (c.id !== id) return c;
            return {
              ...c,
              rf_id: res.last_inserted_data?.rf_id ?? '',
              extrato: c.extrato.map(item => {
                if (item.descricao === 'Compra Copo' && antena === 1) {
                  return { ...item, valor: 5 };
                }
                if (item.descricao === 'Devolução Copo' && antena === 2) {
                  return { ...item, valor: 5 };
                }
                return item;
              }),
              saldo: antena === 1 ? -5 : antena === 2 ? 0 : c.saldo
            };
          })
        );
      } catch {
        // erro transitório → reintenta
        intervalRefCompra.current = setTimeout(tick, 2000);
      }
    };

    // inicia o loop da operação do cliente
    intervalRefCompra.current = setTimeout(tick, 0);
  };

  // --------- POLLING “global” de devolução (antena 2) ----------
  useEffect(() => {
    aliveRef.current = true;

    const fetchLastId = async () => {
      const res = await getLastInsertedId();
      if (!res || !res.last_id_data || !res.last_id_data.id) {
        setLastIdData({ id: 0, antena: 1 });
        return;
      }
      setLastIdData(res.last_id_data);
    };

    fetchLastId();

    const antena = 2;

    const tickDevol = async () => {
      if (!aliveRef.current) return;

      const last = lastIdRef.current;
      if (!last) {
        intervalRefDevol.current = setTimeout(tickDevol, 3000);
        return;
      }

      try {
        const res = await getLastInsertedData(last.id, antena);
        if (!res) {
          intervalRefDevol.current = setTimeout(tickDevol, 3000);
          return;
        }

        const rf = res.last_inserted_data?.rf_id ?? '';
        const exists = clientsRef.current.some(e => e.rf_id === rf);

        // devolução de copo que não está com ninguém → alerta com dedupe/cooldown
        if (!exists) {
          const key = `${res.last_inserted_data?.id ?? 'na'}:${rf}`;
          const now = Date.now();

          if (alertOpenRef.current || now < cooldownUntilRef.current || lastAlertKeyRef.current === key) {
            intervalRefDevol.current = setTimeout(tickDevol, 3000);
            return;
          }

          alertOpenRef.current = true;
          lastAlertKeyRef.current = key;

          await Swal.fire({
            title: 'Houve um problema na devolução!',
            text: 'Você tentou devolver um copo sem o cliente tê-lo comprado antes.',
            icon: 'error',
            confirmButtonColor: '#007b8b'
          });

          alertOpenRef.current = false;
          cooldownUntilRef.current = Date.now() + ALERT_COOLDOWN_MS;

          intervalRefDevol.current = setTimeout(tickDevol, 3000);
          return;
        }

        // devolução válida → liberar copo e acertar saldo/extrato
        setWaiting(false);
        setLastIdData(res.last_inserted_data);
        setClientCurrentId(null);

        setClients(prev =>
          prev.map(c => {
            if (c.rf_id !== rf) return c;
            return {
              ...c,
              rf_id: '', // LIBERA o copo para nova compra
              extrato: c.extrato.map(item =>
                item.descricao === 'Devolução Copo' ? { ...item, valor: 5 } : item
              ),
              saldo: 0
            };
          })
        );

        intervalRefDevol.current = setTimeout(tickDevol, 3000);
      } catch {
        intervalRefDevol.current = setTimeout(tickDevol, 3000);
      }
    };

    // inicia o loop global da devolução
    clearDevol();
    intervalRefDevol.current = setTimeout(tickDevol, 0);

    // cleanup ao desmontar
    return () => {
      aliveRef.current = false;
      clearCompra();
      clearDevol();
    };
  }, []);

  useEffect(() => {
    console.log(clients);
  }, [clients]);

  return {
    clients,
    clientCurrentId,
    lastIdData,
    waiting,
    handleCancel,
    handleClientCard
  };
};
