import ShoppingCart from '@/components/icons/ShoppingCart'
import { HOME_ROUTE } from '@/constant/routesApp'
import { useTranslations } from 'next-intl';
import Link from 'next/link'
import React from 'react'

export default function CartProductEmpty() {
    const cTrans = useTranslations("Cart");
    return (
        <div className='flex flex-col items-center justify-center text-center h-[300px] md:h-[400px]'>
            <ShoppingCart className="text-[rgb(223,228,234)] w-[100px] h-[100px]" />
            <p className='mt-3 font-medium text-blackHeader'>{cTrans("Giỏ hàng của bạn bị trống")}</p>
            <p className='text-sm'>{cTrans("CART_EMPTY_DESC")} <Link href={HOME_ROUTE} className='underline text-primary'> {cTrans("CART_EMPTY_DESC_RED")}</Link></p>
        </div>
    )
}
