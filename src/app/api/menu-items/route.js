import { connectDB } from "@/libs/connectDB";
import { MenuItem } from "@/models/MenuItem";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { validateMenuItem } from "@/libs/validateMenuItem";
import { LIMITPAGE } from "@/constant/constant";
import { escapeRegex } from "@/utils/escapeRegex";
import { getServerT } from "@/libs/getServerT";

export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();

        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json({ message: "Bạn cần đăng nhập" }, { status: 401 });
        }
        if (session?.user?.admin !== true) {
            return Response.json({ message: "Bạn không phải là admin" }, { status: 401 });
        }
        const t = await getServerT();
        const { isValid, errors } = validateMenuItem(data, t);
        if (!isValid) {
            return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
        }
        const menuItemdoc = await MenuItem.create(data);
        return Response.json(menuItemdoc);
    } catch (error) {
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const { _id, ...data } = await req.json();

        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json({ message: "Bạn cần đăng nhập" }, { status: 401 });
        }
        if (session?.user?.admin !== true) {
            return Response.json({ message: "Bạn không phải là admin" }, { status: 401 });
        }
        const t = await getServerT();
        const { isValid, errors } = validateMenuItem(data, t);
        if (!isValid) {
            return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
        }

        const updated = await MenuItem.findByIdAndUpdate(_id, data);
        if (!updated) {
            return Response.json({ message: "Không tìm thấy món ăn" }, { status: 404 });
        }
        return Response.json(true);
    } catch (error) {
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}

export async function GET(req) {
    await connectDB();
    const url = new URL(req.url);
    const all = url.searchParams.get("all") === "true";
    const useOrderSort = url.searchParams.get("useOrder") === "true";
    const search = url.searchParams.get("search") || "";
    const safeSearch = escapeRegex(search);
    const status = url.searchParams.get("status"); // "on" | "off" | ""
    const sort = url.searchParams.get("sort") || "newest";
    const category = url.searchParams.get("category") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = LIMITPAGE;
    const skip = (page - 1) * limit;

    const query = {
        ...(safeSearch && { name: { $regex: safeSearch, $options: "i" } }),
        status: status || { $in: ["on", "off"] },
        ...(category && { category }), 
    };

    const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        asc: { name: 1 },
        desc: { name: -1 },
    };

    const sortOrder = useOrderSort ? { order: 1 } : (sortMap[sort] || sortMap.newest);

    // không phân trang
    if (all) {
        const menuItems = await MenuItem.find(query).sort(sortOrder).collation({ locale: "en", strength: 2 });
        return Response.json({ menuItems, total: menuItems.length });
    }

    // Có phân trang
    const [menuItems, total, totalAll, totalOn, totalOff] = await Promise.all([
        MenuItem.find(query).sort(sortOrder).collation({ locale: "en", strength: 2 }).skip(skip).limit(limit),
        MenuItem.countDocuments(query),
        MenuItem.countDocuments(),
        MenuItem.countDocuments({ status: "on" }),
        MenuItem.countDocuments({ status: "off" }),
    ]);

    return Response.json({
        menuItems,
        total,
        totalAll,
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
    await MenuItem.findByIdAndDelete(_id);
    return Response.json(true);
}