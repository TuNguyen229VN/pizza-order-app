import { connectDB } from "@/libs/connectDB";
import { ComboDetail } from "@/models/ComboDetail";
import { ComboType } from "@/models/ComboType";
import { MenuItem } from "@/models/MenuItem";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// ─── Helpers ────────────────────────────────────────────────────────────────

function validateComboDetail(data) {
    const errors = {};

    if (!data.name?.trim()) errors.name = "Tên combo không được để trống";
    if (!data.price || isNaN(data.price) || data.price < 0)
        errors.price = "Giá combo không hợp lệ";
    if (!data.comboType) errors.comboType = "Loại combo không được để trống";
    if (!Array.isArray(data.items) || data.items.length === 0)
        errors.items = "Combo phải có ít nhất 1 món";

    // Validate từng item
    data.items?.forEach((item, idx) => {
        if (!item.menuItem) errors[`items[${idx}].menuItem`] = "Thiếu menuItem";
        if (item.slotIndex === undefined || item.slotIndex === null)
            errors[`items[${idx}].slotIndex`] = "Thiếu slotIndex";
    });

    return { isValid: Object.keys(errors).length === 0, errors };
}

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
        console.log("alo")
        const { error, status } = await checkAdmin(req);
        if (error) return Response.json({ message: error }, { status });

        const data = await req.json();
        const { isValid, errors } = validateComboDetail(data);
        if (!isValid) return Response.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });

        // Lấy ComboType để kiểm tra slots
        const comboType = await ComboType.findById(data.comboType);
        if (!comboType) return Response.json({ message: "Không tìm thấy loại combo" }, { status: 404 });

        // Kiểm tra từng item: phải on, nếu có sizes thì phải chọn size
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];
            const menuItem = await MenuItem.findById(item.menuItem);

            if (!menuItem) {
                return Response.json({ message: `Không tìm thấy món #${i + 1}` }, { status: 404 });
            }
            if (menuItem.status !== "on") {
                return Response.json(
                    { message: `Món "${menuItem.name}" hiện đang tắt, không thể thêm vào combo` },
                    { status: 400 }
                );
            }
            // Nếu món có sizes → bắt buộc phải chọn size
            if (menuItem.sizes && menuItem.sizes.length > 0) {
                if (!item.selectedSize?.name) {
                    return Response.json(
                        { message: `Món "${menuItem.name}" có nhiều size, vui lòng chọn 1 size` },
                        { status: 400 }
                    );
                }
                // Kiểm tra size có tồn tại trong món không
                const validSize = menuItem.sizes.find((s) => s.name === item.selectedSize.name);
                if (!validSize) {
                    return Response.json(
                        { message: `Size "${item.selectedSize.name}" không tồn tại trong món "${menuItem.name}"` },
                        { status: 400 }
                    );
                }
                // Gán đúng price từ DB
                item.selectedSize = { name: validSize.name, price: validSize.price };
            } else {
                // Món không có size → xóa selectedSize nếu có
                item.selectedSize = undefined;
            }

            // Kiểm tra slotIndex hợp lệ
            if (item.slotIndex >= comboType.slots.length) {
                return Response.json({ message: `slotIndex ${item.slotIndex} không hợp lệ` }, { status: 400 });
            }
        }

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

        const { isValid, errors } = validateComboDetail(data);
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
        const _id = url.searchParams.get("_id");
        const status = url.searchParams.get("status"); // "on" | "off" | ""
        const comboType = url.searchParams.get("comboType");

        // Chi tiết 1 combo
        if (_id) {
            const combo = await ComboDetail.findById(_id)
                .populate("comboType")
                .populate({ path: "items.menuItem", select: "name image basePrice sizes category status" });
            if (!combo) return Response.json({ message: "Không tìm thấy combo" }, { status: 404 });
            return Response.json(combo);
        }

        // Danh sách
        const query = {
            ...(status && { status }),
            ...(comboType && { comboType }),
        };

        const combos = await ComboDetail.find(query)
            .populate("comboType", "name slots")
            .populate({ path: "items.menuItem", select: "name image basePrice sizes" })
            .sort({ createdAt: -1 });

        return Response.json({ combos, total: combos.length });
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