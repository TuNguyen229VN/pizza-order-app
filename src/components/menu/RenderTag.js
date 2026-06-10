import React from 'react'

// Dùng chung cho cả form lẫn hiển thị menu
// Đặt ở: utils/tagConfig.js  (hoặc constant/tagConfig.js)

export const TAG_CONFIG = {
    "New": {
        render: () => (
            <div className="px-2 py-[2px] mt-1 text-white rounded bg-primary w-max tracking-wide font-medium">
                New
            </div>
        ),
    },
    "Cay": {
        render: () => (
            <div className="px-3 py-[2px] mt-1 text-white rounded bg-red-600 w-max tracking-wide font-medium">
                <span>Cay</span>
            </div>
        ),
    },
    "Chay": {
        render: () => (
            <div className="px-2 py-[2px] mt-1 text-white rounded bg-green-500 w-max tracking-wide font-medium">
                <span>Chay</span>
            </div>
        ),
    },
    "Best Seller": {
        render: () => (
            <div className="px-2 py-[2px] mt-1 text-white rounded bg-amber-500 w-max tracking-wide font-medium">
                <span>Best Seller</span>
            </div>
        ),
    },
};

// Fallback cho tag tự tạo
export function RenderTag({ tag, index }) {
    const config = TAG_CONFIG[tag];
    if (config) {
        return <div key={index}>{config.render()}</div>;
    }
    // custom tag — dùng màu primary như cũ
    return (
        <div key={index} className="px-2 py-[2px] mt-1 text-white rounded bg-purple-500 w-max tracking-wide font-medium ">
            {tag}
        </div>
    );
}