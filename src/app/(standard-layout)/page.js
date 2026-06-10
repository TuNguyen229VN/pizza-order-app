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
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [loadingComboTypes, setLoadingComboTypes] = useState(true);
  const [loadingSectionOrder, setLoadingSectionOrder] = useState(true);

  const [hash, setHash] = useState("");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [openInputSearch, setOpenInputSearch] = useState(false);

  const sectionRefs = useRef({});
  const isScrollingTo = useRef(false);
  const hashRef = useRef("");
  const initialScrollDone = useRef(false);
  const scrollInitialized = useRef(false);
  const spyAttached = useRef(false);
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
      .catch(err => console.error("Failed to fetch combos:", err))
      .finally(() => setLoadingCombos(false));

    fetch(`${API_COMBO_TYPES}?all=true&status=on&useOrder=true`)
      .then(r => r.json())
      .then(data => setComboTypeList(data.comboTypes ?? []))
      .catch(err => console.error("Failed to fetch combo types:", err))
      .finally(() => setLoadingComboTypes(false));

    fetch(`${API_REARRANGE}?type=sections`)
      .then(r => r.json())
      .then(data => setSectionOrder(data.sections ?? []))
      .catch(err => console.error("Failed to fetch section order:", err))
      .finally(() => setLoadingSectionOrder(false));
  }, []);

  const loadingSections = loadingCategories || loadingMenuItems;

  const dataReady = categories.length > 0 && menuItems.length > 0;
  const scrollReady = !loadingCategories && !loadingMenuItems
    && !loadingCombos && !loadingComboTypes && !loadingSectionOrder;

  useEffect(() => {
    if (!scrollReady) return;
    if (scrollInitialized.current) return;
    const urlHash = window.location.hash.replace("#", "");
    if (!urlHash) {
      initialScrollDone.current = true; // không có hash → spy chạy luôn
      return;
    }
    setHash(urlHash);
    hashRef.current = urlHash;

    let attempts = 0;
    const MAX = 40;
    let scrollDone = false;

    const doScroll = (target, behavior = "smooth") => {
      const carousel = document.querySelector(".sticky");
      const offset = 100 + (carousel?.offsetHeight ?? 0);
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      isScrollingTo.current = true;
      window.scrollTo({ top, behavior });
    };

    const finalize = (urlHash) => {
      let timer;
      const onScrollStop = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          window.removeEventListener("scroll", onScrollStop);
          hashRef.current = urlHash;
          setHash(urlHash);
          window.history.replaceState(null, "", `#${urlHash}`);
          isScrollingTo.current = false;
          initialScrollDone.current = true;
        }, 150);
      };
      window.addEventListener("scroll", onScrollStop, { passive: true });
      timer = setTimeout(() => {
        window.removeEventListener("scroll", onScrollStop);
        hashRef.current = urlHash;
        setHash(urlHash);
        window.history.replaceState(null, "", `#${urlHash}`);
        isScrollingTo.current = false;
        initialScrollDone.current = true;
      }, 150);
    };

    const tryScroll = () => {
      const target = document.getElementById(urlHash);
      if (!target) {
        if (++attempts < MAX) setTimeout(tryScroll, 150);
        return;
      }

      doScroll(target, "smooth");

      const images = Array.from(document.querySelectorAll("img")).filter(img => !img.complete);

      if (images.length === 0) {
        // Không có ảnh nào cần chờ → finalize luôn
        finalize(urlHash);
        return;
      }

      // Có ảnh chưa load → KHÔNG finalize vội
      // isScrollingTo vẫn = true → spy bị chặn hoàn toàn
      let loaded = 0;
      const onLoad = () => {
        loaded++;
        if (loaded >= images.length) {
          // Tất cả ảnh xong → correct offset → finalize
          doScroll(target, "instant");
          finalize(urlHash);
        }
      };
      images.forEach(img => {
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onLoad, { once: true });
      });

      // Fallback 2s
      setTimeout(() => {
        if (!initialScrollDone.current) {
          doScroll(target, "instant");
          finalize(urlHash);
        }
      }, 2000);
    };

    setTimeout(tryScroll, 100); // giảm từ 300 → 100
  }, [scrollReady]);

  const allDataReady = dataReady && comboList.length > 0 && comboTypeList.length > 0;
  useEffect(() => {
    if (!allDataReady) return;
    if (spyAttached.current) return;
    spyAttached.current = true;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingTo.current) return;
        if (!initialScrollDone.current) return;

        // Lấy section đang visible nhiều nhất
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length === 0) return;

        const id = visible[0].target.id;
        if (id && id !== hashRef.current) {
          hashRef.current = id;
          setHash(id);
          window.history.replaceState(null, "", `#${id}`);
        }
      },
      {
        threshold: [0.1, 0.3, 0.5],
        rootMargin: "-100px 0px -50% 0px", // trigger khi section vào vùng trên
      }
    );

    Object.values(sectionRefs.current).filter(Boolean).forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
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
                      <MenuCombo key={item._id} {...item} categories={categories} menuItems={menuItems}/>
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