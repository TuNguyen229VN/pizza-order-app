import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { HOME_ROUTE } from '@/constant/routesApp'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto mt-8">
        <div className='flex items-center justify-center md:gap-[102px]'>
          <div className='w-[310px] h-[420px]'>
            <p className='text-primary font-bold text-[40px] leading-[48px]'>404</p>
            <p className='text-[28px] font-semibold mt-4'>Oops....</p>
            <p className='text-[28px] font-semibold mb-4'>Không tìm thấy trang</p>
            <p className='mb-4 text-secondary'>Chúng tôi đề xuất bạn trở về trang chủ.</p>
            <Link href={HOME_ROUTE}>
              <ButtonPrimary className={"!w-[250px]"}>Quay lại trang chủ</ButtonPrimary>
            </Link>
            <Link className='inline-block mt-4 font-medium text-primary w-[250px] text-center' href={"tel:1900 1822"}>Hoặc liên hệ tới 1900 1822</Link>
          </div>
          <div className='relative w-[450px] h-[450px]'>
            <Image
              src="/images/404img.png" alt="404" fill className='object-cover object-center ' quality={100} />
          </div>
        </div>
      </main>
    </>
  )
}
