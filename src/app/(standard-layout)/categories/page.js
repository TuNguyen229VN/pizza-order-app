"use client";
import FilterSort from "@/components/filter/FilterSort";
import Trash from "@/components/icons/Trash";
import InputSearch from "@/components/input/InputSearch";
import EditTableImage from "@/components/layout/EditTableImage";
import Paging from "@/components/layout/Paging";
import TotalDashboard from "@/components/layout/TotalDashboard";
import UserTabs from "@/components/layout/UserTabs";
import ConfirmPopup from "@/components/popup/ConfirmPopup";
import UseProfile from "@/components/UseProfile";
import { API_CATEGORIES, API_UPLOAD_IMAGE } from "@/constant/constant";
import ContainerProfileLeft from "@/container/ContainerProfileLeft";
import { useDebounce } from "@/hooks/useDebounce";
import { useFormValidate } from "@/hooks/useFormValidate";
import { validators } from "@/libs/validators";
import HeaderCart from "@/modules/cart/HeaderCart";
import CategoriesForm from "@/modules/categories/CategoriesForm";
import CategoryTable from "@/modules/categories/CategoryTable";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CategoriesPage = () => {
  const listOption = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "asc", label: "Tên A-Z" },
    { value: "desc", label: "Tên Z-A" },
  ];
  const STATUS_OPTIONS = [
    { value: "on", label: "Đang kinh doanh" },
    { value: "off", label: "Tạm đóng" },
  ];
  
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState("");
  const { loading: profileLoading, data: profileData } = UseProfile();
  const [editedCategory, setEditedCategory] = useState(null);
  const [status, setStatus] = useState(editedCategory?.status || STATUS_OPTIONS[0].value);
  const [pendingFile, setPendingFile] = useState(null);     // file chờ upload
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);

  // --- state mới ---
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalOn, setTotalOn] = useState(0);
  const [totalOff, setTotalOff] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();

  // fetch lại mỗi khi search/sort/page thay đổi
  useEffect(() => {
    fetchCategories();
  }, [debouncedSearch, sort, page]);

  // khi search thay đổi → reset về trang 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  const fetchCategories = () => {
    const params = new URLSearchParams({
      search: debouncedSearch,
      sort,
      page,
    });
    fetch(`${API_CATEGORIES}?${params}`).then((res) =>
      res.json().then((data) => {
        setCategories(data.categories);
        setTotalOn(data.totalOn);
        setTotalOff(data.totalOff);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
    );
  };

  if (profileLoading) {
    return "Loading user info";
  }
  if (!profileData.admin) {
    return "Not an admin";
  }

  function handleFileSelect(file, localPreview) {
    setPendingFile(file);
    setPreviewImage(localPreview);
  }

  const handleCategorySubmit = async (ev) => {
    ev.preventDefault();
    if (loadingForm) return;

    setLoadingForm(true)
    const isValid = handleValidate({
      categoryName: {
        value: categoryName,
        rules: [validators.required("tên danh mục"), validators.minLength(2), validators.maxLength(200)],
      },
      status: {
        value: status,
        rules: [validators.requiredSelect("trạng thái")],
      },
    });

    setLoadingForm(false);
    if (!isValid) return;
    setLoadingForm(true);

    // Bước 2: Upload ảnh nếu có file mới
    let finalImage = pendingFile ? null : (editedCategory?.image ?? null);
    if (pendingFile) {
      const formData = new FormData();
      formData.set("file", pendingFile);
      const uploadRes = await fetch(API_UPLOAD_IMAGE, { method: "POST", body: formData });
      if (!uploadRes.ok) {
        setLoadingForm(false);
        toast.error("Upload ảnh thất bại");
        return;
      }
      const uploadData = await uploadRes.json();
      finalImage = uploadData?.url;
    }


    const creationPromise = new Promise(async (resolve, reject) => {
      const data = { name: categoryName, status, image: finalImage };
      if (editedCategory) {
        data._id = editedCategory._id;
      }
      const response = await fetch(API_CATEGORIES, {
        method: editedCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setCategoryName("");
      setEditedCategory(null);
      setStatus(STATUS_OPTIONS[0].value);
      setPreviewImage(null);
      setPendingFile(null);
      fetchCategories();
      if (response.ok) {
        resolve();
      } else {
        const errorData = await response.json().catch(() => null);
        reject(errorData);
      }
      setLoadingForm(false);
    });
    await toast.promise(creationPromise, {
      loading: editedCategory ? "Đang cập nhật..." : "Đang tạo mới...",
      success: editedCategory ? "Cập nhật thành công" : "Tạo mới thành công",
      error: (err) => {
        // Xử lý lỗi validation từ server
        if (err?.errors && typeof err.errors === 'object') {
          // ✅ Dùng setErrors để trigger re-render
          setErrors(prev => ({
            ...prev,
            ...err.errors // merge lỗi server vào errors hiện tại
          }));
          return err?.message || "Dữ liệu không hợp lệ";
        }
        return err?.message || "Cập nhật thất bại";
      },
    });
  };

  const handleCategoryDelete = async (_id) => {
    if (loadingForm) return;
    const promise = new Promise(async (resolve, reject) => {
      const response = await fetch(`${API_CATEGORIES}/?_id=${_id}`, { method: "DELETE" });
      if (response.ok) {
        resolve();
      } else {
        reject();
      }
    });

    await toast.promise(promise, {
      loading: "Đang xóa danh mục...",
      success: "Danh mục đã được xóa",
      error: "Có lỗi xảy ra, xin lỗi vì sự bất tiện này",
    });

    fetchCategories();
  };

  return (
    <section>
      <HeaderCart text="Quản lý danh mục" />
      <div className="grid grid-cols-3 gap-6">
        <UserTabs isAdmin={profileData} />
        <div className="col-span-2">
          <ContainerProfileLeft >
            <div className="relative w-full h-[100px] group mb-4 ">
              <EditTableImage
                classNameImage={"rounded-none"}
                link={editedCategory?.image}
                previewLink={previewImage}
                onFileSelect={handleFileSelect}
                loadingForm={loadingForm} />
            </div>

            <CategoriesForm categoryName={categoryName} clearError={clearError} editedCategory={editedCategory} errors={errors} handleCategorySubmit={handleCategorySubmit} loadingForm={loadingForm} pendingFile={pendingFile} previewImage={previewImage} setCategoryName={setCategoryName} setEditedCategory={setEditedCategory} setPendingFile={setPendingFile} setPreviewImage={setPreviewImage} setStatus={setStatus} status={status} registerRef={registerRef} STATUS_OPTIONS={STATUS_OPTIONS} />

          </ContainerProfileLeft>
          <ContainerProfileLeft className={"mt-6"}>
            <h3 class="font-label-bold text-secondary uppercase tracking-wider">Danh sách chi tiết</h3>

            {/* ✅ Thanh tìm kiếm + sort */}
            <div className="flex items-center gap-3 my-4">
              <InputSearch search={search} setSearch={setSearch} />
              <FilterSort sort={sort} setSort={setSort} listOption={listOption} />
            </div>

            <CategoryTable categories={categories} setEditedCategory={setEditedCategory} setCategoryName={setCategoryName} setStatus={setStatus} clearError={clearError} loadingForm={loadingForm} setPendingFile={setPendingFile} setPreviewImage={setPreviewImage} handleCategoryDelete={handleCategoryDelete} />
            
            <Paging
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              total={total}
              items={categories}
            />

          </ContainerProfileLeft>
        </div>
      </div>
      <TotalDashboard quantityAll={total} textAll="Tổng danh mục" textOn="Danh mục đang hoạt động" textOff="Danh mục tạm đóng" quantityOn={totalOn} quantityOff={totalOff} />
    </section>
  );
};

export default CategoriesPage;
