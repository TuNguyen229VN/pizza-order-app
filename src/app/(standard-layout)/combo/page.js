"use client"
import ButtonPrimary from '@/components/buttons/ButtonPrimary'
import FilterSort from '@/components/filter/FilterSort'
import PlusIcon from '@/components/icons/PlusIcon'
import InputSearch from '@/components/input/InputSearch'
import Paging from '@/components/layout/Paging'
import TotalDashboard from '@/components/layout/TotalDashboard'
import UserTabs from '@/components/layout/UserTabs'
import LoadingCat from '@/components/loading/LoadingCat'
import UseProfile from '@/components/UseProfile'
import { API_CATEGORIES, API_COMBO, API_COMBO_TYPES, API_MENU_ITEMS, LIST_OPTION, STATUS_OPTIONS_FILTER } from '@/constant/constant'
import { COMBO_NEW_ROUTE } from '@/constant/routesApp'
import ContainerProfileLeft from '@/container/ContainerProfileLeft'
import { useDebounce } from '@/hooks/useDebounce'
import HeaderCart from '@/modules/cart/HeaderCart'
import ComboTable from '@/modules/combo/ComboTable'
import { getLabel } from '@/utils/i18n-utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function ComboPage() {
  const { loading: profileLoading, data: profileData } = UseProfile();
  const sTrans = useTranslations("System");
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingCombo, setLoadingCombo] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOn, setTotalOn] = useState(0);
  const [totalOff, setTotalOff] = useState(0);

  const [comboList, setComboList] = useState([]);
  const [comboTypeList, setComboTypeList] = useState([]);
  const [comboType, setComboType] = useState("");
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
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
      fetchCombo();
    }
  }, [debouncedSearch, sort, status, comboType]);

  const fetchCombo = () => {
    setLoadingCombo(true);
    const params = new URLSearchParams({
      search: debouncedSearch,
      sort,
      page,
      status,
      comboType
    });

    fetch(`${API_COMBO}?${params}`).then((res) =>
      res.json().then((data) => {
        setComboList(data.combos);
        setTotal(data.total);
        setTotalOn(data.totalOn);
        setTotalOff(data.totalOff);
        setTotalPages(data.totalPages);
        setTotalAll(data.totalAll);
        setLoadingCombo(false);
      })
    );
  }


  useEffect(() => {
    fetchCombo();

    fetch(`${API_COMBO_TYPES}?all=true`).then(res => {
      res.json().then(data => {
        setComboTypeList(data?.comboTypes);
      })
    })

    fetch(`${API_MENU_ITEMS}?all=true`).then(res => {
      res.json().then(data => {
        setMenuItems(data?.menuItems);
      })
    })

    fetch(`${API_CATEGORIES}?all=true`).then(res => {
      res.json().then(data => {
        setCategories(data?.categories);
      })
    })
  }, [page]);

  const handleComboDelete = async (id) => {
    setLoadingForm(true);

    const promise = (async () => {
      const response = await fetch(`${API_COMBO}?_id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        return Promise.reject(getLabel(sTrans,data?.message) || "Lỗi");
      }

      fetchCombo();
      return data;
    })();

    toast.promise(promise, {
      loading: "Đang xóa...",
      success: "Đã xóa",
      error: (msg) => msg || "Lỗi",
    });

    promise.catch(() => { }).finally(() => {
      setLoadingForm(false);
    });
  };

  const comboTypeOptions = [
    { value: "", label: "Tất cả loại combo" },
    ...comboTypeList.map((cbTypes) => ({ value: cbTypes._id, label: cbTypes.name })),
  ];

  if (profileLoading) {
    return <div className="mb-[100px]"><LoadingCat /></div>;
  }
  if (!profileData.admin) {
    return "Not an admin";
  }
  return (
    <section>
      <HeaderCart text="Quản lý combo" className={"top-[70px]"} />
      <div className="grid gap-6 md:grid-cols-3">
        <UserTabs isAdmin={profileData.admin} />
        <div className="min-w-0 col-span-2">
          <ContainerProfileLeft >
            <div className="flex justify-end">
              <Link className="w-max" href={COMBO_NEW_ROUTE}><ButtonPrimary className={"w-max p-4 flex items-center gap-2"}> <PlusIcon /> {sTrans("Tạo combo mới")}</ButtonPrimary></Link>
            </div>
            <div className="">
              <h3 class="font-label-bold text-secondary uppercase tracking-wider">{sTrans("Danh sách combo")}</h3>

              <div className="flex flex-wrap items-center gap-3 my-4">
                <div className='w-full'>
                  <InputSearch search={search} setSearch={setSearch} placeholder="Nhập tên combo" />
                </div>
                <FilterSort sort={status} setSort={setStatus} listOption={STATUS_OPTIONS_FILTER} />
                <FilterSort sort={comboType} setSort={setComboType} listOption={comboTypeOptions} />
                <FilterSort sort={sort} setSort={setSort} listOption={LIST_OPTION} />
              </div>
              <ComboTable comboList={comboList} loadingCombo={loadingCombo} loadingForm={loadingForm} handleComboDelete={handleComboDelete} menuItems={menuItems} categories={categories} />
              <Paging
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                total={total}
                items={comboList}
              />
            </div>
          </ContainerProfileLeft>
        </div>
      </div>
      <TotalDashboard quantityAll={totalAll} textAll="Tổng combo" textOn="Combo đang kinh doanh" textOff="Combo tạm đóng" quantityOn={totalOn} quantityOff={totalOff} />
    </section>
  )
}
