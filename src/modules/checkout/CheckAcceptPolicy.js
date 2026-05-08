


import InputCheckAccept from '@/components/input/InputCheckAccept'
import Link from 'next/link'
import React, { useState } from 'react'

export default function CheckAcceptPolicy({ checked, setChecked, legit }) {
    return (
        <div className='px-4 py-4 mt-6 border rounded-2xl'>
            <div className='flex items-start justify-center gap-2' >
                <InputCheckAccept id="cb-1" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                <p onClick={() => setChecked((prev) => !prev)} className='text-sm cursor-pointer text-blackHeader'>Tôi đồng ý với <Link onClick={(e) => e.stopPropagation()} className='underline text-primary' href={"#"}>các điều khoản và điều kiện</Link> và tham gia <Link onClick={(e) => e.stopPropagation()} className='underline text-primary' href={"#"}>chương trình thành viên Hut Rewards </Link> để tích điểm và hưởng quyền lợi theo quy định của chương trình.</p>
            </div>
            {!checked && legit && <p className='mt-2 text-xs text-primary'>Vui lòng đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư trước khi tiếp tục.</p>}
        </div>
    )
}
