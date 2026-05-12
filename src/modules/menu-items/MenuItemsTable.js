import Trash from '@/components/icons/Trash';
import ConfirmPopup from '@/components/popup/ConfirmPopup';
import { MENU_ITEM_EDIT_ROUTE } from '@/constant/routesApp';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { MdOutlineModeEdit } from 'react-icons/md';

export default function MenuItemsTable({ menuItems, loadingForm, handleMenuItemDelete, categories }) {
    return (
        <table className="w-full text-left">
            <thead className="bg-surface border-b border-outline-variant text-[12px] font-bold text-secondary uppercase tracking-wider">
                <tr>
                    <th className="px-5 py-4"><p className='w-max'>Hình ảnh</p></th>
                    <th className="px-5 py-4">Tên món ăn</th>
                    <th className="px-5 py-4">Giá</th>
                    <th className="px-5 py-4">Danh mục</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="sticky right-0 z-10 px-5 py-4 text-right bg-white "><p className='w-max'>Thao tác</p></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md">
                {menuItems?.length > 0 &&
                    menuItems.map((item) => (
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
                                    {item._id}
                                </p>
                            </td>
                            <td className="px-5 py-4">
                                <p className='text-left w-[100px] line-clamp-1 break-all overflow-hidden font-medium' title={item?.basePrice.toLocaleString()}>
                                    {item?.basePrice.toLocaleString()} <span className='underline'>đ</span>

                                </p>
                            </td>
                            <td className="px-5 py-4">
                                <p className='w-[100px]'>
                                    {categories.find(c => c._id === item.category)?.name || "Chưa có"}
                                </p>
                            </td>
                            <td className="px-5 py-4">
                                <div className='w-[180px]'>

                                    <span className={`inline-block  px-3 py-1 rounded-full  ${item.status === "on" ? "bg-green-100 text-green-800" : " bg-red-100 text-red-800"}`}>{item?.status === "on" ? "Đang kinh doanh" : "Tạm đóng"}</span>
                                </div>
                            </td>
                            <td className="sticky right-0 z-10 px-6 py-4 text-right bg-white ">
                                <div className="flex justify-end gap-3">
                                    <Link href={`${MENU_ITEM_EDIT_ROUTE}/${item._id}`} className={`transition-colors text-secondary hover:text-primary ${loadingForm ? "opacity-50 cursor-not-allowed" : ""}`}><MdOutlineModeEdit className="w-5 h-5" /></Link>
                                    <ConfirmPopup disabled={loadingForm} onDelete={() => { handleMenuItemDelete(item._id) }}>
                                        <Trash className="w-5 h-5" />
                                    </ConfirmPopup>
                                </div>
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    )
}
