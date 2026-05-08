import React from 'react'

export default function Loader({
    size = 30,
    className = "", 
    color = "border-black"
}) {
    const strokeWidth = size <= 20 ? 2 : Math.max(2, size / 10);
    return (
        <div
            className={`
        inline-block 
        rounded-full 
        border-solid 
        border-r-transparent 
        animate-spin 
        flex-shrink-0
        ${color} 
        ${className}
      `}
            style={{
                width: `${size}px`,
                height: `${size}px`, // Dùng height thay cho aspectRatio để hỗ trợ trình duyệt cũ tốt hơn
                borderWidth: `${strokeWidth}px`,
            }}
        />
    )
}
