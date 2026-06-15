import { METHODS } from '@/constant/constant';
import { ORDERS_ROUTE } from '@/constant/routesApp'
import { dbTimeForHuman } from '@/libs/datetime'
import Link from 'next/link'
import React from 'react'
import { HiDotsHorizontal } from "react-icons/hi";
import { HiArrowRight } from 'react-icons/hi2';

export default function OrderTable({ orders, loadingForm = false }) {
    return (
        <>
            <div className="relative overflow-x-auto">
                <table className="text-left md:w-full">
                    <thead className="bg-surface border-b border-outline-variant text-[12px] font-bold text-secondary uppercase tracking-wider">
                        <tr>
                            <th className="px-5 py-4"><p className='w-max'>Mã đơn hàng</p></th>
                            <th className="px-5 py-4">Khách hàng</th>
                            <th className="px-5 py-4">Đơn hàng</th>
                            <th className="px-5 py-4">Ngày đặt hàng</th>
                            <th className="px-5 py-4">Thanh toán</th>
                            <th className="px-5 py-4">Phương thức</th>
                            <th className="px-5 py-4">Loại đơn</th>
                            <th className="sticky right-0 z-10 px-5 py-4 text-right bg-white "><p className='w-max'>Thao tác</p></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-body-md">
                        {orders?.length > 0 ?
                            orders.map((order) => (
                                <tr className="transition-colors hover:bg-surface-container-low group" key={order?._id}>
                                    <td className="px-5 py-4">
                                        <p className={`w-[250px] line-clamp-1 break-all overflow-hidden ${order?.paid ? 'text-green-700' : 'text-red-500'}`} title={order?._id || "ID trống"}>
                                            {order?._id || <span className='italic text-secondary'>ID trống</span>}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 text-on-surface ">
                                        <div className='flex flex-col gap-2'>
                                            <p className="w-[150px] line-clamp-1 break-all overflow-hidden" title={order?.userName || "Không tên"}>
                                                {order?.userName || <span className='italic text-secondary'>Không tên</span>}
                                            </p>
                                            <p className="w-[150px] line-clamp-1 break-all overflow-hidden text-xs text-secondary" title={order?.phone}>
                                                {order?.phone}
                                            </p>
                                            <p className="w-[150px] line-clamp-1 break-all overflow-hidden text-xs text-secondary" title={order?.userEmail}>
                                                {order?.userEmail}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="w-[150px] line-clamp-1 break-all overflow-hidden text-sm" >{order.cartProducts.map(p => p.name).join(', ')}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="w-[200px] line-clamp-1 break-all overflow-hidden" title={dbTimeForHuman(order.createdAt)}>
                                            {dbTimeForHuman(order.createdAt)}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className={`text-center rounded-lg w-[150px] p-2 line-clamp-1 break-all overflow-hidden font-medium ${order.paid ? 'text-green-700 bg-green-200' : 'text-red-500 bg-red-200'}`} title={order.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}>
                                            {order.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}

                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className='w-[100px]'>
                                           {METHODS.find(m => m.value === order?.paymentMethod)?.label ?? order?.paymentMethod}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className='w-[100px]'>
                                            {order?.deliveryInfo?.mode === "delivery" ? "Giao hàng" : "Mua mang về"}
                                        </p>
                                    </td>
                                    <td className="sticky right-0 z-10 px-6 py-4 text-right bg-white ">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`${ORDERS_ROUTE}/${order._id}?from=orders`} className={`transition-colors text-secondary hover:text-primary ${loadingForm ? "opacity-50 cursor-not-allowed" : ""}`} ><HiDotsHorizontal className="w-5 h-5" title="Chi tiết" /></Link>
                                        </div>
                                    </td>
                                </tr>
                            )): (
                            <tr>
                                <td colSpan={8} className="py-4 italic text-center text-secondary">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
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
