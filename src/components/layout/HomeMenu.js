"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import MenuItems from "../menu/MenuItems";
import SectionHeader from "./SectionHeader";
import { API_MENU_ITEMS } from "@/constant/constant";

const HomeMenu = () => {
  const [bestSellers, setBestSellers] = useState([])
  useEffect(() => {
    fetch(API_MENU_ITEMS).then(res => {
      res.json().then(menuItems => {
        const bestSellers = menuItems.slice(-3);
        setBestSellers(bestSellers);
      })
    })
  }, [])

  return (
    <section className="">
      <div className="absolute left-0 right-0 justify-start w-full">
        <div className="absolute left-0 -top-[70px] text-left -z-10">
          <Image src={"/sallad1.png"} width={109} height={189} alt={"sallad"} />
        </div>
        <div className="absolute -top-[100px] right-0 -z-10">
          <Image src={"/sallad2.png"} width={107} height={195} alt={"sallad"} />
        </div>
      </div>
      <div className="mb-4 text-center">
        <SectionHeader subHeader={"check out"} mainHeader={"Our Best Sellers"} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {bestSellers.length > 0 && bestSellers.map((item) => (
          <MenuItems key={item._id} {...item} />
        ))}


      </div>
    </section>
  );
};

export default HomeMenu;
