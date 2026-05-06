import React from 'react'
import PlusIcon from '../icons/PlusIcon'

export default function ButtonAdd({onClick,className}) {
  return (
    <button onClick={onClick} className={`flex items-center justify-center w-12 h-12 text-white border rounded-full bg-primary ${className}`}>
        <PlusIcon className='w-10 h-10'/>
    </button>
  )
}
