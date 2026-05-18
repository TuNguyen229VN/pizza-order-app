import Image from 'next/image'
import React from 'react'

export default function NotFindLayout({ title = "Xin lỗi, không tìm thấy sản phẩm", content = "Hãy thử lại với tìm kiếm mới", className }) {
    return (
        <div className={`flex flex-col items-center text-center ${className}`}>
            <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px]">
                <Image src={"/images/sorry.png"} alt="sorry" width={200} height={200} className="object-cover object-center w-full h-full" />
            </div>
            <p className="mt-6 text-2xl font-medium">{title}</p>
            <p>{content} </p>
        </div>
    )
}
