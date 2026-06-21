import { connectDB } from "@/libs/connectDB";
import { createValidators, validateForm } from "@/libs/validators";
import { Category } from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { LIMITPAGE } from "@/constant/constant";
import { Banner } from "@/models/Banner";
import { escapeRegex } from "@/utils/escapeRegex";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

export async function POST(req) {
    try {
        await connectDB();
        const { name, status, image } = await req.json();

        const session = await getServerSession(authOptions);
        const cookieStore = await cookies();
        const locale = cookieStore.get("locale")?.value || "vi";
        const t = await getTranslations({ locale, namespace: "Validation" });
        const validators = createValidators(t);
        if (!session) {
            return Response.json({ message: "Bạn cần đăng nhập" }, { status: 401 });
        }
        if (session?.user?.admin !== true) {
            return Response.json({ message: "Bạn không phải là admin" }, { status: 401 });
        }

        const { isValid, errors } = validateForm({
            bannerName: {
                value: name,
                rules: [validators.required("tên banner"), validators.minLength(2), validators.maxLength(200)],
            },
            status: {
                value: status,
                rules: [validators.requiredSelect("trạng thái")],
            },
            image: {
                value: image,
                rules: [validators.required("ảnh banner")],
            },
        })

        if (!isValid) {
            return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
        }

        const bannerDoc = await Banner.create({ name, status, image });
        return Response.json(bannerDoc);
    } catch (error) {

        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const { _id, name, status, image } = await req.json();

        const session = await getServerSession(authOptions);
        const cookieStore = await cookies();
        const locale = cookieStore.get("locale")?.value || "vi";
        const t = await getTranslations({ locale, namespace: "Validation" });
        const validators = createValidators(t);
        if (!session) {
            return Response.json({ message: "Bạn cần đăng nhập" }, { status: 401 });
        }
        if (session?.user?.admin !== true) {
            return Response.json({ message: "Bạn không phải là admin" }, { status: 401 });
        }

        const { isValid, errors } = validateForm({
            bannerName: {
                value: name,
                rules: [validators.requiredSelect("tên banner")],
            },
            status: {
                value: status,
                rules: [validators.requiredSelect("trạng thái")],
            },
            image: {
                value: image,
                rules: [validators.required("ảnh banner")],
            },
        })

        if (!isValid) {
            return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
        }

        const updated = await Banner.updateOne({ _id }, { name, status, image });
        if (!updated) {
            return Response.json({ message: "Không tìm thấy banner" }, { status: 404 });
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
    const status = url.searchParams.get("statusFilter"); // "on" | "off" | ""
    const sort = url.searchParams.get("sort") || "newest";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = LIMITPAGE;
    const skip = (page - 1) * limit;

    const query = safeSearch
        ? { name: { $regex: safeSearch, $options: "i" }, status: status || { $in: ["on", "off"] } }
        : { status: status || { $in: ["on", "off"] } };

    const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        asc: { name: 1 },
        desc: { name: -1 },
    };

    const sortOrder = useOrderSort ? { order: 1 } : (sortMap[sort] || sortMap.newest);

    // không phân trang
    if (all) {
        const banners = await Banner.find(query).sort(sortOrder).collation({ locale: "en", strength: 2 });
        return Response.json({ banners, total: banners.length });
    }

    // Có phân trang
    const [banners, total, totalAll, totalOn, totalOff] = await Promise.all([
        Banner.find(query).sort(sortOrder).collation({ locale: "en", strength: 2 }).skip(skip).limit(limit),
        Banner.countDocuments(query),
        Banner.countDocuments(),
        Banner.countDocuments({ status: "on" }),
        Banner.countDocuments({ status: "off" }),
    ]);
    return Response.json({
        banners,
        total,
        totalAll,
        totalOn,
        totalOff,
        totalPages: Math.ceil(total / limit),
        page,
    });
}

export async function DELETE(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json({ message: "Bạn cần đăng nhập" }, { status: 401 });
        }
        if (session?.user?.admin !== true) {
            return Response.json({ message: "Bạn không phải là admin" }, { status: 403 });
        }

        const url = new URL(req.url);
        const _id = url.searchParams.get("_id");
        if (!_id) return Response.json({ message: "Thiếu id" }, { status: 400 });

        const deleted = await Banner.deleteOne({ _id });
        if (deleted.deletedCount === 0) {
            return Response.json({ message: "Không tìm thấy banner" }, { status: 404 });
        }
        return Response.json(true);
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Lỗi server" }, { status: 500 });
    }
}