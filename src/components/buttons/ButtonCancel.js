import React from 'react'
import Loader from '../loading/Loader'
import { getLabel } from '@/utils/i18n-utils';
import { useTranslations } from 'next-intl';

export default function ButtonCancel({ className, text = "Hủy", onClick, loadingForm = false, type = "button" }) {
    const sTrans = useTranslations("System");
    return (
        <button type={type} className={`font-medium flex items-center justify-center px-6 py-3 outline-none border rounded-lg w-[170px] hover:opacity-80 hover:scale-[1.02]  duration-500 hover:bg-red-100 hover:text-secondary ${loadingForm ? "bg-[#DFE4EA] text-secondary pointer-events-none" : " pointer-events-auto"} ${className}`} onClick={onClick} disabled={loadingForm}>
            {loadingForm ? <Loader size={20} /> : <span className='font-medium'>{getLabel(sTrans,text)}</span>}
        </button>
    )
}


