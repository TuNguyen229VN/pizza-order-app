"use client"
import Carousel from "@/components/carousel/Carousel";
import NotFindLayout from "@/components/layout/NotFindLayout";
import SectionHeader from "@/components/layout/SectionHeader";
import MenuItems from "@/components/menu/MenuItems";
import Slider from "@/components/slider/Slider";
import { API_BANNERS, API_CATEGORIES, API_COMBO, API_COMBO_TYPES, API_MENU_ITEMS, API_REARRANGE } from "@/constant/constant";
import { getCategoryIcon } from "@/libs/getCategoryIcon";
import { slugify } from "@/libs/slugify";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import RecommendMenuItems from "@/components/layout/RecommendMenuItems";
import MenuCombo from "@/components/menu/MenuCombo";
import SkeletonLoadingSlider from "@/components/skeleton/SkeletonLoadingSlider";
import SkeletonLoadingCarousel from "@/components/skeleton/SkeletonLoadingCarousel";
import SkeletonLoadingSection from "@/components/skeleton/SkeletonLoadingSection";


export default function Home() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [banners, setBanners] = useState([]);
  const [comboList, setComboList] = useState([]);
  const [comboTypeList, setComboTypeList] = useState([]);
  const [sectionOrder, setSectionOrder] = useState([]);

  // Chỉ 2 cái này block skeleton — categories + menuItems là đủ render sections đầu tiên
  // combo/comboTypes/order về sau thì orderedSections tự update thêm
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMenuItems, setLoadingMenuItems] = useState(true);

  const [hash, setHash] = useState("");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [openInputSearch, setOpenInputSearch] = useState(false);

  const sectionRefs = useRef({});
  const isScrollingTo = useRef(false);
  const hashRef = useRef("");

  useEffect(() => {
    // Mỗi fetch set state ngay khi về — không chờ nhau
    fetch(`${API_BANNERS}?all=true&statusFilter=on&useOrder=true`)
      .then(r => r.json())
      .then(data => setBanners(data.banners ?? []))
      .catch(err => console.error("Failed to fetch banners:", err))
      .finally(() => setLoadingBanners(false));

    fetch(`${API_CATEGORIES}?all=true&statusFilter=on&useOrder=true`)
      .then(r => r.json())
      .then(data => setCategories(data.categories ?? []))
      .catch(err => console.error("Failed to fetch categories:", err))
      .finally(() => setLoadingCategories(false));

    fetch(`${API_MENU_ITEMS}?all=true&status=on&useOrder=true`)
      .then(r => r.json())
      .then(data => setMenuItems(data.menuItems ?? []))
      .catch(err => console.error("Failed to fetch menu items:", err))
      .finally(() => setLoadingMenuItems(false));

    // 3 cái này không block skeleton — về sau thì sections tự update thêm
    fetch(`${API_COMBO}?all=true&status=on&useOrder=true`)
      .then(r => r.json())
      .then(data => setComboList(data.combos ?? []))
      .catch(err => console.error("Failed to fetch combos:", err));

    fetch(`${API_COMBO_TYPES}?all=true&status=on&useOrder=true`)
      .then(r => r.json())
      .then(data => setComboTypeList(data.comboTypes ?? []))
      .catch(err => console.error("Failed to fetch combo types:", err));

    fetch(`${API_REARRANGE}?type=sections`)
      .then(r => r.json())
      .then(data => setSectionOrder(data.sections ?? []))
      .catch(err => console.error("Failed to fetch section order:", err));
  }, []);

  const loadingSections = loadingCategories || loadingMenuItems;

  const dataReady = categories.length > 0 && menuItems.length > 0;
  const sectionsRendered = dataReady && !loadingSections;

  useEffect(() => {
    if (!sectionsRendered) return;
    const urlHash = window.location.hash.replace("#", "");
    if (!urlHash) return;
    setHash(urlHash);
    hashRef.current = urlHash;

    const doScroll = () => {
      const target = document.getElementById(urlHash);
      if (!target) return;
      const carousel = document.querySelector(".sticky");
      const offset = 100 + (carousel?.offsetHeight ?? 0);
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    };

    // Nếu tất cả resources đã load xong thì scroll ngay, không thì chờ
    if (document.readyState === "complete") {
      setTimeout(doScroll, 100); // nhỏ để tránh rAF race
    } else {
      window.addEventListener("load", doScroll, { once: true });
    }
  }, [sectionsRendered]);

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

  const handleSearch = useCallback(() => setActiveSearch(search.trim()), [search]);

  const getMenuItemsByCategory = useCallback((categoryId) =>
    menuItems.filter(item =>
      item.category == categoryId &&
      item.status === "on" &&
      (activeSearch === "" || item.name.toLowerCase().includes(activeSearch.toLowerCase()))
    ), [menuItems, activeSearch]);

  const getCombosByType = useCallback((comboTypeId) =>
    comboList.filter(item =>
      item?.comboType?._id == comboTypeId &&
      item.status === "on" &&
      (activeSearch === "" || item.name.toLowerCase().includes(activeSearch.toLowerCase()))
    ), [comboList, activeSearch]);

  const orderedSections = useMemo(() => {
    const allSections = [
      ...comboTypeList.map(c => ({ ...c, refType: "comboType" })),
      ...categories.map(c => ({ ...c, refType: "category" })),
    ];

    const visibleSections = allSections.filter(s => {
      if (s.status !== "on") return false;
      if (s.refType === "comboType") return getCombosByType(s._id).length > 0;
      return getMenuItemsByCategory(s._id).length > 0;
    });

    if (sectionOrder.length === 0) return visibleSections;

    const orderMap = new Map(sectionOrder.map(o => [o.refId, o.order]));
    const inOrder = visibleSections
      .filter(s => orderMap.has(s._id))
      .sort((a, b) => (orderMap.get(a._id) ?? 0) - (orderMap.get(b._id) ?? 0));

    const inOrderIds = new Set(inOrder.map(s => s._id));
    const rest = visibleSections.filter(s => !inOrderIds.has(s._id));

    return [...inOrder, ...rest];
  }, [categories, comboTypeList, sectionOrder, getCombosByType, getMenuItemsByCategory]);

  const carouselList = useMemo(() =>
    orderedSections.map(c => ({
      name: c.name,
      icons: getCategoryIcon(c.name),
      slug: slugify(c.name),
    })), [orderedSections]);

  const noResults = activeSearch && orderedSections.length === 0;

  return (
    <>
      {/* Banner: tắt skeleton ngay khi banners về, không chờ sections */}
      {loadingBanners ? (

        <SkeletonLoadingSlider />
      ) : (
        <Slider banners={banners} setHash={setHash} hash={hash} isScrollingTo={isScrollingTo} />
      )}

      {/* Carousel + Sections: chỉ chờ categories + menuItems */}
      {loadingSections ? (
        <SkeletonLoadingCarousel />
      ) : (
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
      )}

      {!openInputSearch && <RecommendMenuItems sectionRefs={sectionRefs} />}

      <section className="mt-8">
        {loadingSections ? (
          <>

            <SkeletonLoadingSection type="combo" count={2} />
            <SkeletonLoadingSection type="item" count={4} />
            <SkeletonLoadingSection type="item" count={4} />
          </>
        ) : (
          <>
            {orderedSections.map(section => (
              <div
                key={section._id}
                id={slugify(section.name)}
                ref={el => sectionRefs.current[section._id] = el}
              >
                <div className="text-center">
                  <SectionHeader mainHeader={section.name} urlHeader={section?.image} />
                </div>

                {section.refType === "comboType" ? (
                  <div className="grid gap-4 px-4 mt-4 mb-8 md:px-0 md:mb-12 md:mt-6 md:gap-6 md:grid-cols-2">
                    {getCombosByType(section._id).map(item => (
                      <MenuCombo key={item._id} {...item} categories={categories} />
                    ))}
                  </div>
                ) : (
                  <div className="grid mt-4 mb-8 md:mb-12 md:mt-6 md:gap-6 md:grid-cols-2">
                    {getMenuItemsByCategory(section._id).map(item => (
                      <MenuItems key={item._id} {...item} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {noResults && <NotFindLayout />}
          </>
        )}
      </section>
    </>
  );
}