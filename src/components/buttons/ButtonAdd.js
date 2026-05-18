import React from 'react'
import PlusIcon from '../icons/PlusIcon'

export default function ButtonAdd({onClick,className}) {
  return (
    <button onClick={onClick} className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white border rounded-full bg-primary ${className}`}>
        <PlusIcon className='w-5 h-5 md:w-7 md:h-7 lg:w-10 lg:h-10'/>
    </button>
  )
}
