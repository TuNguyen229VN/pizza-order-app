import React from 'react'

export default function InputCheckbox({ onClick, extraThing, isChecked }) {
    return (
        <label className="flex items-center gap-3 mb-4 cursor-pointer md:mb-6" onClick={onClick}>
            <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                ${isChecked ? 'border-gray-300 bg-primary' : 'border-gray-300'}`}>
            </div>
            <span className="flex-1 ml-2 text-sm font-medium md:text-base">{extraThing.name}</span>
            <span className="text-sm md:text-base">{extraThing.price.toLocaleString('vi-VN')}đ</span>
        </label>
    )
}
