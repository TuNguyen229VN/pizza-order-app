import CloseIcon from '@/components/icons/CloseIcon'
import React from 'react'

export default function ComboNote({ noteOrder, setNoteOrder }) {
    return (
        <div className="px-4 mt-6 md:px-0">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium md:font-semibold">Ghi chú (tùy chọn)</h3>
                <span className="text-xs md:text-sm whitespace-nowrap">{noteOrder?.length}/72</span>
            </div>
            <div className="relative">
                <input
                    type="text"
                    maxLength={72}
                    placeholder="Chúng tôi sẽ cố gắng hết sức để phục vụ bạn nếu có thể!"
                    value={noteOrder}
                    onChange={e => setNoteOrder(e.target.value)}
                    className="flex-1 w-full px-4 py-3 pr-10 border rounded-lg outline-none focus:border-black"
                />
                {noteOrder?.length > 0 && <button className="absolute p-[1px] border rounded-full right-3 top-2/4 -translate-y-2/4 cursor-pointer" onClick={() => setNoteOrder("")}><CloseIcon className="w-4 h-4" /></button>}
            </div>
        </div>
    )
}
