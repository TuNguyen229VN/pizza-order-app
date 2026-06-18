"use client"
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ValidatedInput from '@/components/input/ValidatedInput';
import UserTabs from '@/components/layout/UserTabs'
import Loader from '@/components/loading/Loader';
import UseProfile from '@/components/UseProfile';
import { API_CHANGE_PASSWORD } from '@/constant/constant';
import { LOGIN_ROUTE } from '@/constant/routesApp';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import { useFormValidate } from '@/hooks/useFormValidate';
import { createValidators } from '@/libs/validators';
import HeaderCart from '@/modules/cart/HeaderCart';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
    const session = useSession();
    const router = useRouter();
    const { status, data } = session;
    const { loading, data: profile } = UseProfile();
    const sTrans = useTranslations("System");
    const t = useTranslations("Validation");
    const validators = createValidators(t);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loadingForm, setLoadingForm] = useState(false)

    const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();
    if (status === "unauthenticated") {
        router.push(LOGIN_ROUTE);
        return null;
    }
    if (status === "authenticated" && data?.user?.status === "on") {
        router.push(LOGIN_ROUTE);
        return null;
    }
    if (status === "loading") {
        return "Loading...";
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loadingForm) return;
        // setError("");
        setLoadingForm(true);
        // setUserCreated(false);
        const isValid = handleValidate({
            currentPassword: {
                value: currentPassword,
                rules: [validators.required("mật khẩu")],
            },
            newPassword: {
                value: newPassword,
                rules: [validators.required("mật khẩu"), validators.minLength(6), validators.passwordStrength(2)],
            },
            confirmNewPassword: {
                value: confirmNewPassword,
                rules: [
                    validators.required("xác nhận mật khẩu"),
                    validators.matchField(newPassword),
                ],
            },
        });

        if (!isValid) {
            setLoadingForm(false);
            return;
        }

        const savingPromise = new Promise(async (resolve, reject) => {
            const response = await fetch(API_CHANGE_PASSWORD, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (response.ok) {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                clearError("currentPassword");
                clearError("newPassword");
                clearError("confirmNewPassword");
                setLoadingForm(false);
                resolve();
            } else {
                const errorData = await response.json().catch(() => null);
                setLoadingForm(false);
                reject(errorData);
            }

        });

        await toast.promise(savingPromise, {
            loading: "Đang cập nhật...",
            success: "Đổi mật khẩu thành công",
            error: (err) => {
                if (err?.errors && typeof err.errors === 'object') {
                    setErrors(prev => ({
                        ...prev,
                        ...err.errors
                    }));
                    return err?.message || "Dữ liệu không hợp lệ";
                }
                return err?.message || "Đổi mật khẩu thất bại";
            },
        });
    }
    return (
        <section>
            <HeaderCart text="Tài khoản" className={"top-[70px]"} />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profile.admin}></UserTabs>

                <div className="col-span-2">
                    <ContainerProfileLeft title={"Đổi mật khẩu"}>
                        <form id='user-form' className="grow" onSubmit={handleSubmit}>
                            <ValidatedInput
                                label="Mật khẩu hiện tại"
                                name="currentPassword"
                                type="password"
                                value={currentPassword || ""}
                                inputRef={registerRef("currentPassword")}
                                error={errors.currentPassword}
                                placeholder="Nhập mật khẩu hiện tại"
                                disabled={loadingForm}
                                onChange={(e) => { setCurrentPassword(e.target.value); clearError("currentPassword"); }}
                            />
                            <ValidatedInput
                                label="Mật khẩu mới"
                                name="newPassword"
                                type="password"
                                value={newPassword || ""}
                                inputRef={registerRef("newPassword")}
                                error={errors.newPassword}
                                placeholder="Bao gồm chữ cái, số và ký tự đặc biệt"
                                disabled={loadingForm}
                                onChange={(e) => { setNewPassword(e.target.value); clearError("newPassword"); }}
                            />
                            <ValidatedInput
                                label="Nhập lại mật khẩu mới"
                                name="confirmNewPassword"
                                type="password"
                                value={confirmNewPassword || ""}
                                inputRef={registerRef("confirmNewPassword")}
                                error={errors.confirmNewPassword}
                                placeholder="Nhập lại mật khẩu mới"
                                disabled={loadingForm}
                                onChange={(e) => { setConfirmNewPassword(e.target.value); clearError("confirmNewPassword"); }}
                            />
                            <ButtonPrimary className={"mt-4 flex items-center justify-center mr-0 mx-auto !w-[150px]"} disabled={loadingForm} type="submit">
                                {loadingForm ? <Loader size={22} /> : <span>Lưu</span>}
                            </ButtonPrimary>
                        </form>
                    </ContainerProfileLeft>
                </div>
            </div>
        </section>
    )
}
