"use client";
import EditTableImage from "@/components/layout/EditTableImage";
import UserTabs from "@/components/layout/UserTabs";
import UseProfile from "@/components/UseProfile";
import { API_MENU_ITEMS } from "@/constant/constant";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function MenuItemsPage() {
  const { loading: profileLoading, data: profileData } = UseProfile();
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = { image, name, description, basePrice };
    const savingPromise = new Promise(async (resolve, reject) => {
      const response = await fetch(API_MENU_ITEMS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        resolve();
      } else {
        reject();
      }
      await toast.promise(savingPromise, {
        loading: "Saving...",
        success: "Saved",
        error: "Error",
      });
    });
  };

  if (profileLoading) {
    return "Loading user info...";
  }
  if (!profileData.admin) {
    return "Not an admin";
  }
  return (
    <section className="mt-8">
      <UserTabs isAdmin={profileData.admin}></UserTabs>
      <form onSubmit={handleFormSubmit} className="max-w-md mx-auto mt-8">
        <div
          className="grid items-start gap-4"
          style={{ gridTemplateColumns: ".3fr .7fr" }}
        >
          <div>
            <EditTableImage link={image} setLink={setImage} />
          </div>
          <div className="grow">
            <label htmlFor="">Item name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label htmlFor="">Base price</label>
            <input
              type="text"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
            />
            <button type="submit">Save</button>
          </div>
        </div>
      </form>
    </section>
  );
}
