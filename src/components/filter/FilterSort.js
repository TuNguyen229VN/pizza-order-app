import React from 'react'

export default function FilterSort({ sort, setSort, listOption = [] }) {
    return (
        <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border rounded border-outline-variant text-body-md focus:outline-none focus:border-black"
        >
            {listOption.length > 0 && listOption.map((option, index) => (
                <option key={index} value={option.value}>{option.label}</option>
            ))}
        </select>
    )
}
