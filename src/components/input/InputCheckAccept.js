import React from 'react'

export default function InputCheckAccept({ id, label, dark = false, disabled = false, checked, onChange }) {
    return (
        <div className="flex items-center mt-1">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="sr-only peer outlin"
            />
            <label
                htmlFor={id}
                className={`
          flex items-center cursor-pointer select-none
          before:content-[''] before:inline-block before:align-top
          before:h-[1.15em] before:w-[1.15em] before:mr-[0.6em]
          before:border before:border-solid before:rounded-[0.2em]
          before:transition-all before:duration-150
          before:bg-no-repeat before:bg-center
          before:[background-size:0]
          ${dark
                        ? `before:text-white/25 before:bg-[#222] before:border-white/25
               peer-checked:before:bg-[#a97035] peer-checked:before:[background-size:0.75em]
               peer-checked:active:before:bg-[#c68035]
               active:before:bg-[#444]`
                        : `before:text-black/25 before:bg-white before:border-black/25
               peer-checked:before:bg-primary peer-checked:before:[background-size:0.75em]
               peer-checked:active:before:bg-primary
               active:before:bg-[#f0f0f0]`
                    }
          peer-focus:before:shadow-[0_0_0_3.3px_rgba(231 30 35,0.55),0_0_0_5px_rgba(65,159,255,0.3)]
          peer-disabled:before:opacity-50
        `}
            >
                {label}
            </label>
        </div>
    )
}
