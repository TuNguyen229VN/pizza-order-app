


import InputCheckAccept from '@/components/input/InputCheckAccept'
import { useTranslations } from 'next-intl';
import Link from 'next/link'
import React, { useState } from 'react'

export default function CheckAcceptPolicy({ checked, setChecked, legit }) {
    const sTrans = useTranslations("System");
    return (
        <div className='px-4 py-4 mt-4 md:mt-6 md:border md:rounded-2xl'>
            <div className='flex items-start justify-center gap-2' >
                <InputCheckAccept id="cb-1" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                <p onClick={() => setChecked((prev) => !prev)} className='text-sm cursor-pointer text-blackHeader'>{sTrans("Tôi đồng ý với")} <Link onClick={(e) => e.stopPropagation()} className='underline text-primary' href={"#"}>{sTrans("các điều khoản và điều kiện")}</Link> {sTrans("và tham gia")} <Link onClick={(e) => e.stopPropagation()} className='underline text-primary' href={"#"}>{sTrans("chương trình thành viên Teo Rewards")} </Link> {sTrans("để tích điểm và hưởng quyền lợi theo quy định của chương trình")}.</p>
            </div>
            {!checked && legit && <p className='mt-2 text-xs text-primary'>{sTrans("Vui lòng đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư trước khi tiếp tục")}.</p>}
        </div>
    )
}
