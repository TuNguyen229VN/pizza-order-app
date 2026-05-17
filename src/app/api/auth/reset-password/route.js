// app/api/auth/reset-password/route.js
import bcrypt from "bcrypt";
import { User } from "@/models/User";
import { SALT_ROUNDS } from "@/constant/constant";
import { ResetToken } from "@/models/Resettoken";
import { connectDB } from "@/libs/connectDB";

export async function POST(req) {
    try {
        const body = await req.json();
        const { token, userId, password } = body;

        if (!token || !userId || !password) {
            return Response.json({ message: "Thiếu thông tin yêu cầu." }, { status: 400 });
        }

        if (password.length < 6) {
            return Response.json(
                { message: "Mật khẩu phải có ít nhất 6 ký tự." },
                { status: 400 }
            );
        }

        await connectDB();

        // Tìm tất cả token chưa dùng, chưa hết hạn của user
        const resetRecord = await ResetToken.findOne({
            userId,
            used: false,
            expiresAt: { $gt: new Date() },
        });

        if (!resetRecord) {
            return Response.json(
                { message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." },
                { status: 400 }
            );
        }

        // So sánh rawToken với hashedToken trong DB bằng bcrypt
        const isTokenValid = bcrypt.compareSync(token, resetRecord.token);

        if (!isTokenValid) {
            return Response.json(
                { message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." },
                { status: 400 }
            );
        }

        // Hash mật khẩu mới
        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Cập nhật mật khẩu user
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        // Đánh dấu token đã dùng
        await ResetToken.findByIdAndUpdate(resetRecord._id, { used: true });

        return Response.json({ message: "Mật khẩu đã được cập nhật thành công!" });
    } catch (error) {
        console.log("Reset Password Error:", error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}