import React from 'react'

export default function InputCheckbox({ onClick, extraThing, isChecked }) {
    return (
        <label className="flex items-center gap-3 mb-6 cursor-pointer" onClick={onClick}>
            <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                ${isChecked ? 'border-gray-300 bg-primary' : 'border-gray-300'}`}>
            </div>
            <span className="flex-1 ml-2 font-medium">{extraThing.name}</span>
            <span className="">{extraThing.price.toLocaleString('vi-VN')}đ</span>
        </label>
    )
}
