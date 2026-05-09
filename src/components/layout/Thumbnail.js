import Image from 'next/image'
import React from 'react'
import { CiDiscount1, CiStar } from "react-icons/ci";
import { FiSmartphone } from "react-icons/fi";

export default function Thumbnail() {
    return (
        <div className='text-white '>
            <div className=" bg-[url('/images/pizzaBg.webp')] bg-cover bg-center w-[510px] h-[290px] mx-auto p-5 rounded-2xl overflow-hidden">
                <div className='w-20 h-20 mx-auto bg-white rounded-full'>
                    <Image src={"/logo-small.png"} alt='logopizza' width={200} height={200} className='object-cover object-center w-full h-full' />
                </div>
                <div className='mx-auto my-6 text-center w-max'>
                    <p className='text-sm'>Đăng nhập để mở khóa</p>
                    <p className='mt-1 text-lg font-semibold'>lợi ích tuyệt vời</p>
                </div>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <CiDiscount1 className='w-6 h-6' />
                        <div className='text-xs'>
                            <p className='font-light'>Tận hưởng</p>
                            <p className='font-medium'>Vô vàn ưu đãi</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <CiStar className='w-6 h-6' />
                        <div className='text-xs'>
                            <p className='font-light'>Tích lũy</p>
                            <p className='font-medium'>Teo rewards</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <FiSmartphone className='w-6 h-6' />
                        <div className='text-xs'>
                            <p className='font-light'>Dễ dàng</p>
                            <p className='font-medium'>Đặt món</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
