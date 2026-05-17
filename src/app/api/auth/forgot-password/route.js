// app/api/auth/forgot-password/route.js
import bcrypt from "bcrypt";
import transporter from "@/libs/mailer";  // ← thay Resend
import { User } from "@/models/User";
import { SALT_ROUNDS } from "@/constant/constant";
import { ResetToken } from "@/models/Resettoken";
import { connectDB } from "@/libs/connectDB";
import { renderResetPasswordEmail } from "@/mail/ResetPasswordEmail"; // xem bước 6

export async function POST(req) {
    try {
        const body = await req.json();
        const email = body?.email;

        if (!email || typeof email !== "string") {
            return Response.json({ message: "Email không hợp lệ." }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return Response.json({
                message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn trong ít phút.",
            });
        }

        if (!user.password) {
            return Response.json(
                {
                    message: "Tài khoản này được liên kết với Google. Vui lòng đăng nhập bằng Google.",
                    provider: "google",
                },
                { status: 400 }
            );
        }

        await ResetToken.deleteMany({ userId: user._id });

        const rawToken = generateToken();
        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        const hashedToken = bcrypt.hashSync(rawToken, salt);

        await ResetToken.create({
            userId: user._id,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            used: false,
        });

        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}&id=${user._id}`;

        // ← Thay resend bằng nodemailer
        await transporter.sendMail({
            from: `"Pizza Teo" <${process.env.GMAIL_USER}>`,
            to: user.email, // ← gửi thẳng cho user luôn
            subject: "Đặt lại mật khẩu",
            html: renderResetPasswordEmail({ resetUrl, userName: user.name }),
        });

        return Response.json({
            message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn trong ít phút.",
        });
    } catch (error) {
        console.log("Forgot Password Error:", error);
        return Response.json({ message: "Lỗi server." }, { status: 500 });
    }
}

function generateToken(length = 48) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}