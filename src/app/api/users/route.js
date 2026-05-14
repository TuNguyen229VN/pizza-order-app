import { LIMITPAGE } from "@/constant/constant";
import { connectDB } from "@/libs/connectDB";
import { User } from "@/models/User";
import { UserInfo } from "@/models/UserInfo";

export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const all = url.searchParams.get("all") === "true";

        const status = url.searchParams.get("status"); // "on" | "off" | ""
        const search = url.searchParams.get("search") || "";
        const sort = url.searchParams.get("sort") || "newest";
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

        let emailsFromStatus = null;
        if (status === "on" || status === "off") {
            if (status === "on") {
                const userInfos = await UserInfo.find({ status: "on" }).select("email").lean();
                emailsFromStatus = userInfos.map((u) => u.email);
            } else {
                const userInfosOff = await UserInfo.find({
                    $or: [{ status: "off" }, { status: { $exists: false } }]
                }).select("email").lean();
                const emailsOff = userInfosOff.map((u) => u.email);

                const allUserInfoEmails = await UserInfo.find({}).select("email").lean();
                const allInfoEmails = allUserInfoEmails.map((u) => u.email);

                const usersNotInUserInfo = await User.find({
                    email: { $nin: allInfoEmails },
                }).select("email").lean();
                const emailsNotInInfo = usersNotInUserInfo.map((u) => u.email);

                emailsFromStatus = [...new Set([...emailsOff, ...emailsNotInInfo])];
            }
        }

        // ✅ Build query cho User
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // Nếu có filter status thì giới hạn email
        if (emailsFromStatus !== null) {
            query.email = { $in: emailsFromStatus };
        }

        // Hàm merge user + userInfo
        const mergeWithUserInfo = async (users) => {
            return Promise.all(
                users.map(async (user) => {
                    const userInfo = await UserInfo.findOne({ email: user.email })
                        .select("-_id -__v -email -createdAt -updatedAt")
                        .lean();
                    return { ...user, ...userInfo };
                })
            );
        };

        // Không phân trang
        if (all) {
            const users = await User.find(query).select("-password -__v").sort(sortOrder).lean();
            const merged = await mergeWithUserInfo(users);
            return Response.json({ users: merged, total: merged.length });
        }

        // Có phân trang
        const [users, total, totalAll] = await Promise.all([
            User.find(query).select("-password -__v").sort(sortOrder).skip(skip).limit(limit).lean(),
            User.countDocuments(query),
            User.countDocuments(),
        ]);

        const [totalOn, totalOff] = await Promise.all([
            UserInfo.countDocuments({ status: "on" }),
            UserInfo.countDocuments({ status: "off" }),
        ]);

        const merged = await mergeWithUserInfo(users);

        return Response.json({
            users: merged,
            total,
            totalAll,
            totalOn,
            totalOff,
            totalPages: Math.ceil(total / limit),
            page,
        });
    } catch (error) {
        return Response.json({ message: "Không thể kết nối Database" }, { status: 500 });
    }
}