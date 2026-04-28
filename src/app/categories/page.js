"use client";
import DeleteButton from "@/components/DeleteButton";
import UserTabs from "@/components/layout/UserTabs";
import UseProfile from "@/components/UseProfile";
import { API_CATEGORIES } from "@/constant/constant";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CategoriesPage = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState("");
  const { loading: profileLoading, data: profileData } = UseProfile();
  const [editedCategory, setEditedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch(API_CATEGORIES).then((res) => {
      res.json().then((categories) => {
        setCategories(categories);
      });
    });
  };
  if (profileLoading) {
    return "Loading user info";
  }
  if (!profileData.admin) {
    return "Not an admin";
  }

  const handleCategorySubmit = async (ev) => {
    ev.preventDefault();
    const creationPromise = new Promise(async (resolve, reject) => {
      const data = { name: categoryName };
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
      fetchCategories();
      if (response.ok) {
        resolve();
      } else {
        reject();
      }
    });
    await toast.promise(creationPromise, {
      loading: editedCategory ? "Updating your category..." : "Creating your new category...",
      success: editedCategory ? "Category updated" : "Category created",
      error: "Error,sorry",
    });
  };

  const handleCategoryDelete = async (_id) => {
    const promise = new Promise(async (resolve, reject) => {
      const response = await fetch(`${API_CATEGORIES}/?_id=${_id}`, { method: "DELETE" });
      if (response.ok) {
        resolve();
      } else {
        reject();
      }
    });

    await toast.promise(promise, {
      loading: "Deleting category...",
      success: "Category deleted",
      error: "Error, sorry",
    });

    fetchCategories();
  };

  return (
    <section className="max-w-2xl mx-auto mt-8">
      <UserTabs isAdmin={profileData} />
      <form className="mt-8" onSubmit={handleCategorySubmit}>
        <div className="flex items-end gap-2">
          <div className="grow">
            <label htmlFor="">
              {editedCategory ? "Edit category name" : "New category name"}
              {editedCategory && <b>:{editedCategory.name}</b>}
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(ev) => setCategoryName(ev.target.value)}
            />
          </div>
          <div className="flex gap-2 pb-2">
            <button className="border border-primary" type="submit">
              {editedCategory ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => {
              setCategoryName("");
              setEditedCategory(null)
            }}>Cancel</button>
          </div>
        </div>
      </form>
      <ul>
        <h2 className="mt-8 text-sm text-gray-500">Existing categories:</h2>
        {categories?.length > 0 &&
          categories.map((category) => (
            <div
              className="flex items-center gap-1 p-2 px-4 mb-1 bg-gray-100 rounded-xl"
              key={category._id}
            >
              <div className="grow" >{category.name}</div>
              <div className="flex gap-1">
                <button type="button" onClick={() => {
                  setEditedCategory(category);
                  setCategoryName(category.name);
                }}>Edit</button>
                <DeleteButton label="Delete" onDelete={() => handleCategoryDelete(category._id)} />
              </div>
            </div>
          ))}
      </ul>
    </section>
  );
};

export default CategoriesPage;
