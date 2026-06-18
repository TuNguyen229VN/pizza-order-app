import ChevronRight from '@/components/icons/ChevronRight';
import { KEYWORDS } from '@/constant/constant';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react'

export default function ComboChoosedList({ chooseTabIndex, setChooseTabIndex, combos, categories, comboChooseList, onClick }) {
    const sTrans = useTranslations("System");
    const hTrans = useTranslations("HomePage")
    return (
        <div className="grid grid-cols-1 gap-4 p-4 bg-gray-100 rounded-2xl md:grid-cols-2">
            {combos.slots.map((item, index) => {
                const selectedItems = comboChooseList.filter(
                    choose => choose.slotIndex === index && choose.menuItem.category === item.category
                );
                const totalQuantity = selectedItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );
                return (
                    <div
                        key={item._id}
                        className={`flex h-[156px] md:h-[182px] border md:rounded-2xl cursor-pointer overflow-hidden group transition duration-300  rounded-2xl bg-white `}
                        onClick={() => {
                            setChooseTabIndex(selectedItems[0]?.slotIndex);
                            onClick();
                        }}
                    >
                        {/* Ảnh */}
                        <div className={`w-[130px]  lg:w-[220px] h-full shrink-0 overflow-hidden relative`}>
                            <Image
                                src={selectedItems[0]?.menuItem.image}
                                alt={selectedItems[0]?.menuItem.name}
                                fill
                                className={`transition-transform duration-500  ${KEYWORDS.some(keyword =>
                                    selectedItems[0]?.menuItem.name?.toLowerCase().includes(keyword)
                                ) ? "object-contain scale-[1.4] " : "object-cover scale-100"} `}
                                style={
                                    KEYWORDS.some(keyword =>
                                        selectedItems[0]?.menuItem.name?.toLowerCase().includes(keyword)
                                    ) ? { objectPosition: "left center", top: "20%", left: "-20%" } : {}
                                }
                            />
                        </div>
                        <div className='flex flex-col justify-between flex-1 w-full p-4 pl-2'>
                            <div>
                                <h4 className={`md:text-2xl text-sm md:leading-[30px] capitalize  line-clamp-2 font-bold`}>{sTrans("ChọnSelect")} <span className='lowercase'>{hTrans(
                                    categories.find(c => c._id === item.category)?.name,
                                    {
                                        defaultValue: categories.find(c => c._id === item.category)?.name
                                    }
                                )}</span>  ({totalQuantity}/{item.quantity})</h4>
                                <p className='text-sm text-secondary line-clamp-1'>
                                    {
                                        selectedItems.map((choose, idx) => (<span key={`${choose.slotIndex}-${choose.menuItem._id}-${idx}`}>{choose.menuItem.name} x {choose.quantity}{idx < selectedItems.length - 1 ? ", " : ""} </span>))
                                    }
                                </p>
                            </div>
                            <div className='flex items-center justify-between w-full'>
                                <div>
                                    <p className={`font-medium  md:text-base mt-1 text-sm `}>0<span className='ml-2 underline'>đ</span></p>
                                </div>
                                <ChevronRight className='w-5 h-5 text-gray-400 ' />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
