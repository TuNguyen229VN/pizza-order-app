"use client";
import { useState } from "react";
import Link from "next/link";
import ValidatedInput from "@/components/input/ValidatedInput";
import { useFormValidate } from "@/hooks/useFormValidate";
import HeaderCart from "@/modules/cart/HeaderCart";
import { LOGIN_ROUTE } from "@/constant/routesApp";
import ButtonPrimary from "@/components/buttons/ButtonPrimary";
import Loader from "@/components/loading/Loader";
import { createValidators } from "@/libs/validators";
import { API_FORGOT_PASSWORD } from "@/constant/constant";
import { useTranslations } from "next-intl";
import { getLabel } from "@/utils/i18n-utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error | google
  const [message, setMessage] = useState("");
  const { errors, registerRef, handleValidate, clearError } = useFormValidate();
  const sTrans = useTranslations("System");
  const t = useTranslations("Validation");
  const validators = createValidators(t);
  async function handleSubmit(e) {
    e.preventDefault();
    const isValid = handleValidate({
      email: {
        value: email,
        rules: [validators.required("email"), validators.email],
      },
    });
    setStatus("error");
    if (!isValid) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(API_FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.provider === "google") {
          setStatus("google");
        } else {
          setStatus("error");
        }
        setMessage(getLabel(sTrans, data.message));
        return;
      }

      setStatus("success");
      setMessage(getLabel(sTrans, data.message));
    } catch {
      setStatus("error");
      setMessage(sTrans("FORGOT_PW_ERROR"));
    }
  }

  return (
    <>
      <HeaderCart text={sTrans("Quên mật khẩu")} urlLink={LOGIN_ROUTE}></HeaderCart>
      <div className="p-4 md:w-[510px] mx-auto ">
        {/* Form */}
        {status !== "success" && (
          <form onSubmit={handleSubmit} className="p-4 mx-auto border shadow-sm rounded-2xl">
            <div style={styles.field}>
              <ValidatedInput
                id="email"
                label={sTrans("Email")}
                name="email"
                value={email || ""}
                inputRef={registerRef("email")}
                error={errors.email}
                placeholder={sTrans("Nhập email của bạn")}
                disabled={status === "loading"}
                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              />
            </div>
            <p className="mt-4 text-center text-secondary">{sTrans("NOTE_FORGOT_PW")}</p>
            {/* Error / Google notice */}
            {(status === "error" || status === "google") && message && (
              <div
                style={{
                  ...styles.alert,
                  ...(status === "google" ? styles.alertInfo : styles.alertError),
                }}
                className="mt-4"
              >
                {message}
                {status === "google" && (
                  <Link href="/login" style={styles.link}>
                    {" "}{sTrans("Đăng nhập với Google")} →
                  </Link>
                )}
              </div>
            )}

            <ButtonPrimary
              type="submit"
              disabled={status === "loading"}
              className={"mt-6"}
            >
              {status === "loading" ? (
                <Loader size={"20"} />
              ) : (
                sTrans("Gửi")
              )}
            </ButtonPrimary>
          </form>
        )}

        {/* Success state */}
        {status === "success" && (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>📬</div>
            <h2 style={styles.successTitle}>{sTrans("CHECK_YOUR_INBOX")}</h2>
            <p style={styles.successText}>{message}</p>
            <p style={styles.successNote}>
              {sTrans("CHECK_EMAIL_FORGOT_PW")}{" "}
              <button
                onClick={() => {
                  setStatus("idle");
                  setMessage("");
                }}
                className="text-primary"
                style={styles.retryBtn}
              >
                {sTrans("thử lại")}
              </button>
              .
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Inline Styles ────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
    padding: "24px",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "440px",
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 24px -4px rgba(0,0,0,0.08)",
  },
  header: { textAlign: "center", marginBottom: "32px" },
  icon: { fontSize: "40px", display: "block", marginBottom: "12px" },
  title: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 8px" },
  subtitle: { fontSize: "14px", color: "#6b7280", margin: 0, lineHeight: "1.5" },

  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#374151" },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1.5px solid #d1d5db",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    transition: "border-color .2s",
  },

  alert: {
    padding: "12px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
  alertInfo: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },

  button: {
    padding: "13px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background .2s",
  },
  buttonDisabled: { background: "#93c5fd", cursor: "not-allowed" },
  spinner: { display: "inline-block" },

  successBox: { textAlign: "center", padding: "8px 0 16px" },
  successIcon: { fontSize: "48px", marginBottom: "12px" },
  successTitle: { fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 8px" },
  successText: { fontSize: "14px", color: "#6b7280", lineHeight: "1.6", margin: "0 0 16px" },
  successNote: { fontSize: "13px", color: "#9ca3af" },
  retryBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    padding: 0,
    fontSize: "13px",
  },

  footer: { textAlign: "center", marginTop: "28px", fontSize: "14px", color: "#6b7280" },
  link: { color: "#2563eb", fontWeight: "600", textDecoration: "none" },
};