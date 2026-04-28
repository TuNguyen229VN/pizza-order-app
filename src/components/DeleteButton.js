import React from 'react'
import { useState } from 'react'

export default function DeleteButton({ label, onDelete }) {
    const [showConfirm, setShowConfirm] = useState(false);
    if (showConfirm) {
        return (
            <div className='fixed inset-0 flex items-center justify-center h-full bg-black/80'>
                <div className="p-4 bg-white rounded-lg shadow-lg">
                    <div className="">Are you sure you want to delete?</div>
                    <div className='flex gap-2 mt-1'>
                        <button onClick={() => setShowConfirm(false)}>Cancel</button>
                        <button onClick={() => {
                            setShowConfirm(false);
                            onDelete();
                        }} className='primary'>Yes,&nbsp;delete</button>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <button type='button' onClick={() => setShowConfirm(true)}>
            {label}
        </button>
    )
}
