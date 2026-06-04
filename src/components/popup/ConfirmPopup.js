import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import React, { useState } from 'react'
import { createPortal } from 'react-dom';

export default function ConfirmPopup({ children, onDelete, label = "Xóa món", labelConfirm = "Xác nhận", classNameButton = "", labelDesc = "", disabled = false }) {
    const [showConfirm, setShowConfirm] = useState(false);
    useLockBodyScroll(showConfirm);
    if (showConfirm) {
        return createPortal(
            <div className='fixed inset-0 z-50 flex items-center justify-center h-full bg-black/80'>
                <div className="flex flex-col items-center justify-center p-6 text-base bg-white shadow-lg rounded-2xl max-w-[960px] w-[345px]">
                    <p className='font-semibold text-center'>{label}</p>
                    <div className='w-1/3 h-1 mt-2 mb-4 rounded-lg bg-primary'></div>
                    <div className="text-sm font-normal text-center">{label.includes("Thoát")?labelDesc:"Bạn có muốn "}{!label.includes("Thoát")&&<span className='lowercase'>{labelDesc ? labelDesc : label}</span>} này không?</div>
                    <div className='flex gap-4 mt-4'>
                        <button className='px-6 py-3 outline-none border rounded-lg w-[125px] hover:opacity-80 hover:scale-[1.02]  duration-500 hover:bg-red-100 hover:text-secondary' onClick={() => setShowConfirm(false)}>Hủy</button>
                        <button className='px-6 py-3 text-white rounded-lg bg-primary w-[125px] hover:opacity-80 hover:scale-[1.02] duration-500' onClick={() => {
                            setShowConfirm(false);
                            onDelete();
                        }}>{labelConfirm}</button>
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
