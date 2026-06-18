// app/api/auth/reset-password/route.js
import bcrypt from "bcrypt";
import { User } from "@/models/User";
import { SALT_ROUNDS } from "@/constant/constant";
import { ResetToken } from "@/models/Resettoken";
import { connectDB } from "@/libs/connectDB";
import { createValidators, validateForm } from "@/libs/validators";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { token, userId, password } = body;
        const cookieStore = await cookies();
        const locale = cookieStore.get("locale")?.value || "vi";
        const t = await getTranslations({ locale, namespace: "Validation" });
        const validators = createValidators(t);
        if (!token || !userId || !password) {
            return Response.json({ message: "Thiếu thông tin yêu cầu" }, { status: 400 });
        }
        const { isValid, errors } = validateForm({
            password: {
                value: body?.password,
                rules: [validators.required("mật khẩu"), validators.minLength(6), validators.passwordStrength(2)],
            },
        })

        if (!isValid) {
            return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
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
                { message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" },
                { status: 400 }
            );
        }

        // So sánh rawToken với hashedToken trong DB bằng bcrypt
        const isTokenValid = bcrypt.compareSync(token, resetRecord.token);

        if (!isTokenValid) {
            return Response.json(
                { message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" },
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

        return Response.json({ message: "Mật khẩu đã được cập nhật thành công" });
    } catch (error) {
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}