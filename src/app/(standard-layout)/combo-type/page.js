"use client"
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import FilterSort from '@/components/filter/FilterSort';
import PlusIcon from '@/components/icons/PlusIcon';
import InputSearch from '@/components/input/InputSearch';
import Paging from '@/components/layout/Paging';
import TotalDashboard from '@/components/layout/TotalDashboard';
import UserTabs from '@/components/layout/UserTabs';
import UseProfile from '@/components/UseProfile';
import { API_CATEGORIES, API_COMBO_TYPES, LIST_OPTION, STATUS_OPTIONS_FILTER, } from '@/constant/constant';
import { COMBOTYPE_NEW_ROUTE } from '@/constant/routesApp';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import { useDebounce } from '@/hooks/useDebounce';
import HeaderCart from '@/modules/cart/HeaderCart';
import ComboTypeTable from '@/modules/combo-type/ComboTypeTable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

export default function ComboTypePage() {
    const { loading: profileLoading, data: profileData } = UseProfile();
    const [loadingForm, setLoadingForm] = useState(false);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalAll, setTotalAll] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOn, setTotalOn] = useState(0);
    const [totalOff, setTotalOff] = useState(0);
    const [comboTypes, setComboTypes] = useState([]);
    const [categories, setCategories] = useState([]);

    const debouncedSearch = useDebounce(search, 400);

    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        } else {
            fetchComboTypes();
        }
    }, [debouncedSearch, sort, status]);

    const fetchComboTypes = () => {
        const params = new URLSearchParams({
            search: debouncedSearch,
            sort,
            page,
            status,
        });

        fetch(`${API_COMBO_TYPES}?${params}`).then((res) =>
            res.json().then((data) => {
                setComboTypes(data.comboTypes);
                setTotal(data.total);
                setTotalOn(data.totalOn);
                setTotalOff(data.totalOff);
                setTotalPages(data.totalPages);
                setTotalAll(data.totalAll);
            })
        );
    }


    useEffect(() => {
        fetchComboTypes();
        fetch(`${API_CATEGORIES}?all=true`).then(res => {
            res.json().then(data => {
                setCategories(data?.categories);
            })
        })
    }, [page]);

    const handleMenuItemDelete = async (id) => {
        setLoadingForm(true);
        const promise = new Promise(async (resolve, reject) => {
            const response = await fetch(`${API_COMBO_TYPES}?_id=${id}`, {
                method: "DELETE",
            })
            if (response.ok) {
                resolve();
                fetchComboTypes();
            } else {
                reject();
            }
            await toast.promise(promise, {
                loading: "Đang xóa...",
                success: "Đã xóa",
                error: "Lỗi",
            });
            setLoadingForm(false);
        })
    }

    if (profileLoading) {
        return "Loading user info...";
    }
    if (!profileData.admin) {
        return "Not an admin";
    }
    return (
        <section>
            <HeaderCart text="Quản lý loại combo" className={"top-[70px]"} />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profileData.admin} />
                <div className="min-w-0 col-span-2">
                    <ContainerProfileLeft >
                        <div className="flex justify-end">
                            <Link className="w-max" href={COMBOTYPE_NEW_ROUTE}><ButtonPrimary className={"w-max p-4 flex items-center gap-2"}> <PlusIcon /> Tạo loại combo mới</ButtonPrimary></Link>
                        </div>
                        <div className="">
                            <h3 class="font-label-bold text-secondary uppercase tracking-wider">Danh sách loại combo</h3>

                            <div className="flex items-center gap-3 my-4">
                                <InputSearch search={search} setSearch={setSearch} placeholder="Nhập tên loại combo" />
                                <FilterSort sort={sort} setSort={setSort} listOption={LIST_OPTION} />
                                <FilterSort sort={status} setSort={setStatus} listOption={STATUS_OPTIONS_FILTER} />
                            </div>
                            <ComboTypeTable comboTypes={comboTypes} loadingForm={loadingForm} handleMenuItemDelete={handleMenuItemDelete} categories={categories} />
                            <Paging
                                page={page}
                                setPage={setPage}
                                totalPages={totalPages}
                                total={total}
                                items={comboTypes}
                            />
                        </div>
                    </ContainerProfileLeft>
                </div>
            </div>
            <TotalDashboard quantityAll={totalAll} textAll="Tổng loại combo" textOn="Loại combo đang kinh doanh" textOff="Loại combo tạm đóng" quantityOn={totalOn} quantityOff={totalOff} />
        </section>
    )
}
