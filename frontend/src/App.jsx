import React, { useContext } from 'react'
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import Customize2 from './pages/Customize2'
import Home from './pages/Home'
import { userDataContext } from './context/UserContext'
import { IoArrowBack } from 'react-icons/io5'
import axios from 'axios'

function App() {
  const {userData, setUserData, serverUrl} = useContext(userDataContext)
  const navigate = useNavigate()
  const location = useLocation()

  const hideBackOn = ['/signin', '/signup', '/']
  const showBack = !hideBackOn.includes(location.pathname)

  const handleBack = async () => {
    if (location.pathname === '/customize') {
      try {
        await axios.get(`${serverUrl}/api/auth/logout`, {withCredentials: true})
        setUserData(null)
        navigate('/signin')
      } catch (err) {
        setUserData(null)
        navigate('/signin')
      }
    } else {
      navigate(-1)
    }
  }

  return (
    <>
      {showBack && (
        <button 
          className='fixed top-[30px] left-[30px] text-white cursor-pointer hover:text-blue-300 transition-colors z-50'
          onClick={handleBack}
        >
          <IoArrowBack size={28} />
        </button>
      )}
      <Routes>
        <Route path='/' element={userData ? ((userData.assistantImage && userData.assistantName) ? <Home/> : <Navigate to="/customize"/>) : <Navigate to="/signin"/>}/>
        <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
        <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
        <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signin"}/>}/>
        <Route path='/customize2' element={userData?<Customize2/>:<Navigate to={"/signin"}/>}/>
      </Routes>
    </>
  )
}

export default App
