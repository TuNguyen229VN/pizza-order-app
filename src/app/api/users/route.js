import { LIMITPAGE } from "@/constant/constant";
import { connectDB } from "@/libs/connectDB";
import { User } from "@/models/User";
import { UserInfo } from "@/models/UserInfo";

export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const all = url.searchParams.get("all") === "true";

        const search = url.searchParams.get("search") || "";
        const sort = url.searchParams.get("sort") || "newest";
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = LIMITPAGE;
        const skip = (page - 1) * limit;

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            asc: { name: 1 },
            desc: { name: -1 },
        };

        const sortOrder = sortMap[sort] || sortMap.newest;

        // Hàm merge user + userInfo
        const mergeWithUserInfo = async (users) => {
            return Promise.all(users.map(async (user) => {
                const userInfo = await UserInfo.findOne({ email: user.email })
                    .select("-_id -__v -email -createdAt -updatedAt")
                    .lean();
                return { ...user, ...userInfo };
            }));
        };

        // Không phân trang
        if (all) {
            const users = await User.find(query).select("-password -__v").sort(sortOrder).lean();
            const merged = await mergeWithUserInfo(users);
            return Response.json({ users: merged, total: merged.length });
        }

        // Có phân trang
        const [users, total] = await Promise.all([
            User.find(query).select("-password -__v").sort(sortOrder).skip(skip).limit(limit).lean(),
            User.countDocuments(query),
            User.countDocuments({ ...query, status: "on" }),
            User.countDocuments({ ...query, status: "off" }),
        ]);

        const [totalOn, totalOff] = await Promise.all([
            UserInfo.countDocuments({ status: "on" }),
            UserInfo.countDocuments({ status: "off" }),
        ]);

        const merged = await mergeWithUserInfo(users);

        return Response.json({
            users: merged,
            total,
            totalOn,
            totalOff,
            totalPages: Math.ceil(total / limit),
            page,
        });
    } catch (error) {
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}