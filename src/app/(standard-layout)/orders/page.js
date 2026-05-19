"use client"
import FilterSort from '@/components/filter/FilterSort';
import InputSearch from '@/components/input/InputSearch';
import Paging from '@/components/layout/Paging';
import TotalDashboard from '@/components/layout/TotalDashboard';
import UserTabs from '@/components/layout/UserTabs';
import UseProfile from '@/components/UseProfile';
import { API_ORDERS, LIST_OPTION, PAID_OPTION } from '@/constant/constant';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import { useDebounce } from '@/hooks/useDebounce';
import HeaderCart from '@/modules/cart/HeaderCart';
import OrderTable from '@/modules/orders/OrderTable';
import React, { useEffect, useState } from 'react'

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const { loading, data: profile } = UseProfile();

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [paid, setPaid] = useState(null)
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAll, setTotalAll] = useState(0);
    const [totalOn, setTotalOn] = useState(0);
    const [totalOff, setTotalOff] = useState(0);

    const debouncedSearch = useDebounce(search, 400);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        }
    }, [page, totalPages]);


    // khi search thay đổi → reset về trang 1
    useEffect(() => {
        if (page !== 1) {
            setPage(1); // để effect của page tự fetch
        } else {
            fetchOrders(); // page đã = 1 rồi, fetch luôn
        }
    }, [debouncedSearch, sort, paid]);

    useEffect(() => {
        fetchOrders();
    }, [page]);

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
                setOrders(data.orders);
                setTotal(data.total);
                setTotalPages(data.totalPages);
                setTotalAll(data.totalAll);
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
            <HeaderCart text="Quản lý đơn hàng" className={"top-[70px]"} />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profile.admin}></UserTabs>
                <div className="min-w-0 col-span-2">
                    <ContainerProfileLeft>
                        <div className="">
                            <h3 class="font-label-bold text-secondary uppercase tracking-wider">Danh sách món ăn</h3>

                            <div className="flex items-center gap-3 my-4">
                                <InputSearch search={search} setSearch={setSearch} placeholder="Nhập số điện thoại hoặc mã đơn hàng" />
                                <FilterSort sort={sort} setSort={setSort} listOption={LIST_OPTION} />
                                <FilterSort sort={paid} setSort={setPaid} listOption={PAID_OPTION} />
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

                            <OrderTable orders={orders} loadingForm={loadingOrders} />

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
            <TotalDashboard quantityAll={totalAll} textAll="Tổng hóa đơn" textOn="Hóa đơn đã thanh toán" textOff="Hóa đơn chưa thanh toán" quantityOn={totalOn} quantityOff={totalOff} />
        </section>
    );
}
