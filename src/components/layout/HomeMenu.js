import Image from "next/image";
import React from "react";
import MenuItems from "../menu/MenuItems";
import SectionHeader from "./SectionHeader";

const HomeMenu = () => {
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
       <SectionHeader subHeader={"check out"} mainHeader={"Menu"}/>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <MenuItems />
        <MenuItems />
        <MenuItems />
        <MenuItems />
        <MenuItems />
      </div>
    </section>
  );
};

export default HomeMenu;
