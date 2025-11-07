import CIcon1 from '../../assets/icons/client-1.svg'
import CIcon2 from '../../assets/icons/client-2.svg'
import CIcon3 from '../../assets/icons/client-3.svg'
import CIcon4 from '../../assets/icons/client-4.svg'

import { useHome } from '../../hooks/useHome'
import { formataValor } from '../../utils/value.util'

const ICONS: Record<string, string> = {
  'client-1': CIcon1,
  'client-2': CIcon2,
  'client-3': CIcon3,
  'client-4': CIcon4,
}

const Home = () => {
  const {
    clients,
    clientCurrentId,
    waiting,
    count,
    startReadingForClient,
    concludeReading,
    handleCancel,
  } = useHome()

  return (
    <div className="flex items-center justify-center gap-5 min-h-[70vh]">
      {waiting && (
        <div className="absolute w-[100vw] h-[100vh] top-0 left-0 bg-[#02020270] z-10 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-24 h-24 bg-green-300/40 rounded-full border-4 border-green-400 animate-ping" />
            <p className="text-lg font-medium text-white mt-6">
              Passe o copo no leitor...
            </p>
          </div>

          <p className="text-white text-3xl font-bold mb-6">
            {count} {count === 1 ? 'copo lido' : 'copos lidos'}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={concludeReading}
              className="px-6 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition"
            >
              Concluir leitura
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {clients.map((c) => {
        const isActive = clientCurrentId === c.id && waiting
        return (
          <div
            key={c.id}
            className={`card backdrop-blur-xs ${isActive ? 'active' : ''}`}
            onClick={() => startReadingForClient(c.id)}
          >
            <div className="mb-2">
              <img className="m-auto" src={ICONS[c.icon]} alt="Client Icon" />
            </div>

            <p className="font-bold mb-3 text-center">{c.nome}</p>

            <div className="client-infos bg-[#F1F1F1] text-start p-3 rounded-md">
              <p className="mb-3 font-medium roboto-mono">EXTRATO</p>

              {c.extrato.length === 0 && (
                <div className="text-sm text-neutral-500">Sem movimentações</div>
              )}

              {c.extrato.map((e, index) => (
                <div key={e.ts ?? index} className="flex justify-between">
                  <span className="roboto-mono fs-12">
                    {e.descricao}
                  </span>
                  <span className="roboto-mono fs-12">
                    {e.valor < 0 ? '-' : '+'}R$ {formataValor(Math.abs(e.valor).toString())}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="block font-medium roboto-mono">SALDO</span>
              <span className="block font-medium roboto-mono">
                R$ {formataValor(c.saldo.toString())}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Home
