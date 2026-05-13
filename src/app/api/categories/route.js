import { connectDB } from "@/libs/connectDB";
import { validateForm, validators } from "@/libs/validators";
import { Category } from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { LIMITPAGE } from "@/constant/constant";

export async function POST(req) {
  try {
    await connectDB();
    const { name, status, image } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ message: "Bạn cần đăng nhập" }, { status: 401 });
    }
    if (session?.user?.admin !== true) {
      return Response.json({ message: "Bạn không phải là admin" }, { status: 401 });
    }

    const { isValid, errors } = validateForm({
      categoryName: {
        value: name,
        rules: [validators.required("tên danh mục"), validators.minLength(2), validators.maxLength(200)],
      },
      status: {
        value: status,
        rules: [validators.requiredSelect("trạng thái")],
      },
    })

    if (!isValid) {
      return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
    }

    const categoryDoc = await Category.create({ name, status, image });
    return Response.json(categoryDoc);
  } catch (error) {
    console.log("Database Error:", error);

    return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const { _id, name, status, image } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ message: "Bạn cần đăng nhập" }, { status: 401 });
    }
    if (session?.user?.admin !== true) {
      return Response.json({ message: "Bạn không phải là admin" }, { status: 401 });
    }

    const { isValid, errors } = validateForm({
      categoryName: {
        value: name,
        rules: [validators.required("tên danh mục"), validators.minLength(2), validators.maxLength(200)],
      },
      status: {
        value: status,
        rules: [validators.requiredSelect("trạng thái")],
      },
    })

    if (!isValid) {
      return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
    }

    const updated = await Category.updateOne({ _id }, { name, status, image });
    if (!updated) {
      return Response.json({ message: "Không tìm thấy danh mục" }, { status: 404 });
    }
    return Response.json(true);

  } catch (error) {
    console.log("Database Error:", error);
    return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
  }
}


export async function GET(req) {
  await connectDB();
  const url = new URL(req.url);

  const all = url.searchParams.get("all") === "true";

  const search = url.searchParams.get("search") || "";
  const sort = url.searchParams.get("sort") || "newest";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = LIMITPAGE;
  const skip = (page - 1) * limit;

  const query = search
    ? { name: { $regex: search, $options: "i" } }
    : {};

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    asc: { name: 1 },
    desc: { name: -1 },
  };

  const sortOrder = sortMap[sort] || sortMap.newest;

  // không phân trang
  if (all) {
    const categories = await Category.find(query).sort(sortOrder);
    return Response.json({ categories, total: categories.length });
  }

  // Có phân trang
  const [categories, total, totalOn, totalOff] = await Promise.all([
    Category.find(query).sort(sortOrder).skip(skip).limit(limit),
    Category.countDocuments(query),
    Category.countDocuments({ ...query, status: "on" }),
    Category.countDocuments({ ...query, status: "off" }),
  ]);

  return Response.json({
    categories,
    total,
    totalOn,
    totalOff,
    totalPages: Math.ceil(total / limit),
    page,
  });
}

export async function DELETE(req) {
  await connectDB();
  const url = new URL(req.url);
  const _id = url.searchParams.get("_id");
  await Category.deleteOne({ _id });
  return Response.json(true)
}