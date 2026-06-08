"use client";
import { useEffect, useState, useCallback } from "react";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy,
    arrayMove, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    API_BANNERS,
    API_CATEGORIES, API_COMBO, API_COMBO_TYPES, API_MENU_ITEMS,
} from "@/constant/constant";
import toast from "react-hot-toast";
import HeaderCart from "@/modules/cart/HeaderCart";
import UserTabs from "@/components/layout/UserTabs";
import UseProfile from "@/components/UseProfile";
import ContainerProfileLeft from "@/container/ContainerProfileLeft";

const TABS = [
    { key: "banner", label: "Banner", api: API_BANNERS },
    { key: "category", label: "Danh mục", api: API_CATEGORIES },
    { key: "comboType", label: "Loại combo", api: API_COMBO_TYPES },
    { key: "combo", label: "Combo", api: API_COMBO },
    { key: "menuItem", label: "Món ăn", api: API_MENU_ITEMS },
];

function SortableItem({ item }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-background dark:border-gray-700 cursor-grab active:cursor-grabbing"
        >
            <span {...attributes} {...listeners} className="text-gray-400 select-none">
                ☰
            </span>
            {item.image && (
                <img src={item.image} alt={item.name} className="object-cover w-10 h-10 rounded" />
            )}
            <span className="flex-1 font-medium">{item.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "on" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                {item.status === "on" ? "Đang kinh doanh" : "Tạm đóng"}
            </span>
        </div>
    );
}

export default function RearrangePage() {
    const [activeTab, setActiveTab] = useState("banner");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const { loading: profileLoading, data: profileData } = UseProfile();

    const currentTab = TABS.find(t => t.key === activeTab);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setDirty(false);
        try {
            const res = await fetch(`${currentTab.api}?all=true`);
            const data = await res.json();
            // lấy đúng key theo từng api response
            const raw =
                data.banners ||
                data.categories ||
                data.comboTypes ||
                data.combos ||
                data.menuItems ||
                [];
            const sorted = [...raw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setItems(sorted);
        } catch {
            toast.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [currentTab]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        setItems(arrayMove(items, oldIndex, newIndex));
        setDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = items.map((item, index) => ({ _id: item._id, order: index }));
            const res = await fetch("/api/rearrange", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: activeTab, items: payload }),
            });
            if (!res.ok) throw new Error();
            toast.success("Đã lưu thứ tự");
            setDirty(false);
        } catch {
            toast.error("Lưu thất bại");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="">
            <HeaderCart text="Sắp xếp hiển thị sản phẩm" className={"top-[70px]"} />

            {/* Tabs */}
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profileData.admin}></UserTabs>

                <div className="col-span-2">
                    <ContainerProfileLeft>

                        <div className="flex flex-wrap gap-2 mb-6 ">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                            ${activeTab === tab.key
                                            ? "bg-primary text-white"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        {loading ? (
                            <div className="py-12 text-center text-gray-400">Đang tải...</div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
                                    <div className="flex flex-col gap-2">
                                        {items.map(item => (
                                            <SortableItem key={item._id} item={item} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}

                        {/* Save button */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleSave}
                                disabled={!dirty || saving}
                                className="px-6 py-2 font-medium text-white transition-opacity rounded-lg bg-primary disabled:opacity-40"
                            >
                                {saving ? "Đang lưu..." : "Lưu thứ tự"}
                            </button>
                        </div>
                    </ContainerProfileLeft>
                </div>
            </div>
        </section>
    );
}