import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages
import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'

import MceIcon from '../src/assets/mce.webp'

const base_url = '/leitor-inteligente/'

function App() {
  return (
    <>
      <BrowserRouter>
        <div className='intro'>
          <div className="animated">
            <div className="intro-logo">
              <img className='w-[150px]' src={MceIcon} alt="Meu Copo Eco" />
            </div>
          </div>
        </div>

        <Navbar />
        <div className='container max-w-[1200px] mx-auto mb-[3rem] mt-[2rem] px-4 mt-[80px]'>
          <Routes>
            <Route path={base_url} element={<Home />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
