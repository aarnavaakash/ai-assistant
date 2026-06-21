import React from 'react'

function Card({image, selected, onClick}) {
  return (
    <div
      className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#030326] border-2 rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-blue-950 ${selected ? "border-white" : "border-[#0000ff66]"}`}
      onClick={onClick}
    >
        <img src={image} className='w-full h-full object-cover' />
    </div>
  )
}

export default Card
