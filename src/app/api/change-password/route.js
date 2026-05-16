import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import { authOptions } from "../auth/[...nextauth]/route";
import { User } from "@/models/User";
import { connectDB } from "@/libs/connectDB";
import { validateForm, validators } from "@/libs/validators";
import { SALT_ROUNDS } from "@/constant/constant";

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { currentPassword, newPassword } = await req.json();
        
        const { isValid, errors } = validateForm({
            currentPassword: {
                value: currentPassword,
                rules: [validators.required("mật khẩu")],
            },
            newPassword: {
                value: newPassword,
                rules: [validators.required("mật khẩu"), validators.minLength(6), validators.passwordStrength(2)],
            },
        });

        if (!isValid) {
            return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return Response.json({ message: "Không tìm thấy tài khoản" }, { status: 404 });
        }

        // User đăng nhập bằng Google sẽ không có password
        if (!user.password) {
            return Response.json(
                { message: "Không thể đối mật khẩu đối với Google account" },
                { status: 400 }
            );
        }

        const isCurrentPasswordValid = bcrypt.compareSync(
            currentPassword,
            user.password
        );

        if (!isCurrentPasswordValid) {
            return Response.json(
                { message: "Mật khẩu cũ không đúng" },
                { status: 400 }
            );
        }

        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

        await User.updateOne(
            { email: session.user.email },
            { $set: { password: hashedNewPassword } }
        );

        return Response.json({ message: "Thay đổi mật khẩu thành công" });
    } catch (error) {
        console.error("Change password error:", error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}