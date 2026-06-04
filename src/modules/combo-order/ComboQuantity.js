import React from 'react'

export default function ComboQuantity({ quantity, handleQtyChange }) {
    return (
        <div className="flex items-center justify-center gap-4 my-4 lg:gap-6">
            <button onClick={() => handleQtyChange(-1)}
                className="flex items-center justify-center w-10 h-10 text-2xl border rounded-md text-primary">−</button>
            <span className="w-5 text-sm font-medium text-center md:text-base">{quantity}</span>
            <button onClick={() => handleQtyChange(1)}
                className="flex items-center justify-center w-10 h-10 text-2xl border rounded-md text-primary">+</button>
        </div>
    )
}
