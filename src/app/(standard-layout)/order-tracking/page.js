"use client"
import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import CloseIcon from '@/components/icons/CloseIcon'
import NotFindLayout from '@/components/layout/NotFindLayout'
import Paging from '@/components/layout/Paging'
import UseProfile from '@/components/UseProfile'
import { API_ORDERS } from '@/constant/constant'
import { ORDERS_ROUTE } from '@/constant/routesApp'
import { useDebounce } from '@/hooks/useDebounce'
import { dbTimeForHuman } from '@/libs/datetime'
import HeaderCart from '@/modules/cart/HeaderCart'
import OrderTable from '@/modules/orders/OrderTable'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { HiDotsHorizontal } from 'react-icons/hi'
import { HiArrowRight } from 'react-icons/hi2'

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [paid, setPaid] = useState(null);
  const [page, setPage] = useState(1);
  const { loading, data: profile } = UseProfile();
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAll, setTotalAll] = useState(0);
  const [totalOn, setTotalOn] = useState(0);
  const [totalOff, setTotalOff] = useState(0);
  const [searched, setSearched] = useState(false)
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
      searchOrders(); // page đã = 1 rồi, fetch luôn
    }
  }, [sort, paid]);

  useEffect(() => {
    searchOrders();
  }, [page]);
  const searchOrders = () => {
    // if (!searched && search.trim() === "") {
    //   return;
    // }
    setSearched(false);
    setLoadingOrders(true);
    const params = new URLSearchParams({
      search: search.trim(),
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
        setSearched(true);
      })
    })
  }

  if (loading) {
    return "Đang tải...";
  }
  return (
    <section>
      <HeaderCart text="Theo dõi đơn hàng" />
      <div className="w-full p-4 mx-auto mt-0 bg-white md:border md:rounded-2xl md:p-6 md:w-1/2 md:mt-4">
        <p className="mb-4 text-sm text-center text-secondary">Chỉ áp dụng cho đơn hàng giao hàng</p>
        <div className="flex flex-col w-full gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={72}
              name="search"
              placeholder="Nhập số điện thoại hoặc mã đơn hàng"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value.trim()) {
                  setSearched(false);
                  setOrders([]);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchOrders()
              }}
              className="flex-1 w-full px-4 py-3 pr-10 border rounded-lg outline-none focus:border-black"
            />
            {search?.length > 0 && <button className="absolute p-[1px] border rounded-full right-3 top-2/4 -translate-y-2/4 cursor-pointer" onClick={() => { setSearch(""); setSearched(false); }}><CloseIcon className="w-4 h-4" /></button>}
          </div>
          <ButtonPrimary className={"md:w-max p-4"} onClick={searchOrders}><p>Tìm kiếm</p></ButtonPrimary>
        </div>
      </div>
      {searched &&
        !loadingOrders &&
        search.trim() &&
        orders.length === 0 && (
          <NotFindLayout title="Xin lỗi, không tìm thấy đơn hàng của bạn" />
        )}
      {searched && !loadingOrders && orders.length > 0 && (
        <div className='mt-4'>
          <OrderTable orders={orders} loadingForm={loadingOrders} />
          <Paging
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            total={total}
            items={orders}
          />
        </div>
      )}

    </section>
  )
}
