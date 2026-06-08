import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { User } from "@/models/User";
import { UserInfo } from "@/models/UserInfo";
import { connectDB } from "@/libs/connectDB";
import { validateForm, validators } from "@/libs/validators";

export async function PUT(req) {
  try {
    await connectDB();
    const data = await req.json();
    const { isValid, errors } = validateForm({
      userName: {
        value: data?.name,
        rules: [validators.required("tên"), validators.minLength(2), validators.maxLength(200)],
      },
      gender: {
        value: data?.gender,
        rules: [validators.requiredSelect("giới tính")],
      },
      phone: {
        value: data?.phone,
        rules: [validators.required("số điện thoại"), validators.phone],
      },
      birthday: {
        value: data?.birthday,
        rules: [validators.required("ngày sinh"), validators.pastDate, validators.ageDate(10, 90)],
      },
    })

    if (!isValid) {
      return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 });

    const { _id, name, image, ...otherUserInfo } = data;
    let filter = {};

    if (_id && session.user.admin) {
      filter = { _id };
    } else {
      const email = session?.user?.email;
      filter = { email }

    }

    const user = await User.findOne(filter);
    if (!user) {
      return Response.json({ message: "Người dùng không tồn tại" }, { status: 404 });
    }
    await User.updateOne(filter, { name, image });
    await UserInfo.findOneAndUpdate({ email: user.email }, otherUserInfo, {
      upsert: true,
    });
    return Response.json(true);
  } catch (error) {

    return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
  }
}

export async function GET(req) {
  await connectDB();

  const url = new URL(req.url);
  const _id = url.searchParams.get("_id");

  let filterUser = {};
  if (_id) {
    filterUser = { _id };
  } else {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return Response.json({});
    }
    filterUser = { email };

  }
  const user = await User.findOne(filterUser).select('-password -__v').lean();
  const userInfo = await UserInfo.findOne({ email: user.email }).lean();
  return Response.json({ ...user, ...userInfo });
}


export async function PATCH(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user.admin) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { _id, status } = await req.json();

    const user = await User.findOne({ _id }).lean();
    if (!user) return Response.json({ message: "Người dùng không tồn tại" }, { status: 404 });
    if (user.admin) return Response.json({ message: "Không thể chặn người dùng là admin" }, { status: 400 });
    
    const updated = await UserInfo.findOneAndUpdate(
      { email: user.email },
      { status },
      { upsert: true, new: true }
    );

    return Response.json({ success: true, status: updated.status });
  } catch (error) {
    return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
  }
}