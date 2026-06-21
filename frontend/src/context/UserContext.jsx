import React, { createContext, useEffect, useState } from 'react'
import axios from 'axios'
const getBackendUrl = () => {
  // Replace the dynamic local URL with your Render URL
  return 'https://ai-assistant-backend-wsm9.onrender.com';
}

export const userDataContext=createContext({
    serverUrl: getBackendUrl(),
    userData: null,
    setUserData: () => {},
    backendImage: null,
    setBackendImage: () => {},
    selectedImage: null,
    setSelectedImage: () => {}
})
function UserContext({children}) {
    const serverUrl = getBackendUrl()
    const [userData,setUserData]=useState(null)
    const [backendImage,setBackendImage]=useState(null)
    const [selectedImage,setSelectedImage]=useState(null)

    const handleCurrentUser = async () => {
    try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {withCredentials: true})
        setUserData(result.data)
        console.log(result.data)
    } catch (error) {
        console.log(error)
    }
}



const getGeminiResponse=async(command)=>{
  try {
    const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
    return result.data
  } catch (error) {
    console.log(error)
  }
}



  useEffect(()=>{
    handleCurrentUser()
  },[])

    const value={
serverUrl,userData,setUserData,backendImage,setBackendImage,selectedImage,setSelectedImage,getGeminiResponse
    }
  return (
    <userDataContext.Provider value={value}>
        {children}
    </userDataContext.Provider>
  )
}

export default UserContext





