import ShoppingCart from '@/components/icons/ShoppingCart'
import { HOME_ROUTE } from '@/constant/routesApp'
import Link from 'next/link'
import React from 'react'

export default function CartProductEmpty() {
    return (
        <div className='flex flex-col items-center justify-center text-center h-[400px]'>
            <ShoppingCart className="text-[rgb(223,228,234)] w-[100px] h-[100px]" />
            <p className='mt-3 font-medium text-blackHeader'>Giỏ hàng của bạn bị trống</p>
            <p className='text-sm'>Giỏ hàng của bạn trông hơi trống. Tại sao không thử một vài món trong <Link href={HOME_ROUTE} className='underline text-primary'> món ăn của chúng tôi?</Link></p>
        </div>
    )
}
