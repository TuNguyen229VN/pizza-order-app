import { MdBlock } from "react-icons/md";
import ConfirmPopup from '@/components/popup/ConfirmPopup'
import { USERS_ROUTE } from '@/constant/routesApp'
import { dbTimeForHuman } from '@/libs/datetime'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { MdOutlineModeEdit } from 'react-icons/md'
import { HiArrowRight, HiLockOpen } from "react-icons/hi2";
import SkeletonLoadingBox from "@/components/skeleton/SkeletonLoadingBox";
import { useTranslations } from "next-intl";

export default function UserTable({ users, loadingForm = false, handleUserBlock }) {
    const [loadingImage, setLoadingImage] = useState({});
    const sTrans = useTranslations("System");
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-surface border-b border-outline-variant text-[12px] font-bold text-secondary uppercase tracking-wider">
                        <tr>
                            <th className="px-5 py-4"><p className='w-max'>{sTrans("Người dùng")}</p></th>
                            <th className="px-5 py-4">{sTrans("Số điện thoại")}</th>
                            <th className="px-5 py-4">{sTrans("Trạng thái")}</th>
                            <th className="px-5 py-4">{sTrans("Ngày tham gia")}</th>
                            <th className="px-5 py-4">{sTrans("Vai trò")}</th>
                            <th className="sticky right-0 z-10 px-5 py-4 text-right bg-white "><p className='w-max'>{sTrans("Thao tác")}</p></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-body-md">
                        {users?.length > 0 ?
                            users.map((user) => (
                                <tr className="transition-colors hover:bg-surface-container-low group" key={user?._id}>
                                    <td className="px-5 py-4">
                                        <div className='flex gap-4'>
                                            <div className='relative w-[80px] h-14'>
                                                {!loadingImage[user?._id] && <SkeletonLoadingBox className='w-full h-full' />}
                                                <Image width={200} height={200} onLoad={() =>
                                                    setLoadingImage(prev => ({
                                                        ...prev,
                                                        [user?._id]: true,
                                                    }))
                                                } alt="Pizza Thumbnail" className={`object-cover w-full h-full border rounded border-outline-variant ${!loadingImage[user?._id] ? "opacity-0" : "opacity-100"}`} src={user?.image || "/images/noimage.png"} />
                                            </div>
                                            <div>
                                                <p className="w-[200px] line-clamp-1 break-all overflow-hidden" title={user?.name || sTrans("Không tên")}>
                                                    {user?.name || <span className='italic text-secondary'>{sTrans("Không tên")}</span>}
                                                </p>
                                                <p className="w-[200px] line-clamp-1 break-all overflow-hidden text-xs text-secondary" title={user?.email}>
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-on-surface ">
                                        <p className="w-[200px] line-clamp-1 break-all overflow-hidden" title={user?.phone || "Chưa có số điện thoại"}>
                                            {user?.phone || <span className='italic text-secondary'>{sTrans("Chưa có số điện thoại")}</span>}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className='w-[180px]'>

                                            <span className={`inline-block  px-3 py-1 rounded-full  ${user?.status === "on" ? "bg-red-100 text-red-800" : " bg-green-100 text-green-800"}`}>{user?.status === "on" ? sTrans("Bị chặn") : sTrans("Đang hoạt động")}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className='text-left w-[200px] line-clamp-1 break-all overflow-hidden font-medium' title={user?.createdAt}>
                                            {dbTimeForHuman(user?.createdAt)}

                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className='w-[100px]'>
                                            {user?.admin ? <span className="p-2 text-blue-800 bg-blue-100 rounded-lg">Admin</span> : sTrans("Khách hàng")}
                                        </p>
                                    </td>
                                    <td className="sticky right-0 z-10 px-6 py-4 text-right bg-white ">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`${USERS_ROUTE}/${user?._id}`} className={`transition-colors text-secondary hover:text-primary ${loadingForm ? "opacity-50 cursor-not-allowed" : ""}`} ><MdOutlineModeEdit className="w-5 h-5" title={sTrans("Chỉnh sửa")} /></Link>
                                            {!user?.admin && <ConfirmPopup disabled={loadingForm} label={`${user?.status === "on" ? sTrans("Bỏ chặn") : sTrans("Chặn")} [${user?.name || "người dùng"}]`} labelConfirm={user?.status === "on" ? sTrans("Bỏ chặn") : sTrans("Chặn")} onDelete={() => { handleUserBlock(user) }} classNameButton='hover:text-primary'>
                                                {user?.status === "on" ? <HiLockOpen className="w-5 h-5" title={sTrans("Chặn người dùng")} /> : <MdBlock className="w-5 h-5" title={sTrans("Bỏ chặn người dùng")} />}
                                            </ConfirmPopup>}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-4 italic text-center text-secondary">
                                        {sTrans("Không có dữ liệu")}
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-end gap-1 my-2 text-sm text-secondary">
                <HiArrowRight className="w-3 h-3 animate-bounce-x" />
                <span>{sTrans("Cuộn sang phải để xem thêm")}</span>
            </div>
        </>
    )
}
