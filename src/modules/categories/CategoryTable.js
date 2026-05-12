import Trash from '@/components/icons/Trash';
import ConfirmPopup from '@/components/popup/ConfirmPopup';
import Image from 'next/image';
import React from 'react'
import { MdOutlineModeEdit } from 'react-icons/md';

export default function CategoryTable({categories, setEditedCategory, setCategoryName, setStatus, clearError, loadingForm, setPendingFile, setPreviewImage, handleCategoryDelete}) {
    return (
        <table className="w-full text-left">
            <thead className="bg-surface border-b border-outline-variant text-[12px] font-bold text-secondary uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4">Hình ảnh</th>
                    <th className="px-6 py-4">Tên danh mục</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md">
                {categories?.length > 0 &&
                    categories.map((category) => (
                        <tr className="transition-colors hover:bg-surface-container-low group" key={category._id}>
                            <td className="px-6 py-4">
                                <Image width={200} height={200} alt="Pizza Thumbnail" className="object-cover w-12 h-12 border rounded border-outline-variant" src={category.image || "/images/noimage.png"} />
                            </td>
                            <td className="px-6 py-4 font-bold text-on-surface ">
                                <p className="w-[100px] line-clamp-1 break-all overflow-hidden" title={category.name}>
                                    {category.name}
                                </p>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-block w-2 h-2 mr-2  rounded-full ${category.status === "on" ? "bg-green-500" : "bg-red-500"}`}></span> {category?.status === "on" ? "Đang kinh doanh" : "Tạm đóng"}
                            </td>
                            <td className="px-6 py-4 text-right">
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
                                    }}><MdOutlineModeEdit className="w-5 h-5" /></button>
                                    <ConfirmPopup disabled={loadingForm} onDelete={() => { handleCategoryDelete(category._id) }}>
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
