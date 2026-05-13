"use client"
import FilterSort from '@/components/filter/FilterSort';
import InputSearch from '@/components/input/InputSearch';
import Paging from '@/components/layout/Paging';
import UserTabs from '@/components/layout/UserTabs';
import UseProfile from '@/components/UseProfile';
import { API_ORDERS } from '@/constant/constant';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import { useDebounce } from '@/hooks/useDebounce';
import HeaderCart from '@/modules/cart/HeaderCart';
import OrderTable from '@/modules/orders/OrderTable';
import React, { useEffect, useState } from 'react'

export default function OrdersPage() {
    const listOption = [
        { value: "newest", label: "Mới nhất" },
        { value: "oldest", label: "Cũ nhất" },
        { value: "asc", label: "Tên A-Z" },
        { value: "desc", label: "Tên Z-A" },
    ];
    const paidOption = [
        { value: "", label: "Tất cả" },
        { value: "true", label: "Đã thanh toán" },
        { value: "false", label: "Chưa thanh toán" },
    ];
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const { loading, data: profile } = UseProfile();

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [paid, setPaid] = useState(null)
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOn, setTotalOn] = useState(0);
    const [totalOff, setTotalOff] = useState(0);

    const debouncedSearch = useDebounce(search, 400);

    // khi search thay đổi → reset về trang 1
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, sort]);

    useEffect(() => {
        fetchOrders();
    }, [debouncedSearch, sort, page,paid]);

    function fetchOrders() {
        setLoadingOrders(true);
        const params = new URLSearchParams({
            search: debouncedSearch,
            sort,
            page,
            ...(paid !== null && { paid }),
        });
        fetch(`${API_ORDERS}?${params}`).then(res => {
            res.json().then(data => {
                console.log(data)
                setOrders(data.orders);
                setTotal(data.total);
                setTotalPages(data.totalPages);
                setTotalOn(data.totalOn);
                setTotalOff(data.totalOff);
                setLoadingOrders(false);
            })
        })
    }

    if (loading) {
        return "Đang tải...";
    }
    if (!profile?.admin) {
        return "Not an admin";
    }
    return (
        <section className="">
            <HeaderCart text="Quản lý đơn hàng" />
            <div className="grid grid-cols-3 gap-6">
                <UserTabs isAdmin={profile.admin}></UserTabs>
                <div className="col-span-2">
                    <ContainerProfileLeft>
                        <div className="">
                            <h3 class="font-label-bold text-secondary uppercase tracking-wider">Danh sách món ăn</h3>

                            <div className="flex items-center gap-3 my-4">
                                <InputSearch search={search} setSearch={setSearch} placeholder="Nhập số điện thoại hoặc mã đơn hàng" />
                                <FilterSort sort={sort} setSort={setSort} listOption={listOption} />
                                <FilterSort sort={paid} setSort={setPaid} listOption={paidOption} />
                            </div>
                            <div>
                                <div className='flex items-center gap-4'>
                                    <div className='h-4 bg-red-200 w-9' ></div>
                                    <p className='text-red-500'>Chưa thanh toán</p>
                                </div>
                                <div className='flex items-center gap-4'>
                                    <div className='h-4 bg-green-200 w-9' ></div>
                                    <p className='text-green-700'>Đã thanh toán</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <OrderTable orders={orders} loadingForm={loadingOrders} />
                            </div>

                            <Paging
                                page={page}
                                setPage={setPage}
                                totalPages={totalPages}
                                total={total}
                                items={orders}
                            />
                        </div>
                    </ContainerProfileLeft>
                </div>
            </div>
        </section>
    );
}
