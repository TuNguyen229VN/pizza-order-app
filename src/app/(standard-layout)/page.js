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
  const [spyEnabled, setSpyEnabled] = useState(false);

  const sectionRefs = useRef({});
  const isScrollingTo = useRef(false);
  const hashRef = useRef("");
  const initialScrollDone = useRef(false);
  const scrollInitialized = useRef(false);
  const observerRef = useRef(null);

  // — Fetch —
  useEffect(() => {
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

  const scrollReady = !loadingCategories && !loadingMenuItems
    && !loadingCombos && !loadingComboTypes && !loadingSectionOrder;

  // — Derived data —
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
      .filter(s => orderMap.has(s._id.toString()))
      .sort((a, b) => (orderMap.get(a._id.toString()) ?? 0) - (orderMap.get(b._id.toString()) ?? 0));

    const inOrderIds = new Set(inOrder.map(s => s._id.toString()));
    const rest = visibleSections.filter(s => !inOrderIds.has(s._id.toString()));

    return [...inOrder, ...rest];
  }, [categories, comboTypeList, sectionOrder, getCombosByType, getMenuItemsByCategory]);

  const carouselList = useMemo(() =>
    orderedSections.map(c => ({
      name: c.name,
      icons: getCategoryIcon(c.name),
      slug: slugify(c.name),
    })), [orderedSections]);

  // — Bật spy ngay khi sections render xong (không chờ combo/sectionOrder) —
  useEffect(() => {
    if (loadingSections) return;
    setSpyEnabled(true);
  }, [loadingSections]);

  // Thay toàn bộ useEffect khởi tạo observer
  useEffect(() => {
    if (!spyEnabled) return;

    const findActiveSection = () => {
      if (isScrollingTo.current) return;
      if (!initialScrollDone.current) return;

      const carousel = document.querySelector(".sticky");
      const offset = (carousel?.offsetHeight ?? 0) + 100 + 10;

      // Tìm section gần top nhất mà đã qua offset
      let activeId = null;
      let minDistance = Infinity;

      Object.entries(sectionRefs.current).forEach(([_, el]) => {
        if (!el) return;
        const top = el.getBoundingClientRect().top - offset;
        // Section đã scroll qua hoặc đang hiện
        if (top <= 0 && Math.abs(top) < minDistance) {
          minDistance = Math.abs(top);
          activeId = el.id;
        }
      });

      // Nếu chưa scroll tới section nào thì lấy section đầu tiên
      if (!activeId) {
        const first = Object.values(sectionRefs.current).find(Boolean);
        activeId = first?.id ?? null;
      }

      if (activeId && activeId !== hashRef.current) {
        hashRef.current = activeId;
        setHash(activeId);
        window.history.replaceState(null, "", `#${activeId}`);
      }
    };

    window.addEventListener("scroll", findActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", findActiveSection);
  }, [spyEnabled]);

  // — Initial scroll to hash — chờ scrollReady (cần sectionOrder để scroll đúng vị trí) —
  useEffect(() => {
    if (!scrollReady) return;
    if (scrollInitialized.current) return;
    scrollInitialized.current = true;

    const urlHash = window.location.hash.replace("#", "");
    if (!urlHash) {
      initialScrollDone.current = true;
      return;
    }

    setHash(urlHash);
    hashRef.current = urlHash;

    let attempts = 0;
    const MAX = 40;

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
        finalize(urlHash);
        return;
      }
      let loaded = 0;
      const onLoad = () => {
        loaded++;
        if (loaded >= images.length) {
          doScroll(target, "instant");
          finalize(urlHash);
        }
      };
      images.forEach(img => {
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onLoad, { once: true });
      });
      setTimeout(() => {
        if (!initialScrollDone.current) {
          doScroll(target, "instant");
          finalize(urlHash);
        }
      }, 2000);
    };

    setTimeout(tryScroll, 100);
  }, [scrollReady]);

  const handleSearch = useCallback(() => setActiveSearch(search.trim()), [search]);

  const noResults = activeSearch && orderedSections.length === 0;

  return (
    <>
      {loadingBanners ? (
        <SkeletonLoadingSlider />
      ) : (
        <Slider banners={banners} setHash={setHash} hash={hash} isScrollingTo={isScrollingTo} />
      )}
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
                ref={el => {
                  sectionRefs.current[section._id] = el;
                }}
              >
                <div className="text-center">
                  <SectionHeader mainHeader={section.name} urlHeader={section?.image} />
                </div>

                {section.refType === "comboType" ? (
                  <div className="grid gap-4 px-4 mt-4 mb-8 md:px-0 md:mb-12 md:mt-6 md:gap-6 md:grid-cols-2">
                    {getCombosByType(section._id).map(item => (
                      <MenuCombo key={item._id} {...item} categories={categories} menuItems={menuItems} />
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