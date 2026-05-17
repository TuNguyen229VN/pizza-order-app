"use client";
// app/reset-password/page.jsx
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ValidatedInput from "@/components/input/ValidatedInput";
import { useFormValidate } from "@/hooks/useFormValidate";
import Loader from "@/components/loading/Loader";
import ButtonPrimary from "@/components/buttons/ButtonPrimary";
import { validators } from "@/libs/validators";
import Image from "next/image";
import { API_RESET_PASSWORD } from "@/constant/constant";
function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");
    const userId = searchParams.get("id");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [message, setMessage] = useState("");
    const { errors, registerRef, handleValidate, clearError } = useFormValidate();
    // Kiểm tra params ngay khi load
    useEffect(() => {
        if (!token || !userId) {
            setStatus("error");
            setMessage("Link không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.");
        }
    }, [token, userId]);


    async function handleSubmit(e) {
        e.preventDefault();
        const isValid = handleValidate({
            password: {
                value: password,
                rules: [validators.required("mật khẩu"), validators.minLength(6), validators.passwordStrength(2)],
            },
            confirm: {
                value: confirm,
                rules: [
                    validators.required("xác nhận mật khẩu"),
                    validators.matchField(password),
                ],
            },
        });
        setStatus("error");
        if (!isValid) return;
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch(API_RESET_PASSWORD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, userId, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus("error");
                setMessage(data.message);
                return;
            }

            setStatus("success");
            setMessage(data.message);
            setTimeout(() => router.push("/login"), 3000);
        } catch {
            setStatus("error");
            setMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
    }

    return (
        <div >
            <div className="p-4 mx-auto border shadow-sm rounded-2xl w-[510px] mt-8">
                <div style={styles.header}>
                    <h1 style={styles.title}>Tạo mật khẩu mới</h1>
                    <p style={styles.subtitle}>Nhập mật khẩu mới cho tài khoản của bạn.</p>
                </div>

                {status === "success" ? (
                    <div style={styles.successBox}>
                        <div className="w-20 h-20 mx-auto mb-4">
                            <Image src={"/images/firework.png"} alt="firework" width={200} height={200} className="object-cover object-center w-full h-full" />
                        </div>
                        <h2 style={styles.successTitle}>Cập nhật thành công!</h2>
                        <p style={styles.successText}>{message}</p>
                        <p style={styles.successNote}>Đang chuyển hướng về trang đăng nhập...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <ValidatedInput
                            label="Mật khẩu mới"
                            name="password"
                            type="password"
                            value={password || ""}
                            inputRef={registerRef("password")}
                            error={errors.password}
                            placeholder="Nhập mật khẩu của bạn"
                            disabled={status === "loading" || !token}
                            onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                        />
                        <ValidatedInput
                            label="Nhập lại mật khẩu"
                            name="confirm"
                            type="password"
                            value={confirm || ""}
                            inputRef={registerRef("confirm")}
                            error={errors.confirm}
                            placeholder="Nhập mật khẩu của bạn"
                            disabled={status === "loading" || !token}
                            onChange={(e) => { setConfirm(e.target.value); clearError("confirm"); }}
                        />

                        {/* Error alert */}
                        {status === "error" && message && (
                            <div style={{ ...styles.alert, ...styles.alertError }}>{message}</div>
                        )}

                        <ButtonPrimary
                            type="submit"
                            disabled={status === "loading" || !token || !userId}
                        >
                            {status === "loading" ? <Loader size={20} /> : "Đặt lại mật khẩu"}
                        </ButtonPrimary>
                    </form>
                )}

                <p style={styles.footer}>
                    <Link href="/forgot-password" className="font-medium text-primary">
                        ← Yêu cầu link mới
                    </Link>
                </p>
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 24px -4px rgba(0,0,0,0.08)",
    },
    header: { textAlign: "center", marginBottom: "32px" },
    icon: { fontSize: "40px", display: "block", marginBottom: "12px" },
    title: { fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 8px" },
    subtitle: { fontSize: "14px", color: "#6b7280", margin: 0 },

    form: { display: "flex", flexDirection: "column", gap: "20px" },
    field: { display: "flex", flexDirection: "column", gap: "6px" },
    label: { fontSize: "14px", fontWeight: "600", color: "#374151" },
    inputWrapper: { position: "relative" },
    input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: "8px",
        border: "1.5px solid #d1d5db",
        fontSize: "15px",
        color: "#111827",
        outline: "none",
        boxSizing: "border-box",
    },
    inputError: { borderColor: "#ef4444" },
    eyeBtn: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        padding: 0,
    },
    errorText: { fontSize: "12px", color: "#ef4444" },

    strengthWrapper: { display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" },
    strengthBarBg: { flex: 1, height: "4px", background: "#e5e7eb", borderRadius: "2px" },
    strengthBarFill: { height: "100%", borderRadius: "2px", transition: "width .3s, background .3s" },
    strengthLabel: { fontSize: "12px", fontWeight: "600", minWidth: "60px" },

    alert: { padding: "12px 14px", borderRadius: "8px", fontSize: "14px" },
    alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },

    button: {
        padding: "13px",
        borderRadius: "8px",
        border: "none",
        background: "#2563eb",
        color: "#fff",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
    },
    buttonDisabled: { background: "#93c5fd", cursor: "not-allowed" },

    successBox: { textAlign: "center", padding: "8px 0 16px" },
    successIcon: { fontSize: "48px", marginBottom: "12px" },
    successTitle: { fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 8px" },
    successText: { fontSize: "14px", color: "#6b7280", margin: "0 0 8px" },
    successNote: { fontSize: "13px", color: "#9ca3af" },

    footer: { textAlign: "center", marginTop: "28px", fontSize: "14px", color: "#6b7280" },

}
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Đang tải...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
};