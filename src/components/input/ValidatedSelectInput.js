import React from 'react'
import InfoIcon from '../icons/InfoIcon';

export default function ValidatedSelectInput({ label, name, error, inputRef, options = [], value, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="my-2 text-sm font-medium">{label}</label>}
      <div className="relative">
        <select
          ref={inputRef}
          className={`w-full py-3 pl-5 pr-8 border rounded-md outline-none appearance-none bg-white ${error ? "border-red-500" : "border-gray-300 focus:border-black"
            }`}
          value={value ?? ""}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <InfoIcon className="absolute w-5 h-5 -translate-y-1/2 right-2 top-1/2 text-primary" />
        )}
      </div>
      {error && <span className="my-1 text-xs text-primary">{error}</span>}
    </div>
  );
}
