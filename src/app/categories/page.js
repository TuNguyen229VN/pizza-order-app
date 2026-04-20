"use client";
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
      if(editedCategory){
        data._id=editedCategory._id;
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
  return (
    <section className="max-w-lg mx-auto mt-8">
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
          <div className="pb-2">
            <button className="border border-primary" type="submit">
              {editedCategory ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </form>
      <ul>
        <h2 className="mt-8 text-sm text-gray-500">Edit category:</h2>
        {categories?.length > 0 &&
          categories.map((category) => (
            <button
              onClick={() => {
                setEditedCategory(category);
                setCategoryName(category.name);
              }}
              className="flex gap-1 p-2 px-4 mb-1 bg-gray-200 cursor-pointer rounded-xl"
              key={category._id}
            >
              <span>{category.name}</span>
            </button>
          ))}
      </ul>
    </section>
  );
};

export default CategoriesPage;
