import React from 'react'

export default function ButtonPrimary({ className, form, onClick, children, type = "button", disabled }) {
    return (
        <button disabled={disabled} form={form} type={type} onClick={onClick} className={`py-3 w-full rounded-md font-medium text-center   hover:opacity-80 hover:scale-[1.02] duration-500 ${className} ${disabled ? "bg-[#DFE4EA] text-secondary pointer-events-none" : "bg-primary text-white pointer-events-auto"}`}>
            {children}
        </button>
    )
}
