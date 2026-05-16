import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "@/models/User";
import { connectDB } from "@/libs/connectDB";
import { validateForm, validators } from "@/libs/validators";
import { SALT_ROUNDS } from "@/constant/constant";

export async function POST(req) {
  try {
    const body = await req.json();
    await connectDB();
    const { isValid, errors } = validateForm({
      email: {
        value: body?.email,
        rules: [validators.required("email"), validators.email],
      },
      password: {
        value: body?.password,
        rules: [validators.required("mật khẩu"), validators.minLength(6), validators.passwordStrength(2)],
      },
    })

    if (!isValid) {
      return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
    }

    // Captcha
    const captchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${body.captchaToken}`,
      { method: "POST" }
    );
    const captchaData = await captchaRes.json();

    if (!captchaData.success) {
      return Response.json({ message: "Xác nhận captcha thất bại" }, { status: 400 });
    }

    const notHashedPassword = body?.password;
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    body.password = bcrypt.hashSync(notHashedPassword, salt);

    const createdUser = await User.create(body);
    return Response.json(
      { message: "Tạo tài khoản thành công", userId: createdUser._id },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return Response.json(
        { message: "Tài khoản đã tồn tại" },
        { status: 409 }
      );
    }
    console.log("Database Error:", error);
    return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
  }
}
