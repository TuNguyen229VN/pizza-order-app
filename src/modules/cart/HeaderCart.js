"use client"
import ArrowLeft from '@/components/icons/ArrowLeft'
import { HOME_ROUTE } from '@/constant/routesApp'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export default function HeaderCart({text="Giỏ hàng của tôi",urlLink=HOME_ROUTE}) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 1);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (
        <div className={`h-[80px] sticky flex items-center z-10 top-[80px] pt-3 pb-3 px-2 bg-white ${scrolled ? "shadow-[0_4px_5px_-3px_rgba(0,0,0,0.1)]" : ""}`}>
            <Link href={urlLink} className='flex text-blackHeader text-sm leading-[22px] items-center gap-2 absolute'>
                <ArrowLeft className='w-5 h-5' strokeWidth='3' />
                <span>Trở lại</span>
            </Link>
            <p className='text-3xl font-bold text-center leading-[30px] mx-auto'>{text}</p>
        </div>
    )
}
