"use client";
import EditTableImage from "@/components/layout/EditTableImage";
import UserForm from "@/components/layout/UserForm";
import UserTabs from "@/components/layout/UserTabs";
import { API_PROFILE } from "@/constant/constant";
import { LOGIN_ROUTE } from "@/constant/routesApp";
import { ChecksumAlgorithm } from "@aws-sdk/client-s3";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const session = useSession();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);
  const { status, update } = session;
  useEffect(() => {
    if (status === "authenticated") {
      fetch(API_PROFILE).then((response) => {
        response.json().then((data) => {
          setUser(data);
          setIsAdmin(data.admin);
          setProfileFetched(true);
        });
      });
    }
  }, [session, status]);
  if (status === "unauthenticated") {
    return redirect(LOGIN_ROUTE);
  }
  if (status === "loading" || !profileFetched) {
    return "Loading...";
  }

  const handleProfileInfoUpdate = async (e, data) => {
    e.preventDefault();
    const savingPromise = new Promise(async (resolve, reject) => {
      const response = await fetch(API_PROFILE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        await update({ name: data.name });
        setUser(prev => ({ ...prev, ...data }));
        resolve();
      } else reject();
    });
    await toast.promise(savingPromise, {
      loading: "Saving...",
      success: "Profile saved",
      error: "Error",
    });
  };
  return (
    <section className="mt-8">
      <UserTabs isAdmin={isAdmin}></UserTabs>
      <div className="max-w-2xl mx-auto mt-8">
        <UserForm user={user} onSave={handleProfileInfoUpdate} />
      </div>
    </section>
  );
};

export default ProfilePage;
