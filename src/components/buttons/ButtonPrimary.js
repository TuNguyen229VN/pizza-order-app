import React from 'react'

export default function ButtonPrimary({ className, text, onClick, children }) {
    return (
        <button onClick={onClick} className={`py-3 w-full rounded-md font-medium text-center text-white bg-primary  hover:opacity-80 hover:scale-[1.02] duration-1000 ${className}`}>
            {children}
        </button>
    )
}
