import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Footer() {
    return (
        <footer className='max-w-6xl pb-4 mx-auto'>
            <section className='grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8 bg-[#F3F4F6] px-5 py-8 md:py-12 md:px-7 rounded-2xl mt-8'>
                <div className='flex flex-col justify-between col-span-2 md:col-span-1'>
                    <Image src={"/logo.png"} alt='logofooter' width={200} height={200} />
                </div>
                <div>
                    <h4 className='mb-2 text-xl font-semibold'>Về chúng tôi</h4>
                    <div className='flex flex-col gap-2 text-secondary'>
                        <p><Link href={"#"}>Giới thiệu</Link></p>
                        <p><Link href={"#"}>Tầm nhìn và sứ mệnh của chúng tôi</Link></p>
                        <p><Link href={"#"}>Giá trị cốt lõi</Link></p>
                        <p><Link href={"#"}>An toàn thực phẩm</Link></p>
                        <p><Link href={"#"}>LIMO</Link></p>
                        <p><Link href={"#"}>Cơ hội nghề nghiệp</Link></p>
                    </div>
                </div>
                <div>
                    <h4 className='mb-2 text-xl font-semibold'>Vị trí cửa hàng</h4>
                    <div className='flex flex-col gap-2 text-secondary'>
                        <p><Link href={"#"}>Miền Bắc</Link></p>
                        <p><Link href={"#"}>Miền Trung</Link></p>
                        <p><Link href={"#"}>Miền Nam</Link></p>
                    </div>
                </div>
            </section>
            <section className='flex flex-col-reverse items-center justify-between gap-3 pb-4 mt-5 text-sm md:gap-0 md:flex-row md:text-base'>
                <p>Phiên bản 1.0.0</p>
                <div className='flex items-center justify-between gap-12'>
                    <p>Điều khoản và quyền lợi</p>
                    <p className='text-primary'>Liên hệ chúng tôi 1900 1822</p>
                </div>
            </section>
        </footer>
    )
}
