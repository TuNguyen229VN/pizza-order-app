import InfoIcon from '@/components/icons/InfoIcon'
import React from 'react'

const DISCOUNT_FEE = 0
const DELIVERY_FEE = 5000
export default function CartSubtotal({ subtotal, children }) {
    return (
        <div className="px-4 py-4 border rounded-2xl">
            {children}
            <div className='flex items-center justify-between'>
                <p>Tạm tính</p>
                <p className='font-semibold'>{(subtotal).toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
            </div>
            <div className='flex items-center justify-between mt-4'>
                <p className='flex items-center gap-1'>Giảm giá thành viên <InfoIcon /></p>
                <p className='font-semibold text-[#0a8020]'>{DISCOUNT_FEE.toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
            </div>
            <div className='flex items-center justify-between pb-4 mt-4 border-b'>
                <p className='flex items-center gap-1'>Phí giao hàng <InfoIcon /></p>
                <p className='font-semibold'>{DELIVERY_FEE.toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
            </div>

            <div className='flex items-center justify-between mt-4'>
                <p>Tổng cộng</p>
                <p className='text-3xl leading-[38px] font-bold'>{(subtotal + DELIVERY_FEE).toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
            </div>
        </div>
    )
}
