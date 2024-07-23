"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProfilePage = () => {
  const session = useSession();
  const [userName, setUserName] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { status } = session;
  useEffect(() => {
    if (status === "authenticated") {
      setUserName(session?.data?.user?.name);
    }
  }, [session, status]);
  if (status === "loading") {
    return "Loading...";
  }
  if (status === "unauthenticated") {
    return redirect("/login");
  }

  const userImage = session.data.user.image;

  const handleFileChange = async (e) => {
    const files = e?.target.files;
    if (files?.length === 1) {
      const data = new FormData;
      data.set("file", files[0]);
      const response=await fetch("/api/upload", {
        method: "POST",
        // headers: { "Content-Type": "multipart/form-data" },
        body: data,
      });
    }
  };

  const handleProfileInfoUpdate = async (e) => {
    e.preventDefault();
    setSaved(false);
    setIsSaving(true);
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userName,
      }),
    });
    setIsSaving(false);
    if (response.ok) {
      setSaved(true);
    }
  };
  return (
    <section className="mt-8">
      <h1 className="mb-4 text-4xl text-center text-primary">Profile</h1>
      <div className="max-w-md mx-auto">
        {saved && (
          <h2 className="p-4 text-center bg-green-100 border border-green-300 rounded-lg">
            Profile saved!
          </h2>
        )}
        {isSaving && (
          <h2 className="p-4 text-center bg-blue-100 border border-blue-300 rounded-lg">
            Saving...
          </h2>
        )}
        <div className="flex items-center gap-4">
          <div className="rounded-lg">
            <div className="relative p-2 rounded-lg">
              <Image
                className="object-cover w-full h-full mb-4 rounded-lg"
                src={userImage}
                width={250}
                height={250}
                alt="avatar"
              />
              <label>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span className="block p-2 text-center border border-gray-300 rounded-lg cursor-pointer">
                  Edit
                </span>
              </label>
            </div>
          </div>
          <form className="grow" onSubmit={handleProfileInfoUpdate}>
            <input
              type="text"
              placeholder="First and last name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <input type="email" disabled value={session.data.user.email} />
            <button type="submit">Save</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
