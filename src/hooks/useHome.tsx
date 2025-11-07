import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import clientsSeed from '../data/clients.json';
import { getRfStream, assignRfids, returnCup } from '../services/reads/reads.service';
import type { StreamItem } from '../services/reads/reads.types';

// TIPAGEM Firme: descricao é um literal ('Compra Copo' | 'Devolução Copo')
export type ExtratoItem = {
  descricao: 'Compra Copo' | 'Devolução Copo';
  valor: number;
  rfid?: string;
  ts: number;
};

export type Client = {
  id: number;
  nome: string;
  icon: string;
  saldo: number;
  rfids: string[];
  extrato: ExtratoItem[];
};

const COP0_VALOR = 5;

export const useHome = () => {
  const [clients, setClients] = useState<Client[]>(clientsSeed as Client[]);
  const [clientCurrentId, setClientCurrentId] = useState<number | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [count, setCount] = useState(0);

  const aliveCompraRef = useRef(true);
  const aliveDevolRef = useRef(true);
  const purchaseBufferRef = useRef<Set<string>>(new Set());
  const pollCompraTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitingRef = useRef(waiting);
  const currentClientIdRef = useRef(clientCurrentId);

  // ----------- COMPRA -----------
  const startReadingForClient = (id: number) => {
    aliveCompraRef.current = true;
    setClientCurrentId(id);
    setWaiting(true);
    setCount(0);
    purchaseBufferRef.current.clear();

    const tick = async () => {
      console.log(aliveCompraRef.current, waitingRef.current, currentClientIdRef.current)
      if (!aliveCompraRef.current || !waitingRef.current || !currentClientIdRef.current) return;

      const res = await getRfStream(1);
      if (res?.data?.length) {
        const list = res.data as StreamItem[];
        for (const item of list) {
          if (item.rf_id && !purchaseBufferRef.current.has(item.rf_id) && !item.chave_pix) {
            purchaseBufferRef.current.add(item.rf_id);
            setCount(purchaseBufferRef.current.size);
          }
        }
      }
      pollCompraTimerRef.current = setTimeout(tick, 1500);
    };

    tick();

    setTimeout(tick, 150);
  };

  const concludeReading = async () => {
    aliveCompraRef.current = false;

    if (!clientCurrentId) return;
    const rfids = Array.from(purchaseBufferRef.current);
    if (rfids.length === 0) {
      await Swal.fire({ title: 'Nenhum copo lido', icon: 'info' });
      setWaiting(false);
      setClientCurrentId(null);
      return;
    }

    const resp = await assignRfids({ chave_pix: clientCurrentId, rf_ids: rfids });
    void resp; // não usamos campos específicos aqui no protótipo

    setClients((prev): Client[] =>
      prev.map((c): Client => {
        if (c.id !== clientCurrentId) return c;

        // TIPAGEM EXPLÍCITA: cada item já é ExtratoItem
        const now = Date.now();
        const extratoAdd: ExtratoItem[] = rfids.map((rfid, i): ExtratoItem => ({
          descricao: 'Compra Copo',
          valor: -COP0_VALOR,
          rfid,
          ts: now + i,
        }));

        return {
          ...c,
          rfids: [...c.rfids, ...rfids],
          extrato: [...c.extrato, ...extratoAdd],
          saldo: c.saldo - rfids.length * COP0_VALOR,
        };
      })
    );

    if (pollCompraTimerRef.current) {
      clearTimeout(pollCompraTimerRef.current);
      pollCompraTimerRef.current = null;
    }

    setWaiting(false);
    setClientCurrentId(null);
    purchaseBufferRef.current.clear();
  };

  const handleCancel = () => {
    aliveCompraRef.current = false;
    purchaseBufferRef.current.clear();
    setWaiting(false);
    setClientCurrentId(null);

    if (pollCompraTimerRef.current) {
      clearTimeout(pollCompraTimerRef.current);
      pollCompraTimerRef.current = null;
    }
  };

  // ----------- DEVOLUÇÃO -----------
  useEffect(() => {
    const tick = async () => {
      const res = await getRfStream(2);
      if (res?.data?.length) {
        for (const item of res.data as StreamItem[]) {
          if (!item.rf_id) continue;
          const r = await returnCup({ rf_id: item.rf_id });
          if (r?.status === 'success') {
            setClients((prev): Client[] =>
              prev.map((c): Client => {
                if (!c.rfids.includes(item.rf_id)) return c;

                const now = Date.now();
                const extratoAdd: ExtratoItem[] = [{
                  descricao: 'Devolução Copo',
                  valor: +COP0_VALOR,
                  rfid: item.rf_id,
                  ts: now,
                }];

                return {
                  ...c,
                  rfids: c.rfids.filter((rf) => rf !== item.rf_id),
                  extrato: [...c.extrato, ...extratoAdd],
                  saldo: c.saldo + COP0_VALOR,
                };
              })
            );
          }
        }
      }
      setTimeout(tick, 3000);
    };
    
    tick();
    return () => { aliveDevolRef.current = false; };
  }, []);

  useEffect(() => {
    waitingRef.current = waiting;
    console.log('atualizou waiting')
  }, [waiting]);

  useEffect(() => {
    currentClientIdRef.current = clientCurrentId;
    console.log('atualizou current id')
  }, [clientCurrentId]);

  return {
    clients,
    clientCurrentId,
    waiting,
    count,
    startReadingForClient,
    concludeReading,
    handleCancel,
  };
};
