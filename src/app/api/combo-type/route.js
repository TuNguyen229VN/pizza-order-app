import { connectDB } from "@/libs/connectDB";
import { ComboType } from "@/models/ComboType";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { LIMITPAGE } from "@/constant/constant";
import { validateComboType } from "@/libs/validateComboType";
import { escapeRegex } from "@/utils/escapeRegex";
import { getServerT } from "@/libs/getServerT";
import { ComboDetail } from "@/models/ComboDetail";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Bạn cần đăng nhập", status: 401 };
    if (session?.user?.admin !== true) return { error: "Bạn không phải là admin", status: 403 };
    return { session };
}

// POST: Tạo loại combo
export async function POST(req) {
    try {
        await connectDB();
        const { error, status } = await checkAdmin();
        if (error) return Response.json({ message: error }, { status });

        const data = await req.json();
        const t = await getServerT();
        const { isValid, errors } = validateComboType(data, t);
        if (!isValid) {
            return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
        }
        const comboType = await ComboType.create(data);
        return Response.json(comboType);
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}

// GET: Lấy tất cả loại combo (có populate category)
export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);

        const _id = url.searchParams.get("_id");
        if (_id) {
            const comboType = await ComboType.findById(_id).populate("name status");
            if (!comboType) return Response.json({ message: "Không tìm thấy loại combo" }, { status: 404 });
            return Response.json(comboType);
        }

        const all = url.searchParams.get("all") === "true";
        const useOrderSort = url.searchParams.get("useOrder") === "true";
        const search = url.searchParams.get("search") || "";
        const safeSearch = escapeRegex(search);
        const statusFilter = url.searchParams.get("status");
        const sort = url.searchParams.get("sort") || "newest";
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = LIMITPAGE;
        const skip = (page - 1) * limit;

        const statusQuery = statusFilter && ["on", "off"].includes(statusFilter)
            ? { status: statusFilter }
            : { status: { $in: ["on", "off"] } };

        const query = {
            ...statusQuery,
            ...(safeSearch && { name: { $regex: safeSearch, $options: "i" } }),
        };

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            asc: { name: 1 },
            desc: { name: -1 },
        };
        const sortOrder = useOrderSort ? { order: 1 } : (sortMap[sort] || sortMap.newest);

        // Không phân trang
        if (all) {
            const comboTypes = await ComboType.find(query)
                .populate("name status")
                .sort(sortOrder)
                .collation({ locale: "en", strength: 2 });
            return Response.json({ comboTypes, total: comboTypes.length });
        }

        // Có phân trang
        const [comboTypes, total, totalAll, totalOn, totalOff] = await Promise.all([
            ComboType.find(query)
                .populate("name status")
                .sort(sortOrder)
                .collation({ locale: "en", strength: 2 })
                .skip(skip)
                .limit(limit),
            ComboType.countDocuments(query),
            ComboType.countDocuments(),
            ComboType.countDocuments({ status: "on" }),
            ComboType.countDocuments({ status: "off" }),
        ]);

        return Response.json({
            comboTypes,
            total,
            totalAll,
            totalOn,
            totalOff,
            totalPages: Math.ceil(total / limit),
            page,
        });
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}

// PUT: Cập nhật loại combo
export async function PUT(req) {
    try {
        await connectDB();
        const { error, status } = await checkAdmin();
        if (error) return Response.json({ message: error }, { status });


        const { _id, ...data } = await req.json();
        if (!_id) return Response.json({ message: "Thiếu _id" }, { status: 400 });
        const t = await getServerT();
        const { isValid, errors } = validateComboType(data, t);
        if (!isValid) {
            return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
        }
        const updated = await ComboType.findByIdAndUpdate(_id, data, { new: true });
        if (!updated) return Response.json({ message: "Không tìm thấy loại combo" }, { status: 404 });
        return Response.json(updated);
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}

// DELETE: Xóa loại combo
export async function DELETE(req) {
    try {
        await connectDB();
        const { error, status } = await checkAdmin();
        if (error) return Response.json({ message: error }, { status });

        const url = new URL(req.url);
        const _id = url.searchParams.get("_id");
        if (!_id) return Response.json({ message: "Thiếu id" }, { status: 400 });
        const inUse = await ComboDetail.countDocuments({ comboType: _id });
        if (inUse > 0) {
            return Response.json({ message: `Còn ${inUse} combo đang dùng loại combo này, không thể xóa` }, { status: 400 });
        }
        await ComboType.findByIdAndDelete(_id);
        return Response.json(true);
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}