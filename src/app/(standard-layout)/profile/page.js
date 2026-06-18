"use client";
import UserForm from "@/modules/users/UserForm";
import UserTabs from "@/components/layout/UserTabs";
import { API_PROFILE, API_UPLOAD_IMAGE } from "@/constant/constant";
import { LOGIN_ROUTE } from "@/constant/routesApp";
import { useFormValidate } from "@/hooks/useFormValidate";
import { createValidators } from "@/libs/validators";
import HeaderCart from "@/modules/cart/HeaderCart";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import UserPointRewards from "@/components/layout/UserPointRewards";
import { useTranslations } from "next-intl";

const ProfilePage = () => {
  const session = useSession();
  const router = useRouter();
  const sTrans = useTranslations("System");
  const t = useTranslations("Validation");
  const validators = createValidators(t);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusAccount, setstatusAccount] = useState("");
  const [profileFetched, setProfileFetched] = useState(false);
  const { status, update } = session;
  const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();
  const [loadingForm, setLoadingForm] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      fetch(API_PROFILE).then((response) => {
        response.json().then((data) => {
          setUser(data);
          setIsAdmin(data.admin);
          setstatusAccount(data.status);
          setProfileFetched(true);
        });
      });
    }
  }, [session, status]);
  if (status === "unauthenticated") {
    router.push(LOGIN_ROUTE);
    return null;
  }
  if (status === "authenticated" && statusAccount === "on") {
    router.push(LOGIN_ROUTE);
    return null;
  }
  if (status === "loading" || !profileFetched) {
    return "Loading...";
  }

  const handleProfileInfoUpdate = async (e, data, pendingFile) => {
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

    // Bước 3: Lưu profile
    const savingPromise = new Promise(async (resolve, reject) => {
      const response = await fetch(API_PROFILE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, image: finalImage }),
      });
      if (response.ok) {
        await update({ name: data.name });
        setUser(prev => ({ ...prev, ...data, image: finalImage }));
        setLoadingForm(false);
        resolve();
      } else {
        const errorData = await response.json().catch(() => null);
        setLoadingForm(false);
        reject(errorData);
      }

    });
    await toast.promise(savingPromise, {
      loading: "Đang lưu...",
      success: "Lưu thông tin thành công",
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
  return (
    <section className="">
      <HeaderCart text={sTrans("Tài khoản")} className={"top-[70px]"} />
      <div className="block md:hidden">
        <UserPointRewards />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <UserTabs isAdmin={isAdmin}></UserTabs>

        <div className="col-span-2">
          <UserForm title={`${sTrans("Hồ sơ của tôi2")} ${isAdmin ? "(Admin)" : ""}`} user={user} onSave={handleProfileInfoUpdate} errors={errors} registerRef={registerRef}
            clearError={clearError} loadingForm={loadingForm} />
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
