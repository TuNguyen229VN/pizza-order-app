import bcrypt from "bcrypt";
import crypto from "crypto";
import transporter from "@/libs/mailer";
import { User } from "@/models/User";
import { ResetToken } from "@/models/Resettoken";
import { connectDB } from "@/libs/connectDB";
import { renderResetPasswordEmail } from "@/mail/ResetPasswordEmail";

export async function POST(req) {
    try {
        const body = await req.json();
        const email = body?.email;

        if (!email || typeof email !== "string") {
            return Response.json(
                { message: "Email không hợp lệ." },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!user) {
            return Response.json(
                { message: "Email không tồn tại trong hệ thống" },
                { status: 400 }
            );
        }

        if (!user.password) {
            return Response.json(
                {
                    message:
                        "Tài khoản này được liên kết với Google. Vui lòng đăng nhập bằng Google.",
                    provider: "google",
                },
                { status: 400 }
            );
        }

        await ResetToken.deleteMany({ userId: user._id });

        const rawToken = crypto.randomBytes(48).toString("hex");

        const hashedToken = await bcrypt.hash(rawToken, 10);

        await ResetToken.create({
            userId: user._id,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            used: false,
        });

        const resetUrl =
            `${process.env.NEXTAUTH_URL}/reset-password?token=${encodeURIComponent(rawToken)}&id=${user._id}`;

        await transporter.sendMail({
            from: `"Pizza Teo" <${process.env.GMAIL_USER}>`,
            to: user.email,
            replyTo: process.env.GMAIL_USER,
            subject: "Đặt lại mật khẩu",
            html: renderResetPasswordEmail({
                resetUrl,
                userName: user.name || "bạn",
            }),
        });

        return Response.json({
            message: "Đã gửi email đặt lại mật khẩu.",
        });
    } catch (error) {
        console.log("Forgot Password Error:", error);

        return Response.json(
            { message: "Lỗi server." },
            { status: 500 }
        );
    }
}