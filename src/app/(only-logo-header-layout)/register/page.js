"use client";
import ButtonPrimary from "@/components/buttons/ButtonPrimary";
import ValidatedInput from "@/components/input/ValidatedInput";
import Loader from "@/components/loading/Loader";
import { API_REGISTER } from "@/constant/constant";
import { HOME_ROUTE, LOGIN_ROUTE } from "@/constant/routesApp";
import { useFormValidate } from "@/hooks/useFormValidate";
import { validators } from "@/libs/validators";
import HeaderCart from "@/modules/cart/HeaderCart";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [error, setError] = useState(false);
  const { errors, registerRef, handleValidate, clearError } = useFormValidate();
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoginInProgress(true);
    const isValid = handleValidate({
      email: {
        value: email,
        rules: [validators.required("email"), validators.email],
      },
      password: {
        value: password,
        rules: [validators.required("mật khẩu"), validators.minLength(6),validators.passwordStrength(2)],
      },
      confirmPassword: {
        value: confirmPassword,
        rules: [
          validators.required("xác nhận mật khẩu"),
          validators.matchField(password), 
        ],
      },
    });
    setLoginInProgress(false);
    if (!isValid) return;
    setLoginInProgress(true);
    const response = await fetch(API_REGISTER, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      setLoginInProgress(false);
    } else {
      setLoginInProgress(false);
      setError(true);
    }

  };
  return (
    <section className="">
      <HeaderCart text="Tạo tài khoản" urlLink={LOGIN_ROUTE}></HeaderCart>
      {/* 
      {userCreated && (
        <div className="my-4 text-center">
          User created.
          <br /> Now you can{" "}
          <Link href={LOGIN_ROUTE} className="underline">
            Login &raquo;
          </Link>
        </div>
      )} */}
      <div className="p-4 mt-8 border rounded-2xl w-[510px] mx-auto">
        <form className="mx-auto " onSubmit={handleFormSubmit}>
          <ValidatedInput
            label="Email"
            name="email"
            value={email || ""}
            inputRef={registerRef("email")}
            error={errors.email}
            placeholder="Nhập email của bạn"
            disabled={loginInProgress}
            onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
          />
          <ValidatedInput
            label="Mật khẩu"
            name="password"
            type="password"
            value={password || ""}
            inputRef={registerRef("password")}
            error={errors.password}
            placeholder="Nhập mật khẩu của bạn"
            disabled={loginInProgress}
            onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
          />
          <ValidatedInput
            label="Nhập lại mật khẩu"
            name="confirmPassword"
            type="password"
            value={confirmPassword || ""}
            inputRef={registerRef("confirmPassword")}
            error={errors.confirmPassword}
            placeholder="Nhập lại mật khẩu của bạn"
            disabled={loginInProgress}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
          />
          <ButtonPrimary className={"mt-4 flex items-center justify-center h"} disabled={loginInProgress} type="submit">
            {loginInProgress ? <Loader size={22} /> : <span>Đăng ký</span>}
          </ButtonPrimary>
        </form>
        <p className="mt-4 text-sm text-center">Đã có tài khoản? <Link className="underline text-primary" href={LOGIN_ROUTE}>Đăng nhập</Link></p>
        <div className="flex items-center justify-center gap-2 my-4 text-sm text-center text-gray-500" >
          <div className="w-20 h-[1px] bg-gray-200"></div>
          hoặc đăng nhập bằng
          <div className="w-20 h-[1px] bg-gray-200"></div>
        </div>
        <button
          type="button"
          disabled={loginInProgress}
          onClick={() => signIn("google", { callbackUrl: HOME_ROUTE, prompt: "select_account" })}
          className="flex justify-center w-full h-12 gap-4 py-3 font-medium text-center border rounded-md hover:opacity-80 hover:scale-[1.02] duration-500"
        >
          <Image src={"/google.png"} alt={""} width={24} height={24} />
          Đăng nhập bằng Google
        </button>
      </div>
    </section>
  );
};

export default RegisterPage;
