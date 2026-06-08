import { connectDB } from "@/libs/connectDB";
import { Category } from "@/models/Category";
import { ComboType } from "@/models/ComboType";
import { ComboDetail } from "@/models/ComboDetail";
import { MenuItem } from "@/models/MenuItem";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Banner } from "@/models/Banner";

const MODEL_MAP = {
    category: Category,
    comboType: ComboType,
    combo: ComboDetail,
    menuItem: MenuItem,
    banner:Banner,
};

export async function PATCH(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.admin) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const { type, items } = await req.json();

        const Model = MODEL_MAP[type];
        if (!Model) {
            return Response.json({ message: "Invalid type" }, { status: 400 });
        }

        await Promise.all(
            items.map(({ _id, order }) =>
                Model.findByIdAndUpdate(_id, { order })
            )
        );

        return Response.json({ message: "OK" });
    } catch (error) {
        return Response.json({ message: "Lỗi server" }, { status: 500 });
    }
}