import React, { useContext, useRef, useState } from 'react'
import Card from '../components/Card'
import image1 from "../assets/image1.png"
import image2 from "../assets/image2.jpg"
import image3 from "../assets/authBg.png"
import image4 from "../assets/image4.png"
import image5 from "../assets/image5.png"
import image6 from "../assets/image6.jpeg"
import image7 from "../assets/image7.jpeg"
import { RiImageAddLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext'

function Customize() {
  const [frontendImage, setFrontendImage] = useState(null)
  const {setBackendImage, selectedImage, setSelectedImage} = useContext(userDataContext)
  const navigate=useNavigate()
  const inputImage = useRef()
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
    setSelectedImage("input")
  }

  const handleSelectImage = (image) => {
    setBackendImage(null)
    setFrontendImage(null)
    setSelectedImage(image)
  }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px] '>
        
        <h1 className='text-white mb-[40px] text-[30px] text-center '>
            Select your <span className='text-blue-200'>Assistant Image</span>
        </h1>

        <div className='w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[15px]'>
            <Card image={image1} selected={selectedImage === image1} onClick={() => handleSelectImage(image1)}/>
            <Card image={image2} selected={selectedImage === image2} onClick={() => handleSelectImage(image2)}/>
            <Card image={image3} selected={selectedImage === image3} onClick={() => handleSelectImage(image3)}/>
            <Card image={image4} selected={selectedImage === image4} onClick={() => handleSelectImage(image4)}/>
            <Card image={image5} selected={selectedImage === image5} onClick={() => handleSelectImage(image5)}/>
            <Card image={image6} selected={selectedImage === image6} onClick={() => handleSelectImage(image6)}/>
            <Card image={image7} selected={selectedImage === image7} onClick={() => handleSelectImage(image7)}/>
            
            <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer flex items-center justify-center ${selectedImage === "input" ? "border-white" : "border-[#0000ff66]"}`} onClick={()=>{
                inputImage.current.click()
                setSelectedImage("input")
            }}>
                <input type="file" accept="image/*" ref={inputImage} hidden onChange={handleImageUpload} />
                {!frontendImage && <RiImageAddLine className='text-white w-[25px] h-[25px]'/>}
                {frontendImage && <img src={frontendImage} className='h-full object-cover'/>}
            </div>
        </div>

        {selectedImage && <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px]' onClick={()=>navigate("/customize2")}>
            Next
        </button>}

    </div>
  )
}

export default Customize
