"use client"
import Carousel from "@/components/carousel/Carousel";
import NotFindLayout from "@/components/layout/NotFindLayout";
import SectionHeader from "@/components/layout/SectionHeader";
import MenuItems from "@/components/menu/MenuItems";
import Slider from "@/components/slider/Slider";
import { API_CATEGORIES, API_MENU_ITEMS } from "@/constant/constant";
import { getCategoryIcon } from "@/libs/getCategoryIcon";
import { slugify } from "@/libs/slugify";
import { useEffect, useRef, useState } from "react";
import RecommendMenuItems from "@/components/layout/RecommendMenuItems";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [hash, setHash] = useState("");
  const sectionRefs = useRef({});
  const isScrollingTo = useRef(false);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [openInputSearch, setOpenInputSearch] = useState(false);
  const hashRef = useRef("");

  useEffect(() => {
    fetch(`${API_CATEGORIES}?all=true`)
      .then(res => res.json())
      .then(data => setCategories(data.categories))

    fetch(`${API_MENU_ITEMS}?all=true`)
      .then(res => res.json())
      .then(data => setMenuItems(data.menuItems))
  }, [])

  // data load xong: init hash từ URL + scroll đến đúng vị trí
  useEffect(() => {
    if (!categories.length || !menuItems.length) return;

    const urlHash = window.location.hash.replace("#", "");

    if (urlHash) {
      // Set active ngay
      setHash(urlHash);
      hashRef.current = urlHash;

      // Scroll đến đúng vị trí có tính offset
      const target = document.getElementById(urlHash);
      const carousel = document.querySelector(".sticky");

      if (target) {
        const carouselHeight = carousel?.offsetHeight ?? 0;
        const navbarHeight = 80;
        const offset = navbarHeight + carouselHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [categories, menuItems]);

  //Scroll listener để update hash khi cuộn
  useEffect(() => {
    if (!categories.length || !menuItems.length) return;

    const handleScroll = () => {
      if (isScrollingTo.current) return;

      const els = Object.values(sectionRefs.current).filter(Boolean);

      const current = els.reduce((closest, el) => {
        const rect = el.getBoundingClientRect();
        const offset = rect.top - window.innerHeight * 0.3;
        if (offset <= 0 && offset > (closest?.offset ?? -Infinity)) {
          return { el, offset };
        }
        return closest;
      }, null);

      if (current?.el) {
        const id = current.el.id;
        if (id !== hashRef.current) {
          hashRef.current = id;
          setHash(id);
          window.history.replaceState(null, "", `#${id}`);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories, menuItems]);

  const listSlide = [
    { name: "slide1", url: "/images/slide1.webp" },
    { name: "slide2", url: "/images/slide2.webp" },
    { name: "slide3", url: "/images/slide3.webp" },
    { name: "slide4", url: "/images/slide4.jpg" }
  ]

  const handleSearch = () => {
    setActiveSearch(search.trim())
  }

  // Lọc theo activeSearch thay vì search
  const filteredMenuItems = (categoryId) => {
    return menuItems.filter(item => {
      const matchCategory = item.category == categoryId && item.status === "on"
      const matchSearch = activeSearch === "" ||
        item.name.toLowerCase().includes(activeSearch.toLowerCase())
      return matchCategory && matchSearch
    })
  }

  // filteredCategories vẫn dùng activeSearch để ẩn cả section nếu không có item nào
  const filteredCategories = categories.filter(c => {
    if (c.status !== "on") return false
    return filteredMenuItems(c._id).length > 0
  })

  const carouselList = filteredCategories.map(c => ({
    name: c.name,
    icons: getCategoryIcon(c.name),
    slug: slugify(c.name)
  }));


  return (
    <>
      <Slider listSlide={listSlide} />
      <Carousel
        carouselList={carouselList}
        openInputSearch={openInputSearch}
        setOpenInputSearch={setOpenInputSearch}
        setHash={setHash}
        hash={hash}
        isScrollingTo={isScrollingTo}
        search={search}
        setSearch={setSearch}
        handleSearch={handleSearch}
        activeSearch={activeSearch}
        setActiveSearch={setActiveSearch}
      />
      {!openInputSearch && <RecommendMenuItems sectionRefs={sectionRefs} />}
      <section className='mt-8'>
        {filteredCategories.map(c => {
          const items = filteredMenuItems(c._id)
          return (
            <div
              key={c._id}
              id={slugify(c.name)}
              ref={el => sectionRefs.current[c._id] = el}
            >
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
        })}

        {activeSearch && filteredCategories.length === 0 && (
          <NotFindLayout />
        )}
      </section>
    </>
  );
}