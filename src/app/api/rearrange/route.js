import { connectDB } from "@/libs/connectDB";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { ComboDetail } from "@/models/ComboDetail";
import { MenuItem } from "@/models/MenuItem";
import { Category } from "@/models/Category";
import { ComboType } from "@/models/ComboType";
import { Banner } from "@/models/Banner";
import { DispalyRearrange } from "@/models/DispalyRearrange";

const MODEL_MAP = {
    banner: Banner,
    category: Category,
    comboType: ComboType,
    combo: ComboDetail,
    menuItem: MenuItem,
};

export async function GET(req) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const type = url.searchParams.get("type");

        if (type === "sections") {
            const doc = await DispalyRearrange.findOne();
            return Response.json({ sections: doc?.sections || [] });
        }

        return Response.json({ message: "Invalid type" }, { status: 400 });
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Lỗi server" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.admin)
            return Response.json({ message: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { type, items } = await req.json();

        // Trộn category + comboType
        if (type === "sections") {
            await DispalyRearrange.findOneAndUpdate(
                {},
                {
                    sections: items.map((item, i) => ({
                        refId: item._id,
                        refType: item.refType,
                        order: i,
                    })),
                },
                { upsert: true }
            );
            return Response.json({ message: "OK" });
        }

        // banner, category, comboType, combo, menuItem
        const Model = MODEL_MAP[type];
        if (!Model) return Response.json({ message: "Invalid type" }, { status: 400 });

        await Promise.all(items.map(({ _id, order }) => Model.findByIdAndUpdate(_id, { order })));
        return Response.json({ message: "OK" });
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Lỗi server" }, { status: 500 });
    }
}