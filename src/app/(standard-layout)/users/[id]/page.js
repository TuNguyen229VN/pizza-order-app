"use client";
import ArrowLeft from '@/components/icons/ArrowLeft';
import UserForm from '@/components/layout/UserForm';
import UserTabs from '@/components/layout/UserTabs'
import UseProfile from '@/components/UseProfile';
import { API_PROFILE, API_UPLOAD_IMAGE, API_USERS } from '@/constant/constant';
import { USERS_ROUTE } from '@/constant/routesApp';
import { useFormValidate } from '@/hooks/useFormValidate';
import { validators } from '@/libs/validators';
import HeaderCart from '@/modules/cart/HeaderCart';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

export default function EditUserPage() {
    const { loading: profileLoading, data: profileData } = UseProfile();
    const [user, setUser] = useState(null);
    const { id } = useParams();
    const { setErrors, errors, registerRef, handleValidate, clearError } = useFormValidate();
    const [loadingForm, setLoadingForm] = useState(false)
    useEffect(() => {
        if (!id) return;
        fetch(`${API_PROFILE}?_id=${id}`).then(res => {
            res.json().then(user => {
                setUser(user);
            })
        })
    }, [id])

    const handleSaveButtonClick = async (e, data, pendingFile) => {
        e.preventDefault();

        if (loadingForm) return;

        setLoadingForm(true)
        const isValid = handleValidate({
            userName: {
                value: data?.name,
                rules: [validators.required("tên"), validators.minLength(2), validators.maxLength(200)],
            },
            gender: {
                value: data?.gender,
                rules: [validators.requiredSelect("giới tính")],
            },
            phone: {
                value: data?.phone,
                rules: [validators.required("số điện thoại"), validators.phone],
            },
            birthday: {
                value: data?.birthday,
                rules: [validators.required("ngày sinh"), validators.pastDate, validators.ageDate(10, 90)],
            },
        });
        setLoadingForm(false);
        if (!isValid) return;
        setLoadingForm(true);
        // Bước 2: Upload ảnh nếu có file mới
        let finalImage = data.image;
        if (pendingFile) {
            const formData = new FormData();
            formData.set("file", pendingFile);
            const uploadRes = await fetch(API_UPLOAD_IMAGE, { method: "POST", body: formData });
            if (!uploadRes.ok) {
                setLoadingForm(false);
                toast.error("Upload ảnh thất bại");
                return;
            }
            const uploadData = await uploadRes.json();
            finalImage = uploadData?.url;
        }

        const savingPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(API_PROFILE, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...data, image: finalImage, _id: id }),
                })
                if (response.ok) {
                    setUser(prev => ({ ...prev, ...data, image: finalImage }));
                    setLoadingForm(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    resolve();
                } else {
                    const errorData = await response.json().catch(() => null);
                    setLoadingForm(false);
                    reject(errorData);
                }
            } catch (error) {
                reject(error)
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

    }

    if (profileLoading) {
        return "Loading user info...";
    }
    if (!profileData.admin) {
        return "Not an admin";
    }

    return (
        <section>
            <HeaderCart text="Tài khoản" />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profileData.admin}></UserTabs>
                <div className="relative col-span-2">
                    <div className='absolute right-4 top-4'>
                        <Link href={USERS_ROUTE} className='flex items-center '><ArrowLeft className='w-5 h-5' /> <span className='ml-1'>Trở lại trang QLND</span></Link>
                        {profileData?.admin && profileData?.email !== user?.email && (
                            <span className={`inline-block mt-4 w-[150px] text-center  px-3 py-1 rounded-full  ${user?.status === "on" ? "bg-red-100 text-red-800" : " bg-green-100 text-green-800"}`}>{user?.status === "on" ? "Bị chặn" : "Đang hoạt động"}</span>
                        )}
                    </div>
                    <UserForm user={user} onSave={handleSaveButtonClick} errors={errors} registerRef={registerRef}
                        clearError={clearError} loadingForm={loadingForm} title={"Hồ sơ của KH"} />
                </div>
            </div>
        </section>
    )
}
