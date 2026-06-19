import { getLabel } from '@/utils/i18n-utils';
import { useTranslations } from 'next-intl';
import React from 'react'

export default function InputRadio({ name, selectedSize, onClick }) {
    const hTrans = useTranslations("HomePage");
    return (
        <div className={`h-full cursor-pointer w-full p-3 md:p-4 ${selectedSize === name ? "bg-primary text-white" : "bg-white"} hover:bg-primary hover:text-white  flex-shrink`} onClick={onClick}>
            <p className='text-sm font-medium capitalize md:text-base'>{getLabel(hTrans,name)}</p>
        </div>
    )
}