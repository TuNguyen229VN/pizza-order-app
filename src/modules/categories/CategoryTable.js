import Trash from '@/components/icons/Trash';
import ConfirmPopup from '@/components/popup/ConfirmPopup';
import SkeletonLoadingBox from '@/components/skeleton/SkeletonLoadingBox';
import { dbTimeForHuman } from '@/libs/datetime';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useState } from 'react'
import { MdOutlineModeEdit } from 'react-icons/md';

export default function CategoryTable({ loadingData, categories, setEditedCategory, setCategoryName, setStatus, clearError, loadingForm, setPendingFile, setPreviewImage, handleCategoryDelete }) {
    const sTrans = useTranslations("System");
    const [loadingImage, setLoadingImage] = useState({});
    return (
        <div className='overflow-x-auto'>
            <table className="w-full text-left">
                <thead className="bg-surface border-b border-outline-variant text-[12px] font-bold text-secondary uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-4 md:px-6"><p className='w-max'>{sTrans("Hình ảnh")}</p></th>
                        <th className="px-4 py-4 md:px-6 "><p className='w-max'>{sTrans("Tên danh mục")}</p></th>
                        <th className="px-4 py-4 md:px-6">{sTrans("Trạng thái")}</th>
                        <th className="px-4 py-4 md:px-6">{sTrans("Ngày tạo")}</th>
                        <th className="sticky right-0 z-10 px-5 py-4 text-right bg-white "><p className='w-max'>{sTrans("Thao tác")}</p></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body-md">
                    {loadingData ? (
                        <tr>
                            <td colSpan={5} className="py-4 italic text-center text-secondary">
                                {sTrans("Đang tải")}
                            </td>
                        </tr>
                    ) : categories?.length > 0 ?
                        categories.map((category) => (
                            <tr className="transition-colors hover:bg-surface-container-low group" key={category._id}>
                                <td className="px-4 py-4 md:px-6">
                                    {!loadingImage[category._id] && <SkeletonLoadingBox className='w-full h-full' />}
                                    <Image width={200} height={200} onLoad={() => setLoadingImage(prev => ({ ...prev, [category._id]: true }))} alt="Pizza Thumbnail" className={`object-cover w-12 h-12 border rounded border-outline-variant ${!loadingImage[category._id] ? "opacity-0" : "opacity-100"}`} src={category.image || "/images/noimage.png"} />
                                </td>
                                <td className="px-4 py-4 md:px-6 text-on-surface ">
                                    <p className="w-[100px] font-bold line-clamp-1 break-all overflow-hidden" title={category.name}>
                                        {category.name}
                                    </p>
                                    <p className="w-[100px] line-clamp-1 break-all overflow-hidden text-sm text-secondary" title={category._id}>
                                        ID: {category._id}
                                    </p>
                                </td>
                                <td className="px-4 py-4 md:px-6">
                                    <div className='flex items-center'>
                                        <span className={`hidden md:inline-block w-2 h-2 mr-2 rounded-full ${category.status === "on" ? "bg-green-500" : "bg-red-500"}`}></span> <span className='truncate'>{category?.status === "on" ? sTrans("Đang kinh doanh") : sTrans("Tạm đóng")}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 md:px-6">
                                    <p className="w-[200px] line-clamp-1 break-all overflow-hidden" title={dbTimeForHuman(category.createdAt)}>
                                        {dbTimeForHuman(category.createdAt)}
                                    </p>
                                </td>
                                <td className="sticky right-0 z-10 px-4 py-4 text-right bg-white md:px-6">
                                    <div className="flex justify-end gap-3">
                                        <button type="button" className={`transition-colors text-secondary hover:text-primary ${loadingForm ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => {
                                            if (loadingForm) return;
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                            clearError("categoryName");
                                            setStatus(category.status);
                                            setEditedCategory(category);
                                            setCategoryName(category.name);
                                            setPendingFile(null);
                                            setPreviewImage(null);
                                        }}><MdOutlineModeEdit className="w-5 h-5" title={sTrans("Chỉnh sửa")} /></button>
                                        <ConfirmPopup disabled={loadingForm} label={`${sTrans("Xóa danh mục")} ${category.name}`} onDelete={() => { handleCategoryDelete(category._id) }} classNameButton='hover:text-primary'>
                                            <p title={sTrans("Xóa danh mục")}>
                                                <Trash className="w-5 h-5" />
                                            </p>
                                        </ConfirmPopup>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="py-4 italic text-center text-secondary">
                                    {sTrans("Không có dữ liệu")}
                                </td>
                            </tr>
                        )}
                </tbody>
            </table>
        </div>
    )
}
