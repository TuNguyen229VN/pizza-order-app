"use client";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import MenuItems from "../menu/MenuItems";
import SectionHeader from "./SectionHeader";
import { API_MENU_ITEMS } from "@/constant/constant";
import { CartContext } from "../AppContext";
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from "swiper/modules";
import ChevronLeft from "../icons/ChevronLeft";
import ChevronRight from "../icons/ChevronRight";
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SkeletonLoadingSectionHeader from "../skeleton/SkeletonLoadingSectionsHeader";
import SkeletonLoadingRecommend from "../skeleton/SkeletonLoadingRecommend";

const RecommendMenuItems = ({ sectionRefs = null, hasLine = true,
  slidesConfig = {
    mobile: 1.3,
    tablet: 2.3,
    desktop: 2.3,
  }
  , classNameTitle }) => {
  const [recommendMenuItems, setRecommendMenuItems] = useState([]);
  const { cartProducts } = useContext(CartContext);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [loadingRecommend, setLoadingRecommend] = useState(true)
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);


  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current) {
      const swiper = swiperRef.current
      swiper.params.navigation.prevEl = prevRef.current
      swiper.params.navigation.nextEl = nextRef.current
      swiper.navigation.destroy()
      swiper.navigation.init()
      swiper.navigation.update()
    }
  }, [])

  useEffect(() => {
    fetch(`${API_MENU_ITEMS + "/recommendations"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartProducts }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRecommendMenuItems(data?.menuItems || []);
      })
      .finally(
        () => setLoadingRecommend(false)
      );
  }, [])

  return (
    <section id="recommendations" className="mt-3 mb-8 md:mb-12" ref={(el) => {
      if (sectionRefs) {
        sectionRefs.current["recommendations"] = el;
      }
    }}>
      <div className="mb-4 text-center">
        {loadingRecommend ? <SkeletonLoadingSectionHeader hasImage={false} /> : <SectionHeader subHeader={"check out"} mainHeader={"Bạn sẽ thích"} hasLine={hasLine} classNameTitle={classNameTitle} />}
      </div>
      <div className="relative w-full">
        {loadingRecommend ?
        <SkeletonLoadingRecommend  count={3}/>
        : 
        <>
          {!isBeginning && (
            <div className="absolute top-0 left-0 z-10 w-16 h-full pointer-events-none bg-gradient-to-r from-white to-transparent" />
          )}
          {!isEnd && (
            <div className="absolute top-0 right-0 z-10 w-16 h-full pointer-events-none bg-gradient-to-l from-white to-transparent" />
          )}
          <Swiper
            slidesPerView={slidesConfig.mobile}
            slidesPerGroup={1}
            spaceBetween={10}
            breakpoints={{
              640: {
                slidesPerView: slidesConfig.tablet,
                slidesPerGroup: 2
              },
              768: {
                slidesPerView: slidesConfig.desktop,
                spaceBetween: 20
              }
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper
              setIsBeginning(swiper.isBeginning)
              setIsEnd(swiper.isEnd)
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning)
              setIsEnd(swiper.isEnd)
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            modules={[Navigation]}>

            {recommendMenuItems.length > 0 && recommendMenuItems.map((item) => (
              <SwiperSlide key={item._id}>
                <MenuItems recomStyle={"recomStyle"}  {...item} />
              </SwiperSlide>
            ))}
          </Swiper>
          <button
            ref={prevRef}
            className={`absolute z-10 flex items-center justify-center text-black -translate-y-1/2 bg-white rounded-full w-5 h-5 md:w-7 md:h-7 left-2 top-1/2 shadow transition-opacity ${isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronLeft strokeWidth={3} className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          <button
            ref={nextRef}
            className={`absolute z-10 flex items-center justify-center text-black -translate-y-1/2 bg-white rounded-full w-5 h-5 md:w-7 md:h-7 right-2 top-1/2 shadow transition-opacity ${isEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronRight strokeWidth={3} className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </>}

      </div>
    </section>
  );
};

export default RecommendMenuItems;
