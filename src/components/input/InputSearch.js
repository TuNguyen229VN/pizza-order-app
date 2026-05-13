import React from 'react'
import { MdSearch } from 'react-icons/md'

export default function InputSearch({ search, setSearch,className,placeholder="Nhập tên danh mục" }) {
    return (
        <div className={`relative flex-1 ${className}`}>
            <MdSearch className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-secondary" />
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full py-2 pr-4 border rounded pl-9 border-outline-variant focus:outline-none focus:border-black text-body-md"
            />
        </div>
    )
}
