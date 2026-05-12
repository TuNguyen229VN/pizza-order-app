"use client"
import ArrowLeft from '@/components/icons/ArrowLeft'
import { HOME_ROUTE } from '@/constant/routesApp'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function HeaderCart({ text = "Giỏ hàng của tôi", urlLink }) {
    const [scrolled, setScrolled] = useState(false);

    const router = useRouter();

    function handleBack() {
        // if (urlLink) {
        //     router.push(urlLink);
        //     return
        // }
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(HOME_ROUTE);
        }
    }

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 1);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return (
        <div className={`h-[80px] sticky flex items-center z-20 top-[80px] pt-3 pb-3 px-2 bg-white ${scrolled ? "shadow-[0_4px_5px_-3px_rgba(0,0,0,0.1)]" : ""}`}>
            <div onClick={handleBack} className='flex text-blackHeader text-sm leading-[22px] items-center gap-2 absolute cursor-pointer'>
                <ArrowLeft className='w-5 h-5' strokeWidth='3' />
                <span>Trở lại</span>
            </div>
            <p className='text-3xl font-bold text-center leading-[30px] mx-auto'>{text}</p>
        </div>
    )
}
