"use client";
import ArrowLeft from '@/components/icons/ArrowLeft';
import MenuItemForm from '@/modules/menu-items/MenuItemForm';
import UserTabs from '@/components/layout/UserTabs';
import UseProfile from '@/components/UseProfile';
import { API_MENU_ITEMS } from '@/constant/constant';
import { MENU_ITEMS_ROUTE } from '@/constant/routesApp';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import { useFormValidate } from '@/hooks/useFormValidate';
import { createValidators } from '@/libs/validators';
import HeaderCart from '@/modules/cart/HeaderCart';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { uploadImage } from '@/libs/uploadImage';
import { useTranslations } from 'next-intl';
import LoadingCat from '@/components/loading/LoadingCat';
import { getLabel } from '@/utils/i18n-utils';

export default function NewMenuItemPage() {
    const { loading: profileLoading, data: profileData } = UseProfile();
    const sTrans = useTranslations("System");
    const t = useTranslations("Validation");
    const validators = createValidators(t);
    const [redirectToItems, setRedirectToItems] = useState(false)

    const [loadingForm, setLoadingForm] = useState(false)
    const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();


    const handleFormSubmit = async (e, formData, pendingFile) => {
        e.preventDefault();

        if (loadingForm) return;
        setLoadingForm(true);

        // Build dynamic rules cho sizes và extraIngredientPrices
        const dynamicFields = {};

        formData.sizes.forEach((item, i) => {
            dynamicFields[`sizes_${i}_name`] = {
                value: item.name,
                rules: [validators.required(sTrans("tên size"))],
            };
            dynamicFields[`sizes_${i}_price`] = {
                value: item.price,
                rules: [validators.required(sTrans("giá")), validators.isNumber(sTrans("Giá cơ bản")), validators.isNumber(sTrans("Giá")), validators.minValue(1000), validators.maxValue(100000000)],
            };
        });

        formData.extraIngredientPrices.forEach((item, i) => {
            dynamicFields[`extraIngredientPrices_${i}_name`] = {
                value: item.name,
                rules: [validators.required(sTrans("tên topping"))],
            };
            dynamicFields[`extraIngredientPrices_${i}_price`] = {
                value: item.price,
                rules: [validators.required(sTrans("giá")), validators.isNumber(sTrans("Giá cơ bản")), validators.isNumber(sTrans("Giá")), validators.minValue(1000), validators.maxValue(100000000)],
            };
        });


        const isValid = handleValidate({
            name: {
                value: formData?.name,
                rules: [validators.required(sTrans("tên món ăn")), validators.minLength(2), validators.maxLength(200)],
            },
            description: {
                value: formData?.description,
                rules: [validators.required(sTrans("mô tả")), validators.minLength(2), validators.maxLength(200)],
            },
            basePrice: {
                value: formData?.basePrice,
                rules: [validators.required(sTrans("giá cơ bản")), validators.isNumber(sTrans("Giá cơ bản")), validators.minValue(1000), validators.maxValue(100000000)],
            },
            category: {
                value: formData?.category,
                rules: [validators.requiredSelect(sTrans("danh mục"))],
            },
            status: {
                value: formData?.status,
                rules: [validators.requiredSelect(sTrans("trạng thái"))],
            },
            image: {
                value: pendingFile || formData.image, // check cả file mới lẫn ảnh cũ
                rules: [validators.required(sTrans("ảnh món ăn"))],
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
                toast.error(getLabel(sTrans, error.message));
                return;
            }
        }


        const savingPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(API_MENU_ITEMS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, image: finalImage }),
                });
                if (response.ok) {
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
            await toast.promise(savingPromise, {
                loading: sTrans("Đang tạo món ăn"),
                success: sTrans("Tạo món ăn thành công"),
                error: (err) => {
                    // Xử lý lỗi validation từ server
                    if (err?.errors && typeof err.errors === 'object') {
                        // ✅ Dùng setErrors để trigger re-render
                        setErrors(prev => ({
                            ...prev,
                            ...err.errors // merge lỗi server vào errors hiện tại
                        }));
                        return getLabel(sTrans, err?.message) || sTrans("Dữ liệu không hợp lệ");
                    }
                    return getLabel(sTrans, err?.message) || sTrans("Tạo món ăn thất bại");
                },
            });

            setRedirectToItems(true);
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
            <HeaderCart text="Tạo món ăn mới" />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profileData.admin}></UserTabs>
                <div className="relative col-span-2">
                    <ContainerProfileLeft >
                        <Link href={MENU_ITEMS_ROUTE} className='absolute flex items-center right-4 top-4'><ArrowLeft className='w-5 h-5' /> <span className='ml-1'>{sTrans("Hiển thị tất cả món ăn")}</span></Link>
                        <MenuItemForm onSubmit={handleFormSubmit} menuItem={null} errors={errors} registerRef={registerRef}
                            clearError={clearError} loadingForm={loadingForm}></MenuItemForm>
                    </ContainerProfileLeft>
                </div>
            </div>
        </section>
    )
}
