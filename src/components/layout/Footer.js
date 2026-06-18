import { useTranslations } from 'next-intl';
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Footer() {
    const fTrans = useTranslations("Footer");
    return (
        <footer className='max-w-6xl pb-4 mx-auto'>
            <section className='grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8 bg-[#F3F4F6] px-5 py-8 md:py-12 md:px-7 rounded-2xl mt-4 md:mt-8'>
                <div className='flex flex-col justify-between col-span-2 md:col-span-1'>
                    <Image src={"/logo.png"} alt='logofooter' width={200} height={200} />
                </div>
                <div>
                    <h4 className='mb-2 text-xl font-semibold'>{fTrans("Về chúng tôi")}</h4>
                    <div className='flex flex-col gap-2 text-secondary'>
                        <p><Link href={"#"}>{fTrans("Giới thiệu")}</Link></p>
                        <p><Link href={"#"}>{fTrans("Tầm nhìn và sứ mệnh của chúng tôi")}</Link></p>
                        <p><Link href={"#"}>{fTrans("Giá trị cốt lõi")}</Link></p>
                        <p><Link href={"#"}>{fTrans("An toàn thực phẩm")}</Link></p>
                        <p><Link href={"#"}>{fTrans("LIMO")}</Link></p>
                        <p><Link href={"#"}>{fTrans("Cơ hội nghề nghiệp")}</Link></p>
                    </div>
                </div>
                <div>
                    <h4 className='mb-2 text-xl font-semibold'>{fTrans("Vị trí cửa hàng")}</h4>
                    <div className='flex flex-col gap-2 text-secondary'>
                        <p><Link href={"#"}>{fTrans("Miền Bắc")}</Link></p>
                        <p><Link href={"#"}>{fTrans("Miền Trung")}</Link></p>
                        <p><Link href={"#"}>{fTrans("Miền Nam")}</Link></p>
                    </div>
                </div>
            </section>
            <section className='flex flex-col-reverse items-center justify-between gap-3 pb-4 mt-5 text-sm md:gap-0 md:flex-row md:text-base'>
                <p>{fTrans("Phiên bản")} 1.0.0</p>
                <div className='flex items-center justify-between gap-12'>
                    <p>Teo Rewards</p>
                    <p>{fTrans("Điều khoản và quyền lợi")}</p>
                    <p className='text-primary'>{fTrans("Liên hệ chúng tôi")} 1900 1822</p>
                </div>
            </section>
        </footer>
    )
}
