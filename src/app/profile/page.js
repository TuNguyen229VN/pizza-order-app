"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const session = useSession();
  const [userName, setUserName] = useState("");
  const [image, setImage] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const { status } = session;
  useEffect(() => {
    if (status === "authenticated") {
      // setUserName(session?.data?.user?.name);
      // setImage(session.data.user.image);
      fetch("/api/profile").then((response) => {
        response.json().then((data) => {
          setUserName(data.name);
          setImage(data.image);
          setPhone(data.phone);
          setStreetAddress(data.streetAddress);
          setPostalCode(data.postalCode);
          setCity(data.city);
          setCountry(data.country);
        });
      });
    }
  }, [session, status]);
  if (status === "loading") {
    return "Loading...";
  }
  if (status === "unauthenticated") {
    return redirect("/login");
  }

  const handleFileChange = async (e) => {
    const files = e?.target.files;
    if (files?.length === 1) {
      const data = new FormData();
      data.set("file", files[0]);
      const uploadPromise = new Promise(async (resolve, reject) => {
        const response = await fetch("/api/upload", {
          method: "POST",
          // headers: { "Content-Type": "multipart/form-data" },
          body: data,
        });
        if (response.ok) {
          const link = await response.json();
          setImage(link?.url);
          resolve();
        } else {
          reject();
        }
      });
      toast.promise(uploadPromise, {
        loading: "Uploading...",
        success: "Upload completed",
        error: "Upload error",
      });
    }
  };

  const handleProfileInfoUpdate = async (e) => {
    e.preventDefault();
    const savingPromise = new Promise(async (resolve, reject) => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          image,
          phone,
          streetAddress,
          city,
          postalCode,
          country,
        }),
      });
      if (response.ok) resolve();
      else reject();
    });
    toast.promise(savingPromise, {
      loading: "Saving...",
      success: "Profile saved",
      error: "Error",
    });
  };
  return (
    <section className="mt-8">
      <h1 className="mb-4 text-4xl text-center text-primary">Profile</h1>
      <div className="max-w-md mx-auto">
        <div className="flex gap-4">
          <div className="rounded-lg">
            <div className="relative p-2 rounded-lg max-w-[120px]">
              {image && (
                <Image
                  className="object-cover w-full h-full mb-4 rounded-lg"
                  src={image}
                  width={250}
                  height={250}
                  alt="avatar"
                />
              )}
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
            <label htmlFor="">Fullname</label>
            <input
              type="text"
              placeholder="First and last name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <label htmlFor="">Email</label>
            <input type="email" disabled value={session.data.user.email} />
            <label htmlFor="">Phone Number</label>
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <label htmlFor="">Street Address</label>
            <input
              type="text"
              placeholder="Street address"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
            <div className="flex gap-2">
              <div>
                <label htmlFor="">City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="">Postal Code</label>
                <input
                  type="text"
                  placeholder="Postal code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
            <label htmlFor="">Country</label>
            <input
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <button type="submit">Save</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
