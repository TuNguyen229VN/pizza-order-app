"use client"
import Carousel from "@/components/carousel/Carousel";
import Bars2 from "@/components/icons/Bars";
import HomeMenu from "@/components/layout/HomeMenu";
import SectionHeader from "@/components/layout/SectionHeader";
import MenuItems from "@/components/menu/MenuItems";
import Slider from "@/components/slider/Slider";
import { API_CATEGORIES, API_MENU_ITEMS } from "@/constant/constant";
import { useEffect, useState } from "react";

export default function Home() {
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  useEffect(() => {
    fetch(`${API_CATEGORIES}?all=true`).then(res => {
      res.json().then(data => setCategories(data.categories))
    })

    fetch(`${API_MENU_ITEMS}?all=true`).then(res => {
      res.json().then(data => setMenuItems(data.menuItems))
    })
  }, [])

  const listSlide = [
    { name: "slide1", url: "/images/slide1.webp" },
    { name: "slide2", url: "/images/slide2.webp" },
    { name: "slide3", url: "/images/slide3.webp" },
    { name: "slide3", url: "/images/slide4.jpg" }
  ]

  const carouselList = [
    { name: "Pizza1", icons: <Bars2></Bars2> },
    { name: "Pizza2", icons: <Bars2></Bars2> },
    { name: "Pizza3", icons: <Bars2></Bars2> },
    { name: "Pizza4", icons: <Bars2></Bars2> },
    { name: "Pizza5", icons: <Bars2></Bars2> },
    { name: "Pizza6", icons: <Bars2></Bars2> },
    { name: "Pizza7", icons: <Bars2></Bars2> },
    { name: "Pizza8", icons: <Bars2></Bars2> },
    { name: "Pizza9", icons: <Bars2></Bars2> },
    { name: "Pizza10", icons: <Bars2></Bars2> },
    { name: "Pizza11", icons: <Bars2></Bars2> },
    { name: "Pizza12", icons: <Bars2></Bars2> },
    { name: "Pizza13", icons: <Bars2></Bars2> },
    { name: "Pizza14", icons: <Bars2></Bars2> },
    { name: "Pizza15", icons: <Bars2></Bars2> },
    { name: "Pizza16", icons: <Bars2></Bars2> },
    { name: "Pizza17", icons: <Bars2></Bars2> },
  ]
  return (
    <>
      <Slider listSlide={listSlide} />
      <Carousel carouselList={carouselList} />
      <HomeMenu />
      <section className='mt-8'>

        {categories
          .filter(c =>
            c.status === "on" &&
            menuItems.filter(item => item.category == c._id && item.status === "on").length > 0
          )
          .map(c => {
            const items = menuItems.filter(item => item.category == c._id && item.status === "on");
            return (
              <div key={c._id}>
                <div className="text-center">
                  <SectionHeader mainHeader={c.name} urlHeader={c?.image} />
                </div>
                <div className="grid grid-cols-2 gap-6 mt-6 mb-12">
                  {items.map(item => (
                    <MenuItems key={item._id} {...item} />
                  ))}
                </div>
              </div>
            );
          })
        }
      </section>
    </>
  );
}
