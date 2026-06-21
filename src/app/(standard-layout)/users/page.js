"use client";
import FilterSort from '@/components/filter/FilterSort';
import InputSearch from '@/components/input/InputSearch';
import Paging from '@/components/layout/Paging';
import TotalDashboard from '@/components/layout/TotalDashboard';
import UserTabs from '@/components/layout/UserTabs'
import LoadingCat from '@/components/loading/LoadingCat';
import UseProfile from '@/components/UseProfile';
import { API_PROFILE, API_USERS, LIST_OPTION, USER_STATUS_OPTION } from '@/constant/constant';
import ContainerProfileLeft from '@/container/ContainerProfileLeft';
import { useDebounce } from '@/hooks/useDebounce';
import HeaderCart from '@/modules/cart/HeaderCart';
import UserTable from '@/modules/users/UserTable';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

export default function UsersPage() {
    const { loading: profileLoading, data: profileData } = UseProfile();
    const sTrans = useTranslations("System");
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState("");
    const [loadingForm, setLoadingForm] = useState(false);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalAll, setTotalAll] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
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
            fetchUsers(); // page đã = 1 rồi, fetch luôn
        }
    }, [debouncedSearch, sort, status]);

    useEffect(() => {
        fetchUsers();
    }, [page])

    const fetchUsers = () => {
        const params = new URLSearchParams({
            search: debouncedSearch,
            sort,
            page,
            status,
        });

        fetch(`${API_USERS}?${params}`).then(response => {
            response.json().then(data => {
                setUsers(data.users)
                setTotal(data.total);
                setTotalOn(data.totalOn);
                setTotalOff(data.totalOff);
                setTotalPages(data.totalPages);
                setTotalAll(data.totalAll);
            })
        })
    }

    const handleUserBlock = async (user) => {
        if (user?.admin) {
            toast.error(sTrans("Không thể chặn người dùng là admin"));
            return;
        }

        if (loadingForm) return;

        setLoadingForm(true);

        const newStatus = user?.status === "on"
            ? "off"
            : "on";

        const promise = fetch(API_PROFILE, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                _id: user?._id,
                status: newStatus,
            }),
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error(sTrans("Cập nhật thất bại"));
            }



            return response.json();
        });

        try {
            await toast.promise(promise, {
                loading: sTrans("Đang cập nhật trạng thái"),
                success:
                    newStatus === "on"
                        ? sTrans("Đã khóa người dùng")
                        : sTrans("Đã mở khóa người dùng"),
                error: sTrans("APOLOGIZE_FOR_INCONVENIENCE"),
            });
            fetchUsers();
        } finally {
            setLoadingForm(false);
        }
    };

    if (profileLoading) {
        return <div className="mb-[100px]"><LoadingCat /></div>;
    }
    if (!profileData?.admin) {
        return "Not an admin";
    }

    return (
        <section className=''>
            <HeaderCart text="Quản lý người dùng" className={"top-[70px]"} />
            <div className="grid gap-6 md:grid-cols-3">
                <UserTabs isAdmin={profileData.admin}></UserTabs>
                <div className='min-w-0 col-span-2'>
                    <ContainerProfileLeft >
                        <h3 class="font-label-bold text-secondary uppercase tracking-wider">{sTrans("Danh sách người dùng")}</h3>

                        <div className="flex flex-wrap items-center gap-3 my-4">
                            <div className='w-full'>
                                <InputSearch search={search} setSearch={setSearch} placeholder="Nhập tên người dùng hoặc email" />
                            </div>
                            <FilterSort sort={status} setSort={setStatus} listOption={USER_STATUS_OPTION} />
                            <FilterSort sort={sort} setSort={setSort} listOption={LIST_OPTION} />
                        </div>

                        <UserTable users={users} loadingForm={loadingForm} handleUserBlock={handleUserBlock} />

                        <Paging
                            page={page}
                            setPage={setPage}
                            totalPages={totalPages}
                            total={total}
                            items={users}
                        />
                    </ContainerProfileLeft>
                </div>
            </div>
            <TotalDashboard quantityAll={totalAll} textAll="Tổng người dùng" textOn="Người dùng đang hoạt động" textOff="Người dùng bị chặn" quantityOff={totalOn} quantityOn={totalAll - totalOn} />
        </section>
    )
}
