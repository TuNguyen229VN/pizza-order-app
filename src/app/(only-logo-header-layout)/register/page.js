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
import React, { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const RegisterPage = () => {
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userCreated, setUserCreated] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [error, setError] = useState("");
  const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (loginInProgress) return;
    setError("");
    setLoginInProgress(true);
    setUserCreated(false);
    const isValid = handleValidate({
      email: {
        value: email,
        rules: [validators.required("email"), validators.email],
      },
      password: {
        value: password,
        rules: [validators.required("mật khẩu"), validators.minLength(6), validators.passwordStrength(2)],
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

    // Captcha
    if (!captchaToken) {
      setError("Vui lòng xác nhận captcha");
      setLoginInProgress(false);
      return;
    }

    setLoginInProgress(true);
    const response = await fetch(API_REGISTER, {
      method: "POST",
      body: JSON.stringify({ email, password, captchaToken }),
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      setUserCreated(true);
      setError("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");
    } else {
      const data = await response.json();
      if (data?.errors && typeof data.errors === "object") {
        setErrors(prev => ({ ...prev, ...data.errors }));
      }

      setError(data.message || "Đã có lỗi xảy ra");

      recaptchaRef.current?.reset();
      setCaptchaToken("");
    }
    setLoginInProgress(false);

  };
  return (
    <><HeaderCart text="Tạo tài khoản" urlLink={LOGIN_ROUTE}></HeaderCart>
      <section className="p-4 md:w-[480px] mx-auto ">

        {userCreated && (
          <div className="md:mt-8">
            <div className="w-20 h-20 mx-auto">
              <Image src={"/images/firework.png"} alt="firework" width={200} height={200} className="object-cover object-center w-full h-full" />
            </div>
            <div className="mt-4 mb-2 font-medium">
              <div className="flex items-center justify-center gap-1 ">
                <Image src={"/images/party-popper.png"} alt="firework" width={200} height={200} className="object-cover object-center w-4 h-4" />
                <p>Chúc mừng!</p>
              </div>
              <p className="mx-auto mb-4 w-max">Tài khoản của bạn đã được tạo thành công</p>
            </div>
            <Link href={HOME_ROUTE}>
              <ButtonPrimary>
                Quay về trang chủ
              </ButtonPrimary>
            </Link>
          </div>
        )}
        {!userCreated &&


          <div className="p-4 md:mt-8 border rounded-2xl md:w-[510px] mx-auto shadow-sm">
            {error && <p className="px-20 mb-4 text-sm text-center text-primary">{error}</p>}
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
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken("")}
                className="mt-4"
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
          </div>}
      </section>
    </>
  );
};

export default RegisterPage;
