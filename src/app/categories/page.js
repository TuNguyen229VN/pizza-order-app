"use client";
import UserTabs from "@/components/layout/UserTabs";
import UseProfile from "@/components/UseProfile";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CategoriesPage = () => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState("");
  const { loading: profileLoading, data: profileData } = UseProfile();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch("/api/categories").then((res) => {
      res.json().then((categories) => {
        setCategories(categories);
      });
    });
  };
  if (profileLoading) {
    return "Loading user info";
  }
  if (!profileData) {
    return "Not an admin";
  }

  const handleNewCategorySubmit = async (ev) => {
    ev.preventDefault();
    const creationPromise = new Promise(async (resolve, reject) => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      setNewCategoryName("");
      fetchCategories();
      if (response.ok) {
        resolve();
      } else {
        reject();
      }
    });
    toast.promise(creationPromise, {
      loading: "Creating your new category...",
      success: "Category created",
      error: "Error,sorry",
    });
  };
  return (
    <section className="max-w-lg mx-auto mt-8">
      <UserTabs isAdmin={profileData} />
      <form className="mt-8" onSubmit={handleNewCategorySubmit}>
        <div className="flex items-end gap-2">
          <div className="grow">
            <label htmlFor="">New category name</label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(ev) => setNewCategoryName(ev.target.value)}
            />
          </div>
          <div className="pb-2">
            <button className="border border-primary" type="submit">
              Create
            </button>
          </div>
        </div>
      </form>
      <ul>
        <h2 className="mt-8 text-sm text-gray-500">Edit category:</h2>
        {categories?.length > 0 &&
          categories.map((category) => (
            <div
              className="flex gap-1 p-2 px-4 mb-2 bg-gray-200 cursor-pointer rounded-xl"
              key={category._id}
            >
              {category.name}
            </div>
          ))}
      </ul>
    </section>
  );
};

export default CategoriesPage;
