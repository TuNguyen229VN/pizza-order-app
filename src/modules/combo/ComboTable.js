import Trash from '@/components/icons/Trash'
import ConfirmPopup from '@/components/popup/ConfirmPopup'
import { COMBO_EDIT_ROUTE } from '@/constant/routesApp'
import { dbTimeForHuman } from '@/libs/datetime'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { HiArrowRight } from 'react-icons/hi2'
import { MdOutlineModeEdit } from 'react-icons/md'

export default function ComboTable({ comboList, loadingForm, handleComboDelete, menuItems, categories }) {
    const getItemsForMenu = (items) => {
        return items?.map((slot) => {
            const menuItem = menuItems.find(
                (c) => c._id === slot.menuItem?._id
            );
            if (!menuItem) return null;
            return ` ${menuItem.name} ${slot.selectedSize?.name ? ` (${slot.selectedSize.name})` : ""}x${slot.quantity}`;
        })
            .filter(Boolean)
            .join(", ") || "Chưa có"
    }

    const getItemsForSlots = (items) => {
        return items
            ?.map(slot => {
                const category = categories.find(c => c._id === slot.category)
                if (!category) return null;
                return `${category.name} ${slot?.size ? `(${slot.size.name})` : ''} x${slot.quantity}`
            }
            )
            .filter(Boolean)
            .join(", ") || "Chưa có"

    }
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-surface border-b border-outline-variant text-[12px] font-bold text-secondary uppercase tracking-wider">
                        <tr>
                            <th className="px-5 py-4"><p className='w-max'>Hình ảnh</p></th>
                            <th className="px-5 py-4">Tên combo</th>
                            <th className="px-5 py-4">Giá</th>
                            <th className="px-5 py-4">Mô tả</th>
                            <th className="px-5 py-4">Loại combo</th>
                            <th className="px-5 py-4">Trạng thái</th>
                            <th className="px-5 py-4">Ngày tạo</th>
                            <th className="sticky right-0 z-10 px-5 py-4 text-right bg-white "><p className='w-max'>Thao tác</p></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-body-md">
                        {comboList?.length > 0 &&
                            comboList.map((item) => (
                                <tr className="transition-colors hover:bg-surface-container-low group" key={item._id}>
                                    <td className="px-5 py-4">
                                        <div className='relative w-[100px] h-14'>

                                            <Image width={200} height={200} alt="Pizza Thumbnail" className="object-cover w-full h-full border rounded border-outline-variant" src={item.image || "/images/noimage.png"} />
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-on-surface ">
                                        <p className="w-[100px] line-clamp-1 break-all overflow-hidden" title={item.name}>
                                            {item.name}
                                        </p>
                                        <p className="w-[100px] line-clamp-1 break-all overflow-hidden text-sm text-secondary" title={item._id}>
                                            ID: {item._id}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className='text-left w-[100px] line-clamp-1 break-all overflow-hidden font-medium' title={item?.price.toLocaleString()}>
                                            {item?.price.toLocaleString()} <span className='underline'>đ</span>

                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className='w-[160px] text-secondary text-xs line-clamp-3' title={getItemsForSlots(item?.slots)}>
                                            {getItemsForSlots(item?.slots)}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className='w-[160px] ' title={item?.comboType?.name}>
                                            {item?.comboType?.name}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className='w-[180px]'>

                                            <span className={`inline-block  px-3 py-1 rounded-full  ${item.status === "on" ? "bg-green-100 text-green-800" : " bg-red-100 text-red-800"}`}>{item?.status === "on" ? "Đang kinh doanh" : "Tạm đóng"}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="w-[200px] line-clamp-1 break-all overflow-hidden" title={dbTimeForHuman(item.createdAt)}>
                                            {dbTimeForHuman(item.createdAt)}
                                        </p>
                                    </td>
                                    <td className="sticky right-0 z-10 px-6 py-4 text-right bg-white ">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`${COMBO_EDIT_ROUTE}/${item._id}`} className={`transition-colors text-secondary hover:text-primary ${loadingForm ? "opacity-50 cursor-not-allowed" : ""}`}><MdOutlineModeEdit className="w-5 h-5" title='Chỉnh sửa' /></Link>
                                            <ConfirmPopup disabled={loadingForm} label={`Xóa món ${item.name}`} onDelete={() => { handleComboDelete(item._id) }} classNameButton='hover:text-primary'>
                                                <p title='Xóa combo'>
                                                    <Trash className="w-5 h-5" />
                                                </p>
                                            </ConfirmPopup>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-end gap-1 my-2 text-sm text-secondary">
                <HiArrowRight className="w-3 h-3 animate-bounce-x" />
                <span>Cuộn sang phải để xem thêm</span>
            </div>
        </>
    )
}
