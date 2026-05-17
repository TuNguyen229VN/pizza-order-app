// app/api/auth/forgot-password/route.js
import bcrypt from "bcrypt";
import { Resend } from "resend";
import { User } from "@/models/User";
import { SALT_ROUNDS } from "@/constant/constant";
import { ResetToken } from "@/models/Resettoken";
import { connectDB } from "@/libs/connectDB";
import { ResetPasswordEmail } from "@/mail/ResetPasswordEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Tạo token ngẫu nhiên, không dùng crypto */
function generateToken(length = 48) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

export async function POST(req) {
    try {
        const body = await req.json();
        const email = body?.email;

        if (!email || typeof email !== "string") {
            return Response.json({ message: "Email không hợp lệ." }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Luôn trả 200 để tránh lộ email tồn tại hay không
        if (!user) {
            return Response.json({
                message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn trong ít phút.",
            });
        }

        // Tài khoản Google (không có password) → không gửi mail
        if (!user.password) {
            return Response.json(
                {
                    message: "Tài khoản này được liên kết với Google. Vui lòng đăng nhập bằng Google.",
                    provider: "google",
                },
                { status: 400 }
            );
        }

        // Xoá token cũ rồi tạo mới
        await ResetToken.deleteMany({ userId: user._id });

        const rawToken = generateToken();

        // Hash token bằng bcrypt trước khi lưu DB
        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        const hashedToken = bcrypt.hashSync(rawToken, salt);

        await ResetToken.create({
            userId: user._id,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 giờ
            used: false,
        });

        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}&id=${user._id}`;
        
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            // to: user.email,
            to: "tunguyen2209.it.work@gmail.com",
            subject: "Đặt lại mật khẩu",
            react: ResetPasswordEmail({ resetUrl, userName: user.name }),
        });

        return Response.json({
            message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn trong ít phút.",
        });
    } catch (error) {
        console.log("Forgot Password Error:", error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}