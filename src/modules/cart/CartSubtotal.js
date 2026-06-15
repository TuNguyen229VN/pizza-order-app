import InfoIcon from '@/components/icons/InfoIcon'
import { DIVISION_POINT } from '@/constant/constant'
import React from 'react'

const DISCOUNT_FEE = 0

export default function CartSubtotal({ deliveryFee = 0, subtotal, children, className, discountPercent,discountAmount }) {
    return (
        <div className={`px-4 py-4 border rounded-2xl ${className}`}>
            {children}
            <div className='flex items-center justify-between'>
                <p>Tạm tính</p>
                <p className='text-sm font-semibold md:text-base'>{(subtotal).toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
            </div>
            <div className='flex items-center justify-between mt-4'>
                <p className='flex items-center gap-1'>Giảm giá thành viên <InfoIcon /></p>
                <p className='font-semibold text-[#0a8020] text-sm md:text-base'>({discountPercent}%) {discountAmount.toLocaleString('vi-VN')||0} <span className='underline'>đ</span>  </p>
                {/* {order?.pointDiscount?.discountAmount > 0 && (
                    <p className="text-sm text-green-600">
                        🎁 Ưu đãi {order.pointDiscount.tierLabel} (-{order.pointDiscount.discountPercent}%):
                        -{order.pointDiscount.discountAmount.toLocaleString("vi-VN")}đ
                    </p>
                )} */}
            </div>
            <div className='flex items-center justify-between pb-4 mt-4 border-b'>
                <p className='flex items-center gap-1'>Phí giao hàng <InfoIcon /></p>
                <p className='text-sm font-semibold md:text-base'>{deliveryFee.toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
            </div>

            <div className='flex items-center justify-between mt-4'>
                <p>Tổng cộng</p>
                <div className='flex flex-col items-end justify-center'>
                    <p className='text-lg md:text-3xl md:leading-[38px] font-bold'>{(subtotal + deliveryFee - (discountAmount||0)).toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
                    <p className='text-base text-secondary'>Nhận <span className='font-semibold text-blackHeader'>{Math.floor((subtotal + deliveryFee) / DIVISION_POINT)} điểm</span> Teo rewards</p>
                </div>
            </div>
        </div>
    )
}
