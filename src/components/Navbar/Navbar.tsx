import { NavLink } from "react-router-dom"

const Navbar = () => {
    return (
        <header className="shadow-md bg-[#FFF]">
            <div className="mx-auto max-w-5xl px-4 h-20 flex items-center justify-between">
                <NavLink to='/'>
                    <span className="gap-6 text-slate-800 font-extrabold text-3xl w-[115px]">
                        <img src="https://www.meucopoeco.com.br/assets/eventos/images/mce-preto.svg" alt="Meu Copo Eco" />
                    </span>
                </NavLink>
                <h1 className="text-black roboto-mono text-[30px] font-medium">Caução inteligente com RFID</h1>
                <nav className="flex items-center gap-6 text-slate-400 w-[115px]">

                </nav>
            </div>
        </header>
    )
}

export default Navbar