"use client";
import EditTableImage from "@/components/layout/EditTableImage";
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
  const [userName, setUserName] = useState("");
  const [image, setImage] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);
  const { status, update } = session;
  useEffect(() => {
    if (status === "authenticated") {
      // setUserName(session?.data?.user?.name);
      // setImage(session.data.user.image);
      fetch(API_PROFILE).then((response) => {
        response.json().then((data) => {
          setUserName(data.name);
          setImage(data.image);
          setPhone(data.phone);
          setStreetAddress(data.streetAddress);
          setPostalCode(data.postalCode);
          setCity(data.city);
          setCountry(data.country);
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

  const handleProfileInfoUpdate = async (e) => {
    e.preventDefault();
    const savingPromise = new Promise(async (resolve, reject) => {
      const response = await fetch(API_PROFILE, {
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
      if (response.ok) {
        update({ name: userName });
        resolve();
      } else reject();
    });
    toast.promise(savingPromise, {
      loading: "Saving...",
      success: "Profile saved",
      error: "Error",
    });
  };
  return (
    <section className="mt-8">
      <UserTabs isAdmin={isAdmin}></UserTabs>
      <div className="max-w-2xl mx-auto mt-8">
        <div className="flex gap-4">
          <div className="rounded-lg">
            <div className="relative p-2 rounded-lg max-w-[120px]">
              <EditTableImage link={image} setLink={setImage} />
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
