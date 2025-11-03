import { useEffect, useState } from 'react';

import CIcon1 from '../../assets/icons/client-1.svg'
import CIcon2 from '../../assets/icons/client-2.svg'
import CIcon3 from '../../assets/icons/client-3.svg'
import CIcon4 from '../../assets/icons/client-4.svg'

import clientsJson from '../../data/clients.json'
import { formataValor } from '../../utils/value.util';
import type { lastIdDataType } from '../../services/reads/reads.types';
import { getLastInsertedData, getLastInsertedId } from '../../services/reads/reads.service';

const ICONS: Record<string, string> = {
  'client-1': CIcon1,
  'client-2': CIcon2,
  'client-3': CIcon3,
  'client-4': CIcon4,
};

type ClientTypes = {
  id: number;
  nome: string;
  icon: string;
  saldo: number;
  extrato: Array<{ descricao: string; valor: number }>;
};

const Home = () => {
  const [clients, setClients] = useState<ClientTypes[]>(clientsJson);
  const [clientCurrentId, setClientCurrentId] = useState<number | null>(null)
  const [lastIdData, setLastIdData] = useState<lastIdDataType | null>(null)

  const handleClientCard = async (id: number) => {
    if (!lastIdData) return;

    setClientCurrentId(id);

    const interval = setInterval(async () => {
      const res = await getLastInsertedData(lastIdData.id);

      if (!res) {
        console.log('Aguardando bip do copo...');
        return;
      }

      console.log("Resposta recebida:", res);

      clearInterval(interval);
    }, 2000);
  };

  useEffect(() => {
    const fetchLastId = async () => {
      const res = await getLastInsertedId();

      if (!res) {
        console.log('Houve um problema ao buscar o ultimo id');
        return;
      }

      setLastIdData(res.last_id_data)
    }

    fetchLastId();
  }, [])

  useEffect(() => {
    console.log(lastIdData)
  }, [lastIdData])

  return (
    <div className="flex items-center justify-center gap-5 min-h-[70vh]">
      {lastIdData ?
        (
          clients.map(c => (
            <div className={`card backdrop-blur-xs ${clientCurrentId === c.id ? 'active' : ''}`} key={c.id} onClick={() => handleClientCard(c.id)}>
              <div className="mb-2">
                <img className='m-auto' src={ICONS[c.icon]} alt="Client Icon" />
              </div>

              <p className="font-bold mb-3">{c.nome}</p>

              <div className="client-infos bg-[#F1F1F1] text-start p-3">
                <p className="mb-3">EXTRATO</p>


              </div>

              <div className="flex justify-between items-center">
                <span className="block">SALDO</span>

                <span className="block">R$ {formataValor(c.saldo.toString())}</span>
              </div>
            </div>
          ))
        )
        :
        (<p>Carregando...</p>)
      }

    </div>
  )
}

export default Home