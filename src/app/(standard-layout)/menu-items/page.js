"use client";
import ButtonPrimary from "@/components/buttons/ButtonPrimary";
import FilterSort from "@/components/filter/FilterSort";
import PlusIcon from "@/components/icons/PlusIcon";
import InputSearch from "@/components/input/InputSearch";
import Paging from "@/components/layout/Paging";
import TotalDashboard from "@/components/layout/TotalDashboard";
import UserTabs from "@/components/layout/UserTabs";
import LoadingCat from "@/components/loading/LoadingCat";
import UseProfile from "@/components/UseProfile";
import { API_CATEGORIES, API_MENU_ITEMS, LIST_OPTION, STATUS_OPTIONS_FILTER } from "@/constant/constant";
import { MENU_ITEM_NEW_ROUTE } from "@/constant/routesApp";
import ContainerProfileLeft from "@/container/ContainerProfileLeft";
import { useDebounce } from "@/hooks/useDebounce";
import HeaderCart from "@/modules/cart/HeaderCart";
import MenuItemsTable from "@/modules/menu-items/MenuItemsTable";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MenuItemsPage() {
  const [loadingForm, setLoadingForm] = useState(false);
  const sTrans = useTranslations("System");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOn, setTotalOn] = useState(0);
  const [totalOff, setTotalOff] = useState(0);
  const [categories, setCategories] = useState([]);

  const debouncedSearch = useDebounce(search, 400);

  const [category, setCategory] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const { loading: profileLoading, data: profileData } = UseProfile();

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // khi search thay đổi → reset về trang 1
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchMenuItems();
    }
  }, [debouncedSearch, sort, status, category]);

  useEffect(() => {
    fetchMenuItems();
    fetch(`${API_CATEGORIES}?all=true`).then(res => {
      res.json().then(data => {
        setCategories(data?.categories);
      })
    })
  }, [page]);

  const fetchMenuItems = () => {
    const params = new URLSearchParams({
      search: debouncedSearch,
      sort,
      page,
      status,
      category,
    });

    fetch(`${API_MENU_ITEMS}?${params}`).then((res) =>
      res.json().then((data) => {
        setMenuItems(data.menuItems);
        setTotal(data.total);
        setTotalOn(data.totalOn);
        setTotalOff(data.totalOff);
        setTotalPages(data.totalPages);
        setTotalAll(data.totalAll);
      })
    );
  }

  const handleMenuItemDelete = async (id) => {
    setLoadingForm(true);
    const promise = new Promise(async (resolve, reject) => {
      const response = await fetch(`${API_MENU_ITEMS}?_id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        resolve();
        fetchMenuItems();
      } else {
        reject();
      }
      await toast.promise(promise, {
        loading: sTrans("Đang xóa"),
        success: sTrans("Đã xóa"),
        error: sTrans("Lỗi"),
      });
      setLoadingForm(false);
    })
  }

  const categoryOptions = [
    { value: "", label: "Tất cả danh mục" },
    ...categories.map((cat) => ({ value: cat._id, label: cat.name })),
  ];

  if (profileLoading) {
    return <div className="mb-[100px]"><LoadingCat /></div>;
  }
  if (!profileData.admin) {
    return "Not an admin";
  }
  return (
    <section className="">
      <HeaderCart text="Quản lý món ăn" className={"top-[70px]"} />
      <div className="grid gap-6 md:grid-cols-3">
        <UserTabs isAdmin={profileData.admin}></UserTabs>
        <div className="min-w-0 col-span-2">
          <ContainerProfileLeft >
            <div className="flex justify-end">
              <Link className="w-max" href={MENU_ITEM_NEW_ROUTE}><ButtonPrimary className={"w-max p-4 flex items-center gap-2"}> <PlusIcon /> {sTrans("Tạo món ăn mới")}</ButtonPrimary></Link>
            </div>
            <div className="">
              <h3 class="font-label-bold text-secondary uppercase tracking-wider">{sTrans("Danh sách món ăn")}</h3>

              <div className="flex flex-wrap items-center gap-3 my-4">
                <div className="w-full">
                  <InputSearch search={search} setSearch={setSearch} placeholder={sTrans("Nhập tên món ăn")} />
                </div>
                <FilterSort sort={status} setSort={setStatus} listOption={STATUS_OPTIONS_FILTER} />
                <FilterSort sort={category} setSort={setCategory} listOption={categoryOptions} />
                <FilterSort sort={sort} setSort={setSort} listOption={LIST_OPTION} />

              </div>

              <MenuItemsTable menuItems={menuItems} handleMenuItemDelete={handleMenuItemDelete} loadingForm={loadingForm} categories={categories} />

              <Paging
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                total={total}
                items={menuItems}
              />
            </div>
          </ContainerProfileLeft>
        </div>
      </div>
      <TotalDashboard quantityAll={totalAll} textAll="Tổng món ăn" textOn="Món ăn đang kinh doanh" textOff="Món ăn tạm đóng" quantityOn={totalOn} quantityOff={totalOff} />
    </section>
  );
}
