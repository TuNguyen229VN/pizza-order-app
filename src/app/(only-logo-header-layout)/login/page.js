"use client";
import ButtonPrimary from "@/components/buttons/ButtonPrimary";
import ValidatedInput from "@/components/input/ValidatedInput";
import Thumbnail from "@/components/layout/Thumbnail";
import Loader from "@/components/loading/Loader";
import { FORGOTPASSWORD_ROUTE, HOME_ROUTE, REGISTER_ROUTE } from "@/constant/routesApp";
import { useFormValidate } from "@/hooks/useFormValidate";
import { validators } from "@/libs/validators";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);
  const { errors, registerRef, handleValidate, clearError } = useFormValidate();
  const [error, setError] = useState("")
  async function handleFormSubmit(e) {
    e.preventDefault();
    setError("");
    setLoginInProgress(true);
    const isValid = handleValidate({
      email: {
        value: email,
        rules: [validators.required("email"), validators.email],
      },
      password: {
        value: password,
        rules: [validators.required("mật khẩu")],
      },
    });
    setLoginInProgress(false);
    if (!isValid) return;
    setLoginInProgress(true)
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get("callbackUrl") || HOME_ROUTE;
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      if (result.error === "AccountBlocked") {
        setError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.");
      }
      else if (result.error === "CredentialsSignin") {
        setError("Email hoặc mật khẩu đăng nhập không hợp lệ. Vui lòng thử lại.");
      } else {
        setError("Đã xảy ra lỗi hệ thống");
      }
      setLoginInProgress(false);
      return
    }
    setLoginInProgress(false);
    router.push(callbackUrl);
  }
  return (
    <section className="mb-8">
      <Thumbnail />
      <div className="p-4 md:p-0">
        <div className="p-4 -mt-16 bg-white md:mt-8 border rounded-2xl md:w-[510px] mx-auto shadow-sm relative">
          {error && <p className="px-20 mb-4 text-sm text-center text-primary">{error}</p>}
          <form className="mx-auto " method="post" onSubmit={handleFormSubmit}>
            <ValidatedInput
              id="email"
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
            <Link href={FORGOTPASSWORD_ROUTE} className="flex items-center justify-end w-full mt-4 underline text-primary">Quên mật khẩu</Link>
            <ButtonPrimary className={"mt-4 flex items-center justify-center h"} disabled={loginInProgress} type="submit">
              {loginInProgress ? <Loader size={22} /> : <span>Đăng nhập</span>}
            </ButtonPrimary>
          </form>
          <p className="mt-4 text-sm text-center">Bạn chưa có tài khoản? <Link className="underline text-primary" href={REGISTER_ROUTE}>Tạo tài khoản</Link></p>
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
      </div>

    </section>
  );
};

export default LoginPage;
