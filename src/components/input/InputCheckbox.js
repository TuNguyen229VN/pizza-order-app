import { getLabel } from '@/utils/i18n-utils';
import { useTranslations } from 'next-intl';
import React from 'react'

export default function InputCheckbox({ onClick, extraThing, isChecked }) {
    const hTrans = useTranslations("HomePage");
    return (
        <label className="flex items-center gap-3 mb-4 cursor-pointer md:mb-6" onClick={onClick}>
            <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 transition-all
        ${isChecked ? 'border-2 border-primary' : 'border border-gray-300'}`}>
                {isChecked && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <span className="flex-1 ml-2 text-sm font-medium md:text-base">{getLabel(hTrans,extraThing.name)}</span>
            <span className="text-sm md:text-base">{extraThing.price.toLocaleString('vi-VN')} <span className='underline'>đ</span></span>
        </label>
    )
}
