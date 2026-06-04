import { KEYWORDS } from '@/constant/constant';
import Image from 'next/image';
import React from 'react'

export default function ComboChoosedList({ comboChooseList }) {
    console.log("comboChooseList: ", comboChooseList);
    return (
        <div className="grid grid-cols-1 gap-4 p-4 bg-gray-100 rounded-2xl md:grid-cols-2">
            {comboChooseList.map((item, index) => (
                <div
                    key={item._id}
                    className={`flex h-[156px] md:h-[182px] border md:rounded-2xl cursor-pointer overflow-hidden group transition duration-300  rounded-2xl bg-white `}
                >
                    {/* Ảnh */}
                    <div className={`w-[130px]  lg:w-[220px] h-full shrink-0 overflow-hidden relative`}>
                        <Image
                            src={item.menuItem.image}
                            alt={item.menuItem.name}
                            fill
                            className={`transition-transform duration-500  ${KEYWORDS.some(keyword =>
                                item.menuItem.name?.toLowerCase().includes(keyword)
                            ) ? "object-contain scale-[1.4] " : "object-cover scale-100"} `}
                            style={
                                KEYWORDS.some(keyword =>
                                    item.menuItem.name?.toLowerCase().includes(keyword)
                                ) ? { objectPosition: "left center", top: "20%", left: "-30%" } : {}
                            }
                        />
                    </div>
                    <div className='flex flex-col justify-between flex-1 w-full p-4 pl-2'>
                        <div>
                            <h4 className={`md:text-2xl text-sm md:leading-[30px] capitalize  line-clamp-2 font-bold`}>{item.menuItem.name}</h4>
                            <p className='text-sm text-secondary line-clamp-1'>{item.menuItem.description}</p>
                        </div>
                        <div className='flex items-center justify-between w-full'>
                            <div>
                                <p className={`font-medium  md:text-base mt-1 text-sm `}>{(item.menuItem.basePrice + (item.menuItem.sizes?.[0]?.price || 0)).toLocaleString('vi-VN')}<span className='ml-2 underline'>đ</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
