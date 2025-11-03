import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages
import Home from './pages/Home/Home'

const base_url = '/leitor-inteligente/'

function App() {
  return (
    <>
      <BrowserRouter>
        <div className='container max-w-[1200px] mx-auto mb-[3rem] mt-[2rem] px-4'>
          <Routes>
            <Route path={base_url} element={<Home />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
