import React from 'react'
import { FaFire } from "react-icons/fa";
import { GiChiliPepper } from 'react-icons/gi';
import { PiPlantFill } from 'react-icons/pi';

// Dùng chung cho cả form lẫn hiển thị menu
// Đặt ở: utils/tagConfig.js  (hoặc constant/tagConfig.js)

export const TAG_CONFIG = {
    "New": {
        render: (haveName) => (
            <div className="flex items-center gap-2 text-sm md:text-base">
                <p className='px-2 py-[2px] rounded bg-primary w-max tracking-wide font-medium text-white'>New</p>
                {haveName && <p className='text-secondary '>Mới</p>}
            </div>
        ),
    },
    "Cay": {
        render: (haveName) => (
            <div className="flex items-center gap-2 ">
                <GiChiliPepper className='text-xl md:text-2xl text-primary' />
                {haveName && <p className='text-sm text-secondary md:text-base'>Cay</p>}
            </div>
        ),
    },
    "Chay": {
        render: (haveName) => (
            <div className="flex items-center gap-2">
                <PiPlantFill className='text-xl text-green-600 md:text-2xl' />
                {haveName && <span className='text-sm text-secondary md:text-base '>Chay</span>}
            </div>
        ),
    },
    "Best Seller": {
        render: (haveName) => (
            <div className="flex items-center gap-2">
                <FaFire className='text-xl md:text-2xl text-amber-400' />
                {haveName && <span className='text-sm text-secondary md:text-base '>Bán chạy</span>}
            </div>
        ),
    },
};

// Fallback cho tag tự tạo
export function RenderTag({ tag, index, haveName }) {
    const config = TAG_CONFIG[tag];
    if (config) {
        return <div key={index}>{config.render(haveName)}</div>;
    }
    // custom tag — dùng màu primary như cũ
    return (
        <div key={index} className='flex items-center gap-2 text-sm md:text-base'>
            <div className="px-2 py-[2px]  text-white rounded bg-purple-500 w-max tracking-wide font-medium ">
                {tag}
            </div>
            {haveName && <p className='text-secondary '>{tag}</p>}
        </div>
    );
}