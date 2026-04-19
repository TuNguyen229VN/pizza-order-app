"use client";
import UserTabs from "@/components/layout/UserTabs";
import UseProfile from "@/components/UseProfile";
import React, { use } from "react";

export default function MenuItemsPage() {
   const { loading: profileLoading, data: profileData } = UseProfile();
  if (profileLoading) {
    return "Loading user info...";
  }
  if (!profileData.admin) {
    return "Not an admin";
  }
  return (
    <section className="mt-8">
      <UserTabs isAdmin={profileData.admin}></UserTabs>
    </section>
  );
}
