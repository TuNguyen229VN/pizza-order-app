import { connectDB } from "@/libs/connectDB";
import { MenuItem } from "@/models/MenuItem";

export async function POST(req) {
    await connectDB();
    const data = await req.json();
    const menuItemdoc = await MenuItem.create(data);
    return Response.json(menuItemdoc);
}

export async function PUT(req) {
    await connectDB();
    const { _id, ...data } = await req.json();
    await MenuItem.findByIdAndUpdate(_id, data);
    return Response.json(true);
}

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
        const menuItems = await MenuItem.find(query).sort(sortOrder);
        return Response.json({ menuItems, total: menuItems.length });
    }

    // Có phân trang
    const [menuItems, total] = await Promise.all([
        MenuItem.find(query).sort(sortOrder).skip(skip).limit(limit),
        MenuItem.countDocuments(query),
    ]);

    return Response.json({
        menuItems,
        total,
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