import React from 'react'

export default function InputRadio({ name, selectedSize, onClick }) {
    return (
        <div className={`h-full cursor-pointer w-full p-3 md:p-4 ${selectedSize === name ? "bg-primary text-white" : "bg-white"} hover:bg-primary hover:text-white  flex-shrink`} onClick={onClick}>
            <p className='text-sm font-medium md:text-base'>{name}</p>
        </div>
    )
}