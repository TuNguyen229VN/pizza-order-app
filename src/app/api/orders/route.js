import { connectDB } from "@/libs/connectDB";
import { authOptions, isAdmin } from "../auth/[...nextauth]/route";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { LIMITPAGE } from "@/constant/constant";
import mongoose from "mongoose";

const buildSearchQuery = (search) => {
    if (!search) return {};

    // const isValidId = mongoose.Types.ObjectId.isValid(search);

    // return {
    //     $or: [
    //         ...(isValidId ? [{ _id: new mongoose.Types.ObjectId(search) }] : []),
    //         { phone: { $regex: search, $options: "i" } },
    //     ]
    // };
    return {
        $or: [
            {
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$_id" },
                        regex: search,
                        options: "i"
                    }
                }
            },
            { phone: { $regex: search, $options: "i" } },
        ]
    };
};

export async function GET(req) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email;
        const admin = await isAdmin();

        const url = new URL(req.url);
        const _id = url.searchParams.get('_id');
        const all = url.searchParams.get("all") === "true";
        const search = url.searchParams.get("search") || "";
        const sort = url.searchParams.get("sort") || "newest";
        const paid = url.searchParams.get("paid"); // "true" | "false" | null
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = LIMITPAGE;
        const skip = (page - 1) * limit;

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            asc: { name: 1 },
            desc: { name: -1 },
        };
        const sortOrder = sortMap[sort] || sortMap.newest;

        // 1. Lấy theo _id
        if (_id) {
            const order = await Order.findById(_id);
            return Response.json(order);
        }

        // 2. Lấy tất cả (admin)
        if (!admin && !userEmail) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const paidFilter = paid === "true" ? { paid: true }
            : paid === "false" ? { paid: false }
                : {};

        // Base query theo quyền
        const baseQuery = admin
            ? { ...buildSearchQuery(search), ...paidFilter }
            : { userEmail, ...buildSearchQuery(search), ...paidFilter };

        // 3. Không phân trang
        if (all) {
            const orders = await Order.find(baseQuery).sort(sortOrder).collation({ locale: "en", strength: 2 });
            return Response.json({ orders, total: orders.length });
        }

        // 4. Có phân trang
        const [orders, total, totalAll, totalOn, totalOff] = await Promise.all([
            Order.find(baseQuery).sort(sortOrder).collation({ locale: "en", strength: 2 }).skip(skip).limit(limit),
            Order.countDocuments(baseQuery),
            Order.countDocuments(),
            Order.countDocuments({ paid: true }),
            Order.countDocuments({ paid: false }),
        ]);

        return Response.json({
            orders,
            total,
            totalAll,
            totalOn,
            totalOff,
            page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }

}