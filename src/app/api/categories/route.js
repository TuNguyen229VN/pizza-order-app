import { connectDB } from "@/libs/connectDB";
import { validateForm, validators } from "@/libs/validators";
import { Category } from "@/models/Category";

export async function POST(req) {
  try {
    await connectDB();
    const { name, status, image } = await req.json();
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
    await Category.updateOne({ _id }, { name, status, image });
    return Response.json(true);
  } catch (error) {
    console.log("Database Error:", error);
    return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
  }
}

// export async function GET() {
//   await connectDB();
//   return Response.json(await Category.find());
// }

export async function GET(req) {
  await connectDB();
  const url = new URL(req.url);

  const all = url.searchParams.get("all") === "true";

  const search = url.searchParams.get("search") || "";
  const sort = url.searchParams.get("sort") || "newest";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 4;
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
  const [categories, total] = await Promise.all([
    Category.find(query).sort(sortOrder).skip(skip).limit(limit),
    Category.countDocuments(query),
  ]);

  return Response.json({
    categories,
    total,
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