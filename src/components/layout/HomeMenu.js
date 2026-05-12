"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import MenuItems from "../menu/MenuItems";
import SectionHeader from "./SectionHeader";
import { API_MENU_ITEMS } from "@/constant/constant";

const HomeMenu = () => {
  const [bestSellers, setBestSellers] = useState([])
  useEffect(() => {
    fetch(`${API_MENU_ITEMS}?all=true`).then(res => {
      res.json().then(data => {
        const bestSellers = data?.menuItems.slice(-3);
        setBestSellers(bestSellers);
      })
    })
  }, [])

  return (
    <section className="mt-4">
      <div className="mb-4 text-center">
        <SectionHeader subHeader={"check out"} mainHeader={"Our Best Sellers"} />
      </div>
      <div className="grid grid-cols-2 gap-6">
        {bestSellers.length > 0 && bestSellers.map((item) => (
          <MenuItems key={item._id} {...item} />
        ))}


      </div>
    </section>
  );
};

export default HomeMenu;
