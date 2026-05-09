import React from 'react'
import InfoIcon from '../icons/InfoIcon';

export default function ValidatedDateInput({ label, name, error, inputRef, value, ...props }) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="my-2 text-sm font-medium">{label}</label>}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="date"
                    className={`w-full py-3 pl-5 pr-8 border rounded-md outline-none ${error ? "border-red-500" : "border-gray-300 focus:border-black"
                        }`}
                    value={value ?? ""}
                    {...props}
                />
                {error && (
                    <InfoIcon className="absolute w-5 h-5 -translate-y-1/2 right-2 top-1/2 text-primary" />
                )}
            </div>
            {error && <span className="my-1 text-xs text-primary">{error}</span>}
        </div>
    );
}
