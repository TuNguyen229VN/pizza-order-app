"use client"
import ArrowLeft from '@/components/icons/ArrowLeft'
import { HOME_ROUTE } from '@/constant/routesApp'
import { getLabel } from '@/utils/i18n-utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function HeaderCart({ text = "Giỏ hàng của tôi", urlLink, className }) {
    const [scrolled, setScrolled] = useState(false);
    const sTrans = useTranslations("System");
    const router = useRouter();

    function handleBack() {
        if (urlLink) {
            router.push(urlLink);
            return
        }
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
        <div className={`h-[80px] sticky flex items-center z-20 top-0 md:top-[80px] pt-3 pb-3 px-2 bg-white ${scrolled ? "shadow-[0_4px_5px_-3px_rgba(0,0,0,0.1)]" : ""} ${className}`}>
            <div onClick={handleBack} className='flex text-blackHeader text-sm leading-[22px] items-center gap-2 absolute cursor-pointer'>
                <ArrowLeft className='w-4 h-4 md:w-5 md:h-5' strokeWidth='3' />
                <span>{sTrans("Trở lại")}</span>
            </div>
            <p className='text-base font-semibold md:text-3xl md:font-bold text-center md:leading-[30px] mx-auto'>{getLabel(sTrans,text)}</p>
        </div>
    )
}
