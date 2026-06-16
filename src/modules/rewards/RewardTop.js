import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import { REGISTER_ROUTE } from '@/constant/routesApp'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { PiPizzaLight } from 'react-icons/pi'

export default function RewardTop({status}) {
    return (
        <div className='w-full p-4 bg-white md:border md:rounded-2xl md:p-6 md:w-2/3'>
            <div className='flex items-center justify-center'>
                <Image src={"/images/rewards.png"} alt='rewards' width={250} height={250} />
            </div>
            <div className='p-8 mt-4 bg-primary rounded-2xl'>
                <p className='text-white uppercase text-[28px] text-center font-semibold'>MAKE EVERY BITE MORE REWARDING</p>
                <div className='flex flex-col gap-4 mt-4 md:flex-row'>
                    <div className='w-full md:h-[160px] relative bg-white p-4 rounded-lg '>
                        <p className='mb-4 text-xl font-medium capitalize text-primary'>Tạo tài khoản</p>
                        <p>Sử dụng website hoặc ứng dụng để đăng ký dễ dàng.</p>
                        <p className='absolute font-semibold -bottom-3 right-2 text-7xl text-primary'>1</p>
                    </div>
                    <div className='w-full md:h-[160px] relative bg-white p-4 rounded-lg'>
                        <p className='mb-4 text-xl font-medium capitalize text-primary'>Tích điểm</p>
                        <p>10.000đ = 1 điểm</p>
                        <p className='absolute font-semibold -bottom-3 right-2 text-7xl text-primary'>2</p>
                    </div>
                    <div className='w-full md:h-[160px] relative bg-white p-4 rounded-lg'>
                        <p className='mb-4 text-xl font-medium capitalize text-primary'>Giảm giá</p>
                        <p>Giảm giá tổng đơn hàng theo mức độ thân thiết khách hàng.</p>
                        <p className='absolute font-semibold -bottom-3 right-2 text-7xl text-primary'>3</p>
                    </div>
                </div>
            </div>
           {status==="unauthenticated"&& <div className='flex flex-col items-center justify-center gap-2 mt-4'>
                <p className='text-center text-secondary'>Không phải là thành viên?</p>
                <Link href={REGISTER_ROUTE}>
                    <ButtonPrimary className={"w-max p-4 "}>Tham gia ngay</ButtonPrimary>
                </Link>
            </div>}
        </div>
    )
}
