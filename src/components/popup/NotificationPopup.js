import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { getLabel } from '@/utils/i18n-utils';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react'
import { createPortal } from 'react-dom';

export default function NotificationPopup({ children, onDelete, label = "Thông báo", labelConfirm = "Đã hiểu", classNameButton = "", labelDesc = "Đây là thông báo", disabled = false }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const nTrans = useTranslations("Notification");
    useLockBodyScroll(showConfirm);
    if (showConfirm) {
        return createPortal(
            <div className='fixed inset-0 z-50 flex items-center justify-center h-full bg-black/80'>
                <div className="flex flex-col items-center justify-center p-6 text-base bg-white shadow-lg rounded-2xl max-w-[960px] w-[345px]">
                    <p className='font-semibold text-center'>{getLabel(nTrans,label)}</p>
                    <div className='w-1/3 h-1 mt-2 mb-4 rounded-lg bg-primary'></div>
                    <div className="text-sm font-normal text-center">{getLabel(nTrans,labelDesc)}</div>
                    <div className='flex w-full gap-4 mt-4'>
                        <button className='px-6 py-3 text-white rounded-lg bg-primary w-full hover:opacity-80 hover:scale-[1.02] duration-500' onClick={() => {
                            setShowConfirm(false);
                        }}>{getLabel(nTrans,labelConfirm)}</button>
                    </div>
                </div>
            </div>
            , document.body)
    }
    return (
        <button className={classNameButton} type='button' onClick={() => setShowConfirm(true)} disabled={disabled}>
            {children}
        </button>
    )
}
