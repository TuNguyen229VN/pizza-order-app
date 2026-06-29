"use client";
import HeaderCart from "@/modules/cart/HeaderCart";
import UserTabs from "@/components/layout/UserTabs";
import ContainerProfileLeft from "@/container/ContainerProfileLeft";
import LoadingCat from "@/components/loading/LoadingCat";
import UseProfile from "@/components/UseProfile";
import { API_DASHBOARD, ORDER_STATUS_LABEL, STATUS_COLOR, DASHBOARD_STATUS_OPTIONS } from "@/constant/constant";
import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import FilterSort from "@/components/filter/FilterSort";
import { useTranslations } from "next-intl";
import { getLabel } from "@/utils/i18n-utils";

const TruncatedTick = ({ x, y, payload }) => {
    const fullName = payload.value || "";
    const maxLength = 16;
    const displayName =
        fullName.length > maxLength ? `${fullName.slice(0, maxLength)}...` : fullName;

    return (
        <text x={x} y={y} dy={4} textAnchor="end" fontSize={12} fill="#374151">
            <title>{fullName}</title>
            {displayName}
        </text>
    );
};

const getLast12Months = () => {
    const now = new Date();
    const options = [{ value: "", label: "Tất cả các tháng" }];
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        options.push({ value, label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}` });
    }
    return options;
};

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

const StatCard = ({ label, value, sub }) => (
    <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-secondary">{value}</p>
        {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
);

const DashboardPage = () => {
    const { loading: profileLoading, data: profileData } = UseProfile();
    const [data, setData] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const monthOptions = getLast12Months();
    const sTrans = useTranslations("System")

    useEffect(() => {
        setLoadingData(true);
        const params = new URLSearchParams({ status: statusFilter, month: monthFilter });
        fetch(`${API_DASHBOARD}?${params}`)
            .then((res) => res.json())
            .then((json) => {
                setData(json);
                setLoadingData(false);
            })
            .catch(() => setLoadingData(false));
    }, [statusFilter, monthFilter]);

    if (profileLoading) {
        return <div className="mb-[100px]"><LoadingCat /></div>;
    }
    if (!profileData.admin) {
        return "Not an admin";
    }

    return (
        <section>
            <HeaderCart text="Thống kê tổng quan" className={"top-[70px]"} />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profileData.admin} />

                <div className="min-w-0 col-span-2 space-y-6">
                    {loadingData || !data ? (
                        <div className="mx-auto mt-20 w-max">{sTrans("Đang tải")}...</div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <FilterSort sort={statusFilter} setSort={setStatusFilter} listOption={DASHBOARD_STATUS_OPTIONS} />
                                <FilterSort sort={monthFilter} setSort={setMonthFilter} listOption={monthOptions} />
                            </div>

                            {/* 5 chỉ số tổng */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                <StatCard label={sTrans("Tổng doanh thu")} value={formatVND(data.totalRevenue)} />
                                <StatCard label={sTrans("Tổng đơn hàng")} value={data.totalOrders} />
                                <StatCard label={sTrans("Tổng khách hàng")} value={data.totalCustomers} />
                                <StatCard label={sTrans("Món đơn đã bán")} value={data.totalPizzaSold} />
                                <StatCard label={sTrans("Combo đã bán")} value={data.totalComboSold} />
                            </div>

                            {/* Doanh thu theo tháng */}
                            <ContainerProfileLeft>
                                <h3 className="mb-4 tracking-wider uppercase font-label-bold text-secondary">
                                    {sTrans("Doanh thu theo tháng")}
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.revenueByMonth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} />
                                        <Tooltip formatter={(v) => formatVND(v)} />
                                        <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ContainerProfileLeft>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Top 5 sản phẩm bán chạy */}
                                <ContainerProfileLeft>
                                    <h3 className="mb-4 tracking-wider uppercase font-label-bold text-secondary">
                                        {sTrans("Top 5 sản phẩm bán chạy")}
                                    </h3>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={getLabel(sTrans, data.topProducts)} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis type="category" dataKey="name" width={120} tick={<TruncatedTick />} />
                                            <Tooltip />
                                            <Bar dataKey="quantity" fill="#f97316" radius={[0, 6, 6, 0]} barSize={10} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ContainerProfileLeft>

                                {/* Tỷ lệ trạng thái đơn hàng */}
                                <ContainerProfileLeft>
                                    <h3 className="mb-4 tracking-wider uppercase font-label-bold text-secondary">
                                        {sTrans("Tỷ lệ trạng thái đơn hàng")}
                                    </h3>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={data.statusRatio}
                                                dataKey="count"
                                                nameKey="status"
                                                fontSize={14}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label={({ status, count }) => `${getLabel(sTrans, ORDER_STATUS_LABEL[status]) || getLabel(sTrans, status)}: ${count}`}
                                            >
                                                {data.statusRatio.map((entry, i) => (
                                                    <Cell key={i} fill={STATUS_COLOR[entry.status] || "#ccc"} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v, n, p) => [v, getLabel(sTrans, ORDER_STATUS_LABEL[p.payload.status]) || getLabel(sTrans, p.payload.status)]} />
                                            <Legend formatter={(v) => getLabel(sTrans, ORDER_STATUS_LABEL[v]) || getLabel(sTrans, v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ContainerProfileLeft>
                            </div>

                            {/* Đơn hàng mới nhất */}
                            <ContainerProfileLeft>
                                <h3 className="mb-4 tracking-wider uppercase font-label-bold text-secondary">
                                    {sTrans("Đơn hàng mới nhất")}
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-500 border-b">
                                                <th className="py-2">{sTrans("Khách hàng")}</th>
                                                <th className="py-2">{sTrans("Tổng tiền")}</th>
                                                <th className="py-2">{sTrans("Trạng thái")}</th>
                                                <th className="py-2">{sTrans("Ngày đặt hàng")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.latestOrders.map((o) => (
                                                <tr key={o._id} className="border-b last:border-0">
                                                    <td className="py-2"><p>{o.userName || "Khách"}</p><p title={o.userEmail} className="w-[180px] truncate text-secondary">{o.userEmail}</p></td>
                                                    <td className="py-2">{formatVND(o.totalOrder)}</td>
                                                    <td className="py-2">
                                                        <span
                                                            className="px-2 py-1 text-xs text-white rounded-full"
                                                            style={{ backgroundColor: STATUS_COLOR[o.status] }}
                                                        >
                                                            {getLabel(sTrans, ORDER_STATUS_LABEL[o.status]) || getLabel(sTrans, o.status)}
                                                        </span>
                                                    </td>
                                                    <td className="py-2">
                                                        {new Date(o.createdAt).toLocaleString("vi-VN")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ContainerProfileLeft>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DashboardPage;