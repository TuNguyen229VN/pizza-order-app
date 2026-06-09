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
import { API_CATEGORIES, API_UPLOAD_IMAGE, LIST_OPTION, STATUS_OPTIONS, STATUS_OPTIONS_FILTER } from "@/constant/constant";
import ContainerProfileLeft from "@/container/ContainerProfileLeft";
import { useDebounce } from "@/hooks/useDebounce";
import { useFormValidate } from "@/hooks/useFormValidate";
import { uploadImage } from "@/libs/uploadImage";
import { validators } from "@/libs/validators";
import HeaderCart from "@/modules/cart/HeaderCart";
import CategoriesForm from "@/modules/categories/CategoriesForm";
import CategoryTable from "@/modules/categories/CategoryTable";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CategoriesPage = () => {

  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState("");
  const { loading: profileLoading, data: profileData } = UseProfile();
  const [editedCategory, setEditedCategory] = useState(null);
  const [status, setStatus] = useState(editedCategory?.status || STATUS_OPTIONS[0].value);
  const [pendingFile, setPendingFile] = useState(null);     // file chờ upload
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [imageInputKey, setImageInputKey] = useState(0);
  // --- state mới ---
  const [search, setSearch] = useState("");
  const [statusFilter, setstatusFilter] = useState("")
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [totalOn, setTotalOn] = useState(0);
  const [totalOff, setTotalOff] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const { errors, setErrors, registerRef, handleValidate, clearError } = useFormValidate();

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1); // để effect của page tự fetch
    } else {
      fetchCategories(); // page đã = 1 rồi, fetch luôn
    }
  }, [debouncedSearch, sort, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const fetchCategories = () => {
    const params = new URLSearchParams({
      search: debouncedSearch,
      sort,
      page,
      statusFilter,
    });
    fetch(`${API_CATEGORIES}?${params}`).then((res) =>
      res.json().then((data) => {
        setCategories(data.categories);
        setTotalOn(data.totalOn);
        setTotalOff(data.totalOff);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setTotalAll(data.totalAll);
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
      try {
        finalImage = await uploadImage(pendingFile);
      } catch (error) {
        setLoadingForm(false);
        toast.error(error.message);
        return;
      }
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
      <HeaderCart text="Quản lý danh mục" className={"top-[70px]"} />
      <div className="grid gap-6 md:grid-cols-3">
        <UserTabs isAdmin={profileData.admin} />
        <div className="min-w-0 col-span-2">
          <ContainerProfileLeft >
            <div className="relative w-full h-[100px] group mb-4 ">
              <EditTableImage
                key={imageInputKey}
                classNameImage={"rounded-none"}
                link={editedCategory?.image}
                previewLink={previewImage}
                onFileSelect={handleFileSelect}
                loadingForm={loadingForm} />
            </div>

            <CategoriesForm categoryName={categoryName} clearError={clearError} editedCategory={editedCategory} errors={errors} handleCategorySubmit={handleCategorySubmit} loadingForm={loadingForm} pendingFile={pendingFile} previewImage={previewImage} setCategoryName={setCategoryName} setEditedCategory={setEditedCategory} setPendingFile={setPendingFile} setPreviewImage={setPreviewImage} setStatus={setStatus} status={status} registerRef={registerRef} STATUS_OPTIONS={STATUS_OPTIONS} setImageInputKey={setImageInputKey} />

          </ContainerProfileLeft>
          <ContainerProfileLeft className={"mt-6"}>
            <h3 className="tracking-wider uppercase font-label-bold text-secondary">Danh sách chi tiết</h3>

            {/* ✅ Thanh tìm kiếm + sort */}
            <div className="flex flex-wrap items-center gap-3 my-4">
              <div className="w-full">
                <InputSearch search={search} setSearch={setSearch} />
              </div>
              <FilterSort sort={statusFilter} setSort={setstatusFilter} listOption={STATUS_OPTIONS_FILTER} />
              <FilterSort sort={sort} setSort={setSort} listOption={LIST_OPTION} />
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
      <TotalDashboard quantityAll={totalAll} textAll="Tổng danh mục" textOn="Danh mục đang hoạt động" textOff="Danh mục tạm đóng" quantityOn={totalOn} quantityOff={totalOff} />
    </section>
  );
};

export default CategoriesPage;
