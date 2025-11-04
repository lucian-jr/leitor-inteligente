

import CIcon1 from '../../assets/icons/client-1.svg'
import CIcon2 from '../../assets/icons/client-2.svg'
import CIcon3 from '../../assets/icons/client-3.svg'
import CIcon4 from '../../assets/icons/client-4.svg'
import { useHome } from '../../hooks/useHome';


import { formataValor } from '../../utils/value.util';


const ICONS: Record<string, string> = {
  'client-1': CIcon1,
  'client-2': CIcon2,
  'client-3': CIcon3,
  'client-4': CIcon4,
};

const Home = () => {

  const {
    clients,
    clientCurrentId,
    lastIdData,
    waiting,
    handleCancel,
    handleClientCard
  } = useHome();

  return (
    <div className="flex items-center justify-center gap-5 min-h-[70vh]">
      {waiting &&
        <div className='absolute w-[100vw] h-[100vh] top-0 left-0 bg-[#02020270] z-1 flex flex-col items-center justify-center'>
          <div className="flex flex-col items-center gap-3 animate-pulse mb-6">
            <div className="w-24 h-24 bg-green-300/40 rounded-full border-4 border-green-400 animate-ping"></div>
            <p className="text-lg font-medium text-white-700 mt-10">
              Passe o copo no leitor...
            </p>
          </div>

          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition"
          >
            Cancelar
          </button>
        </div>
      }
      {lastIdData ?
        (
          clients.map(c => (
            <div className={`card backdrop-blur-xs ${clientCurrentId === c.id ? 'active' : ''}`} key={c.id} onClick={() => handleClientCard(c.id)}>
              <div className="mb-2">
                <img className='m-auto' src={ICONS[c.icon]} alt="Client Icon" />
              </div>

              <p className="font-bold mb-3">{c.nome}</p>

              <div className="client-infos bg-[#F1F1F1] text-start p-3">
                <p className="mb-3 font-medium roboto-mono">EXTRATO</p>

                {c.extrato.map((e, index) =>
                  e.valor > 0 &&
                  <div key={index} className='flex justify-between'>
                    <span className='roboto-mono'>{e.descricao}</span>
                    <span className='roboto-mono'>{e.descricao === 'Compra Copo' ? '-' : '+'}R$ {formataValor(e.valor.toString())}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="block font-medium roboto-mono">SALDO</span>

                <span className="block font-medium roboto-mono">R$ {formataValor(c.saldo.toString())}</span>
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