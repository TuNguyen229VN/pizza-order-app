"use client"
import Carousel from "@/components/carousel/Carousel";
import NotFindLayout from "@/components/layout/NotFindLayout";
import SectionHeader from "@/components/layout/SectionHeader";
import MenuItems from "@/components/menu/MenuItems";
import Slider from "@/components/slider/Slider";
import { API_BANNERS, API_CATEGORIES, API_COMBO, API_COMBO_TYPES, API_MENU_ITEMS } from "@/constant/constant";
import { getCategoryIcon } from "@/libs/getCategoryIcon";
import { slugify } from "@/libs/slugify";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import RecommendMenuItems from "@/components/layout/RecommendMenuItems";
import MenuCombo from "@/components/menu/MenuCombo";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [banners, setBanners] = useState([]);
  const [hash, setHash] = useState("");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [openInputSearch, setOpenInputSearch] = useState(false);
  const [comboList, setComboList] = useState([]);
  const [comboTypeList, setComboTypeList] = useState([]);

  const sectionRefs = useRef({});
  const isScrollingTo = useRef(false);
  const hashRef = useRef("");

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch(`${API_BANNERS}?all=true&statusFilter=on`).then(r => r.json()),
      fetch(`${API_CATEGORIES}?all=true&statusFilter=on`).then(r => r.json()),
      fetch(`${API_MENU_ITEMS}?all=true&status=on`).then(r => r.json()),
      fetch(`${API_COMBO}?all=true&status=on`).then(r => r.json()),
      fetch(`${API_COMBO_TYPES}?all=true&status=on`).then(r => r.json()),
    ])
      .then(([banners, categories, menuItems, combos, comboTypes]) => {
        setBanners(banners.banners ?? []);
        setCategories(categories.categories ?? []);
        setMenuItems(menuItems.menuItems ?? []);
        setComboList(combos.combos ?? []);
        setComboTypeList(comboTypes.comboTypes ?? []);
      })
      .catch(err => console.error("Failed to fetch home data:", err));
  }, []);

  // Scroll đến hash khi data load xong
  const dataReady = categories.length > 0 && menuItems.length > 0;
  useEffect(() => {
    if (!dataReady) return;
    const urlHash = window.location.hash.replace("#", "");
    if (!urlHash) return;

    setHash(urlHash);
    hashRef.current = urlHash;

    const target = document.getElementById(urlHash);
    const carousel = document.querySelector(".sticky");
    if (target) {
      const offset = 80 + (carousel?.offsetHeight ?? 0);
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [dataReady]);

  // Scroll listener
  const allDataReady = dataReady && comboList.length > 0 && comboTypeList.length > 0;
  useEffect(() => {
    if (!allDataReady) return;

    const handleScroll = () => {
      if (isScrollingTo.current) return;
      const els = Object.values(sectionRefs.current).filter(Boolean);
      const current = els.reduce((closest, el) => {
        const offset = el.getBoundingClientRect().top - window.innerHeight * 0.3;
        if (offset <= 0 && offset > (closest?.offset ?? -Infinity)) return { el, offset };
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
  }, [allDataReady]);

  const handleSearch = useCallback(() => {
    setActiveSearch(search.trim());
  }, [search]);

  // Memo toàn bộ derived data
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      if (c.status !== "on") return false;
      return menuItems.some(item =>
        item.category == c._id &&
        item.status === "on" &&
        (activeSearch === "" || item.name.toLowerCase().includes(activeSearch.toLowerCase()))
      );
    });
  }, [categories, menuItems, activeSearch]);

  const filteredComboType = useMemo(() => {
    return comboTypeList.filter(c => {
      if (c.status !== "on") return false;
      return comboList.some(item =>
        item?.comboType?._id == c._id &&
        item.status === "on" &&
        (activeSearch === "" || item.name.toLowerCase().includes(activeSearch.toLowerCase()))
      );
    });
  }, [comboTypeList, comboList, activeSearch]);

  const getMenuItemsByCategory = useCallback((categoryId) => {
    return menuItems.filter(item =>
      item.category == categoryId &&
      item.status === "on" &&
      (activeSearch === "" || item.name.toLowerCase().includes(activeSearch.toLowerCase()))
    );
  }, [menuItems, activeSearch]);

  const getCombosByType = useCallback((comboTypeId) => {
    return comboList.filter(item =>
      item?.comboType?._id == comboTypeId &&
      item.status === "on" &&
      (activeSearch === "" || item.name.toLowerCase().includes(activeSearch.toLowerCase()))
    );
  }, [comboList, activeSearch]);

  const carouselList = useMemo(() => {
    return [...filteredComboType, ...filteredCategories].map(c => ({
      name: c.name,
      icons: getCategoryIcon(c.name),
      slug: slugify(c.name),
    }));
  }, [filteredComboType, filteredCategories]);

  const noResults = activeSearch && filteredComboType.length === 0 && filteredCategories.length === 0;

  return (
    <>
      <Slider banners={banners} setHash={setHash} hash={hash} isScrollingTo={isScrollingTo} />
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
        {filteredComboType.map(c => (
          <div key={c._id} id={slugify(c.name)} ref={el => sectionRefs.current[c._id] = el}>
            <div className="text-center">
              <SectionHeader mainHeader={c.name} urlHeader={c?.image} />
            </div>
            <div className="grid gap-4 px-4 mt-4 mb-8 md:px-0 md:mb-12 md:mt-6 md:gap-6 md:grid-cols-2">
              {getCombosByType(c._id).map(item => (
                <MenuCombo key={item._id} {...item} categories={categories} />
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.map(c => (
          <div key={c._id} id={slugify(c.name)} ref={el => sectionRefs.current[c._id] = el}>
            <div className="text-center">
              <SectionHeader mainHeader={c.name} urlHeader={c?.image} />
            </div>
            <div className="grid mt-4 mb-8 md:mb-12 md:mt-6 md:gap-6 md:grid-cols-2">
              {getMenuItemsByCategory(c._id).map(item => (
                <MenuItems key={item._id} {...item} />
              ))}
            </div>
          </div>
        ))}

        {noResults && <NotFindLayout />}
      </section>
    </>
  );
}