"use client";
import DeleteButton from '@/components/buttons/DeleteButton';
import ArrowLeft from '@/components/icons/ArrowLeft';
import Left from '@/components/icons/Left';
import EditTableImage from '@/components/layout/EditTableImage';
import MenuItemForm from '@/modules/menu-items/MenuItemForm';
import UserTabs from '@/components/layout/UserTabs';
import ConfirmPopup from '@/components/popup/ConfirmPopup';
import UseProfile from '@/components/UseProfile';
import { API_MENU_ITEMS, API_UPLOAD_IMAGE } from '@/constant/constant';
import { MENU_ITEMS_ROUTE } from '@/constant/routesApp';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import { useFormValidate } from '@/hooks/useFormValidate';
import { createValidators } from '@/libs/validators';
import { MenuItem } from '@/models/MenuItem';
import HeaderCart from '@/modules/cart/HeaderCart';
import Link from 'next/link';
import { redirect, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { uploadImage } from '@/libs/uploadImage';
import { useTranslations } from 'next-intl';
import LoadingCat from '@/components/loading/LoadingCat';

export default function EditMenuItemPage() {
    const { id } = useParams();
    const { loading: profileLoading, data: profileData } = UseProfile();
    const sTrans = useTranslations("System");
    const t = useTranslations("Validation");
    const validators = createValidators(t);
    const [menuItem, setMenuItem] = useState(null)
    const [redirectToItems, setRedirectToItems] = useState(false)
    const [loadingForm, setLoadingForm] = useState(false)

    const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();

    useEffect(() => {
        fetch(`${API_MENU_ITEMS}?all=true`).then(response => {
            response.json().then(items => {
                const item = items.menuItems.find(i => i._id === id);
                if (item) {
                    setMenuItem(item);
                }
            })
        })

    }, [id])

    const handleDeleteClick = async () => {
        const promise = new Promise(async (resolve, reject) => {
            const response = await fetch(`${API_MENU_ITEMS}?_id=${id}`, {
                method: "DELETE",
            })
            if (response.ok) {
                resolve();
            } else {
                reject();
            }
            await toast.promise(promise, {
                loading: "Đang xóa...",
                success: "Đã xóa món ăn",
                error: "Lỗi khi xóa món ăn",
            });

            setRedirectToItems(true);
        })
    }


    const handleFormSubmit = async (e, formData, pendingFile) => {
        e.preventDefault();

        if (loadingForm) return;
        setLoadingForm(true);

        // Build dynamic rules cho sizes và extraIngredientPrices
        const dynamicFields = {};

        formData.sizes.forEach((item, i) => {
            dynamicFields[`sizes_${i}_name`] = {
                value: item.name,
                rules: [validators.required("tên size")],
            };
            dynamicFields[`sizes_${i}_price`] = {
                value: item.price,
                rules: [validators.required("giá"), validators.isNumber("Giá cơ bản"), validators.minValue(1000), validators.maxValue(100000000)],
            };
        });

        formData.extraIngredientPrices.forEach((item, i) => {
            dynamicFields[`extraIngredientPrices_${i}_name`] = {
                value: item.name,
                rules: [validators.required("tên topping")],
            };
            dynamicFields[`extraIngredientPrices_${i}_price`] = {
                value: item.price,
                rules: [validators.required("giá"), validators.isNumber("Giá cơ bản"), validators.minValue(1000), validators.maxValue(100000000)],
            };
        });


        const isValid = handleValidate({
            name: {
                value: formData?.name,
                rules: [validators.required("tên món ăn"), validators.minLength(2), validators.maxLength(200)],
            },
            description: {
                value: formData?.description,
                rules: [validators.required("mô tả"), validators.minLength(2), validators.maxLength(200)],
            },
            basePrice: {
                value: formData?.basePrice,
                rules: [validators.required("giá cơ bản"), validators.isNumber("Giá cơ bản"), validators.minValue(1000), validators.maxValue(100000000)],
            },
            category: {
                value: formData?.category,
                rules: [validators.requiredSelect("danh mục")],
            },
            status: {
                value: formData?.status,
                rules: [validators.requiredSelect("trạng thái")],
            },
            image: {
                value: pendingFile || formData.image, // ✅ check cả file mới lẫn ảnh cũ
                rules: [validators.required("ảnh món ăn")],
            },

            ...dynamicFields,
        });
        setLoadingForm(false);
        if (!isValid) return;
        setLoadingForm(true);

        let finalImage = formData.image;
        if (pendingFile) {
            try {
                finalImage = await uploadImage(pendingFile);
            } catch (error) {
                setLoadingForm(false);
                toast.error(error.message);
                return;
            }
        }

        const data = { _id: id, ...formData };
        const savingPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(API_MENU_ITEMS, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...data, image: finalImage }),
                });
                if (response.ok) {
                    setMenuItem(prev => ({ ...prev, ...data, image: finalImage }));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    resolve();
                } else {
                    const errorData = await response.json().catch(() => null);
                    reject(errorData);
                }

            } catch (error) {
                reject(error);
            } finally {
                setLoadingForm(false);
            }

        });
        await toast.promise(savingPromise, {
            loading: "Đang cập nhật...",
            success: "Cập nhật thành công",
            error: (err) => {
                // Xử lý lỗi validation từ server
                if (err?.errors && typeof err.errors === 'object') {
                    // ✅ Dùng setErrors để trigger re-render
                    setErrors(prev => ({
                        ...prev,
                        ...err.errors // merge lỗi server vào errors hiện tại
                    }));
                    return err?.message || "Dữ liệu không hợp lệ";
                }
                return err?.message || "Cập nhật thất bại";
            },
        });
    };

    if (redirectToItems) {
        redirect(MENU_ITEMS_ROUTE);
    }

    if (profileLoading) {
           return <div className="mb-[100px]"><LoadingCat /></div>;
    }
    if (!profileData.admin) {
        return "Not an admin";
    }

    return (
        <section className="">
            <HeaderCart text="Chỉnh sửa món ăn" />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profileData.admin}></UserTabs>
                <div className="relative col-span-2">
                    <ContainerProfileLeft title={menuItem?.name || "Món ăn"}>
                        <p className='text-secondary'>ID: {menuItem?._id}</p>
                        <Link href={MENU_ITEMS_ROUTE} className='absolute flex items-center right-4 top-4'><ArrowLeft className='w-5 h-5' /> <span className='ml-1'>{sTrans("Hiển thị tất cả món ăn")}</span></Link>

                        <MenuItemForm onSubmit={handleFormSubmit} menuItem={menuItem} errors={errors} registerRef={registerRef}
                            clearError={clearError} loadingForm={loadingForm}></MenuItemForm>
                        <div className='flex items-center justify-center w-full p-4 mt-6 text-lg font-medium rounded-lg hover:bg-gray-200'>
                            <ConfirmPopup onDelete={handleDeleteClick} label={sTrans("Xóa món ăn")} classNameButton='w-full'>
                                <p >{sTrans("Xóa món ăn")}</p>
                            </ConfirmPopup>
                        </div>
                    </ContainerProfileLeft>
                </div>
            </div>
        </section>
    )
}
