import React from 'react'
import MinusIcon from '../icons/MinusIcon'

export default function ButtonDecrement({ onClick, className, }) {
    return (
        <button onClick={onClick} className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 border rounded-full  text-primary ${className}`}>
            <MinusIcon className='w-5 h-5 md:w-7 md:h-7 '  />
        </button>
    )
}
