"use client";
import ButtonPrimary from "@/components/buttons/ButtonPrimary";
import FilterSort from "@/components/filter/FilterSort";
import PlusIcon from "@/components/icons/PlusIcon";
import Right from "@/components/icons/Right";
import InputSearch from "@/components/input/InputSearch";
import EditTableImage from "@/components/layout/EditTableImage";
import Paging from "@/components/layout/Paging";
import TotalDashboard from "@/components/layout/TotalDashboard";
import UserTabs from "@/components/layout/UserTabs";
import UseProfile from "@/components/UseProfile";
import { API_CATEGORIES, API_MENU_ITEMS } from "@/constant/constant";
import { MENU_ITEM_EDIT_ROUTE, MENU_ITEM_NEW_ROUTE } from "@/constant/routesApp";
import ContainerProfileLeft from "@/container/ContainerProfileLeft";
import { useDebounce } from "@/hooks/useDebounce";
import HeaderCart from "@/modules/cart/HeaderCart";
import MenuItemsTable from "@/modules/menu-items/MenuItemsTable";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MenuItemsPage() {
  const listOption = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "asc", label: "Tên A-Z" },
    { value: "desc", label: "Tên Z-A" },
  ];

  const [loadingForm, setLoadingForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOn, setTotalOn] = useState(0);
  const [totalOff, setTotalOff] = useState(0);
  const [categories, setCategories] = useState([]);

  const debouncedSearch = useDebounce(search, 400);


  const [menuItems, setMenuItems] = useState([]);
  const { loading: profileLoading, data: profileData } = UseProfile();

  // khi search thay đổi → reset về trang 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  useEffect(() => {
    fetchMenuItems();
    fetch(`${API_CATEGORIES}?all=true`).then(res => {
      res.json().then(data => {
        setCategories(data?.categories);
      })
    })
  }, [debouncedSearch, sort, page]);

  const fetchMenuItems = () => {
    const params = new URLSearchParams({
      search: debouncedSearch,
      sort,
      page,
    });
    
    fetch(`${API_MENU_ITEMS}?${params}`).then((res) =>
      res.json().then((data) => {
        setMenuItems(data.menuItems);
        setTotal(data.total);
        setTotalOn(data.totalOn);
        setTotalOff(data.totalOff);
        setTotalPages(data.totalPages);
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
    <section className="">
      <HeaderCart text="Quản lý món ăn" />
      <div className="grid grid-cols-3 gap-6">
        <UserTabs isAdmin={profileData.admin}></UserTabs>
        <div className="col-span-2">
          <ContainerProfileLeft >
            <div className="">
              <Link className="flex justify-end button" href={MENU_ITEM_NEW_ROUTE}><ButtonPrimary className={"w-max p-4 flex items-center gap-2"}> <PlusIcon /> Tạo món ăn mới</ButtonPrimary></Link>
            </div>
            <div className="">
              <h3 class="font-label-bold text-secondary uppercase tracking-wider">Danh sách món ăn</h3>

              <div className="flex items-center gap-3 my-4">
                <InputSearch search={search} setSearch={setSearch} placeholder="Tìm kiếm món ăn..."/>
                <FilterSort sort={sort} setSort={setSort} listOption={listOption} />
              </div>

              <div className="overflow-x-auto">
                <MenuItemsTable menuItems={menuItems} handleMenuItemDelete={handleMenuItemDelete} loadingForm={loadingForm} categories={categories} />
              </div>

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
      <TotalDashboard quantityAll={total} textAll="Tổng món ăn" textOn="Món ăn đang kinh doanh" textOff="Món ăn tạm đóng" quantityOn={totalOn} quantityOff={totalOff} />
    </section>
  );
}
