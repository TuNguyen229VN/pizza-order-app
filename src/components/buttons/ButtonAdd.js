import React from 'react'
import PlusIcon from '../icons/PlusIcon'
import { FaCheck } from 'react-icons/fa6'

export default function ButtonAdd({ onClick, className, forCombo = "add" }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 border rounded-full  ${className}  ${forCombo === "add"
        ? "text-white bg-primary"
        : forCombo === "check"
          ? "border-primary text-primary"
          : "border-primary text-black"
      }`}>
      {forCombo === "add" ? <PlusIcon className='w-5 h-5 md:w-7 md:h-7 lg:w-10 lg:h-10' /> : (forCombo === "check" ? <FaCheck className='w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8' /> : <p className='text-sm md:text-base'>{forCombo}</p>)}
    </button>
  )
}
