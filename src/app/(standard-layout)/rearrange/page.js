"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
    SortableContext, verticalListSortingStrategy,
    arrayMove, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    API_CATEGORIES, API_COMBO, API_COMBO_TYPES, API_MENU_ITEMS,
    API_REARRANGE, API_BANNERS,
} from "@/constant/constant";
import toast from "react-hot-toast";
import HeaderCart from "@/modules/cart/HeaderCart";
import UserTabs from "@/components/layout/UserTabs";
import UseProfile from "@/components/UseProfile";
import ContainerProfileLeft from "@/container/ContainerProfileLeft";
import Image from "next/image";
import SkeletonLoadingBox from "@/components/skeleton/SkeletonLoadingBox";

const TABS = [
    { key: "banner", label: "Banner" },
    { key: "sections", label: "Thứ tự sections" },
    { key: "combo", label: "Combo" },
    { key: "menuItem", label: "Món ăn" },
];

function SortableItem({ item }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    const [loadingImage, setLoadingImage] = useState({});
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 px-4 py-3 border rounded-lg shadow-sm cursor-grab active:cursor-grabbing
                ${item.status === "on"
                    ? "bg-white dark:bg-background border-gray-200 dark:border-gray-700"
                    : "bg-gray-50 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-600 opacity-50"
                }`}
            {...attributes} {...listeners}
        >
            <span className="text-gray-400 select-none">☰</span>
            {item.image && (
                <>
                    {!loadingImage[item._id] && <SkeletonLoadingBox className='w-full h-full' />}
                    <Image src={item.image} onLoad={() => setLoadingImage(prev => ({ ...prev, [item._id]: true }))} alt={item.name} width={200} height={200} className={`object-cover w-10 h-10 rounded ${!loadingImage[item._id] ? "opacity-0" : "opacity-100"}`} />
                </>
            )}
            <div className="flex-1 min-w-0">
                <span className="font-medium">{item.name}</span>
                {item.refType && (
                    <span className="ml-2 text-xs text-gray-400">
                        {item.refType === "comboType" ? "Loại combo" : "Danh mục"}
                    </span>
                )}
            </div>
            {item.status && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "on" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                    {item.status === "on" ? "Đang kinh doanh" : "Tạm đóng"}
                </span>
            )}
        </div>
    );
}

export default function RearrangePage() {
    const [activeTab, setActiveTab] = useState("banner");
    const [items, setItems] = useState([]);
    const [originalItems, setOriginalItems] = useState([]); // snapshot để reset
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const [parentList, setParentList] = useState([]);
    const [parentId, setParentId] = useState("");

    const { data: profileData } = UseProfile();

    useEffect(() => {
        if (activeTab === "combo") {
            fetch(`${API_COMBO_TYPES}?all=true`)
                .then(r => r.json())
                .then(d => { setParentList(d.comboTypes || []); setParentId(""); setItems([]); setOriginalItems([]); });
        } else if (activeTab === "menuItem") {
            fetch(`${API_CATEGORIES}?all=true`)
                .then(r => r.json())
                .then(d => { setParentList(d.categories || []); setParentId(""); setItems([]); setOriginalItems([]); });
        } else {
            setParentList([]);
            setParentId("");
        }
        setDirty(false);
    }, [activeTab]);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setDirty(false);
        try {
            let raw = [];

            if (activeTab === "banner") {
                const d = await fetch(`${API_BANNERS}?all=true`).then(r => r.json());
                raw = [...(d.banners || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            } else if (activeTab === "sections") {
                const [catData, typeData, orderData] = await Promise.all([
                    fetch(`${API_CATEGORIES}?all=true`).then(r => r.json()),
                    fetch(`${API_COMBO_TYPES}?all=true`).then(r => r.json()),
                    fetch(`${API_REARRANGE}?type=sections`).then(r => r.json()),
                ]);
                const cats = (catData.categories || []).map(c => ({ ...c, refType: "category" }));
                const types = (typeData.comboTypes || []).map(c => ({ ...c, refType: "comboType" }));
                const all = [...cats, ...types];
                const order = orderData.sections || [];

                if (order.length > 0) {
                    raw = order
                        .sort((a, b) => a.order - b.order)
                        .map(o => all.find(i => i._id === o.refId))
                        .filter(Boolean);
                    const inOrder = new Set(order.map(o => o.refId));
                    all.forEach(i => { if (!inOrder.has(i._id)) raw.push(i); });
                } else {
                    raw = all;
                }

            } else if ((activeTab === "combo" || activeTab === "menuItem") && parentId) {
                const api = activeTab === "combo" ? API_COMBO : API_MENU_ITEMS;
                const param = activeTab === "combo" ? "comboType" : "category";
                const key = activeTab === "combo" ? "combos" : "menuItems";
                const d = await fetch(`${api}?all=true&${param}=${parentId}`).then(r => r.json());
                raw = [...(d[key] || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            }

            setItems(raw);
            setOriginalItems(raw); // lưu snapshot
        } catch {
            toast.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [activeTab, parentId]);

    useEffect(() => {
        if (activeTab === "combo" || activeTab === "menuItem") {
            if (parentId) fetchItems();
        } else {
            fetchItems();
        }
    }, [fetchItems, activeTab, parentId]);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        setItems(arrayMove(items, oldIndex, newIndex));
        setDirty(true);
    };

    const handleCancel = () => {
        setItems(originalItems);
        setDirty(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const body = activeTab === "sections"
                ? {
                    type: "sections",
                    items: items.map((item, i) => ({ _id: item._id, refType: item.refType, order: i })),
                }
                : {
                    type: activeTab,
                    items: items.map((item, i) => ({ _id: item._id, order: i })),
                    ...(parentId && { parentId }),
                };

            const res = await fetch(API_REARRANGE, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error();
            toast.success("Đã lưu thứ tự");
            setOriginalItems(items); // cập nhật snapshot mới
            setDirty(false);
        } catch {
            toast.error("Lưu thất bại");
        } finally {
            setSaving(false);
        }
    };

    const needsParent = activeTab === "combo" || activeTab === "menuItem";
    const parentLabel = activeTab === "combo" ? "loại combo" : "danh mục";

    return (
        <section>
            <HeaderCart text="Sắp xếp hiển thị sản phẩm" className="top-[70px]" />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profileData?.admin} />
                <div className="col-span-2">
                    <ContainerProfileLeft>
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
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

                        {/* Dropdown chọn parent */}
                        {needsParent && (
                            <select
                                value={parentId}
                                onChange={e => setParentId(e.target.value)}
                                className="w-full px-3 py-2 mb-4 border rounded-lg dark:bg-background dark:border-gray-700"
                            >
                                <option value="">-- Chọn {parentLabel} --</option>
                                {parentList.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        )}

                        {/* List */}
                        {loading ? (
                            <div className="py-12 text-center text-gray-400">Đang tải...</div>
                        ) : needsParent && !parentId ? (
                            <div className="py-12 text-center text-gray-400">Chọn {parentLabel} để xem danh sách</div>
                        ) : items.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">Không có dữ liệu</div>
                        ) : (
                            <div className="overflow-y-auto max-h-[400px] pr-1">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={items.map(i => i._id)} strategy={verticalListSortingStrategy}>
                                        <div className="flex flex-col gap-2">
                                            {items.map(item => (
                                                <SortableItem key={item._id} item={item} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={handleCancel}
                                disabled={!dirty || saving}
                                className="px-6 py-2 font-medium text-gray-600 transition-opacity border border-gray-300 rounded-lg dark:border-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!dirty || saving || (needsParent && !parentId)}
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