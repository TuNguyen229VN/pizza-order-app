import { connectDB } from "@/libs/connectDB";
import { ComboDetail } from "@/models/ComboDetail";
import { ComboType } from "@/models/ComboType";
import { MenuItem } from "@/models/MenuItem";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { LIMITPAGE } from "@/constant/constant";
import { validateCombo } from "@/libs/validateCombo";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function checkAdmin(req) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Bạn cần đăng nhập", status: 401 };
    if (session?.user?.admin !== true) return { error: "Bạn không phải là admin", status: 403 };
    return { session };
}

// ─── POST: Tạo combo mới ─────────────────────────────────────────────────────

export async function POST(req) {
    try {
        await connectDB();
        const { error, status } = await checkAdmin(req);
        if (error) return Response.json({ message: error }, { status });

        const data = await req.json();
        const { isValid, errors } = validateCombo(data,{});
        if (!isValid) return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });

        // Lấy ComboType để kiểm tra slots
        const comboType = await ComboType.findById(data.comboType);
        if (!comboType) return Response.json({ message: "Không tìm thấy loại combo" }, { status: 404 });

        const combo = await ComboDetail.create(data);
        return Response.json(combo);
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}

// ─── PUT: Cập nhật combo ─────────────────────────────────────────────────────

export async function PUT(req) {
    try {
        await connectDB();
        const { error, status } = await checkAdmin(req);
        if (error) return Response.json({ message: error }, { status });

        const { _id, ...data } = await req.json();
        if (!_id) return Response.json({ message: "Thiếu _id" }, { status: 400 });

        const { isValid, errors } = validateCombo(data,{});
        if (!isValid) return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });

        const updated = await ComboDetail.findByIdAndUpdate(_id, data, { new: true });
        if (!updated) return Response.json({ message: "Không tìm thấy combo" }, { status: 404 });

        return Response.json(updated);
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}

// ─── GET: Lấy danh sách / chi tiết combo ─────────────────────────────────────

export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);

        // Chi tiết 1 combo
        const _id = url.searchParams.get("_id");
        if (_id) {
            const combo = await ComboDetail.findById(_id)
                .populate("comboType")
                // .populate({ path: "items.menuItem", select: "name image basePrice sizes category status" });
            if (!combo) return Response.json({ message: "Không tìm thấy combo" }, { status: 404 });
            return Response.json(combo);
        }

        const all = url.searchParams.get("all") === "true";
        const search = url.searchParams.get("search") || "";
        const statusFilter = url.searchParams.get("status");
        const comboType = url.searchParams.get("comboType");
        const sort = url.searchParams.get("sort") || "newest";
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = LIMITPAGE;
        const skip = (page - 1) * limit;

        const statusQuery = statusFilter && ["on", "off"].includes(statusFilter)
            ? { status: statusFilter }
            : { status: { $in: ["on", "off"] } };

        const query = {
            ...statusQuery,
            ...(search && { name: { $regex: search, $options: "i" } }),
            ...(comboType && { comboType }),
        };

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            asc: { name: 1 },
            desc: { name: -1 },
        };
        const sortOrder = sortMap[sort] || sortMap.newest;

        // const populateItems = { path: "items.menuItem", select: "name image basePrice sizes" };

        // Không phân trang
        if (all) {
            const combos = await ComboDetail.find(query)
                .populate("comboType", "name")
                // .populate(populateItems)
                .sort(sortOrder)
                .collation({ locale: "en", strength: 2 });
            return Response.json({ combos, total: combos.length });
        }

        // Có phân trang
        const [combos, total, totalAll, totalOn, totalOff] = await Promise.all([
            ComboDetail.find(query)
                .populate("comboType", "name")
                // .populate(populateItems)
                .sort(sortOrder)
                .collation({ locale: "en", strength: 2 })
                .skip(skip)
                .limit(limit),
            ComboDetail.countDocuments(query),
            ComboDetail.countDocuments(),
            ComboDetail.countDocuments({ status: "on" }),
            ComboDetail.countDocuments({ status: "off" }),
        ]);

        return Response.json({
            combos,
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

// ─── DELETE: Xóa combo ───────────────────────────────────────────────────────

export async function DELETE(req) {
    try {
        await connectDB();
        const { error, status } = await checkAdmin(req);
        if (error) return Response.json({ message: error }, { status });

        const url = new URL(req.url);
        const _id = url.searchParams.get("_id");
        if (!_id) return Response.json({ message: "Thiếu _id" }, { status: 400 });

        await ComboDetail.findByIdAndDelete(_id);
        return Response.json(true);
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}