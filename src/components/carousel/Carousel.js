"use client"
import React, { useRef, useState, useEffect } from 'react'
import SearchIcon from '../icons/SearchIcon'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules'
import ChevronLeft from '../icons/ChevronLeft'
import ChevronRight from '../icons/ChevronRight'
import CloseIcon from '../icons/CloseIcon'
import { AiOutlineLike } from 'react-icons/ai'
import { useTranslations } from 'next-intl'

export default function Carousel({ carouselList = [], setHash, hash, isScrollingTo, search, setSearch, handleSearch, activeSearch, setActiveSearch, openInputSearch, setOpenInputSearch }) {
    const t = useTranslations('HomePage');
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const swiperRef = useRef(null);
    const [isBeginning, setIsBeginning] = useState(true)
    const [isEnd, setIsEnd] = useState(false)

    useEffect(() => {
        if (!swiperRef.current || !hash) return;

        if (hash === "recommendations") {
            swiperRef.current.slideTo(1, 300);
            return;
        }

        const idx = carouselList.findIndex(item => item.slug === hash);
        if (idx !== -1) {
            swiperRef.current.slideTo(idx + 2, 100);
        }
    }, [hash, carouselList]);

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

    const carouselRef = useRef(null);
    const handleClick = (slug) => {
        setHash(slug);
        window.history.replaceState(null, "", `#${slug}`);

        // Bật flag, scroll xong thì tắt
        isScrollingTo.current = true;

        const target = document.getElementById(slug);
        if (target) {
            const headerOffset = carouselRef.current
                ? carouselRef.current.getBoundingClientRect().bottom
                : 190;
            const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top, behavior: "smooth" });
        }

        // Tắt flag sau khi scroll xong (~800ms)
        setTimeout(() => {
            isScrollingTo.current = false;
        }, 800);
    };

    return (
        <div ref={carouselRef} className='sticky z-10 pt-3 md:pt-6 top-[65px] md:top-[80px] bg-white'>
            <div className="relative flex items-center pb-3 overflow-hidden">
                <div
                    className="flex items-center flex-shrink-0 gap-3 px-2 overflow-hidden transition-all duration-500 ease-in-out md:px-4 md:p-0"
                    style={{
                        maxWidth: openInputSearch ? '100%' : '0px',
                        opacity: openInputSearch ? 1 : 0,
                        width: '100%',
                        pointerEvents: openInputSearch ? 'auto' : 'none',
                    }}
                >
                    <div className='relative flex-1 min-w-0 '>
                        <input type="text" placeholder={t("Tìm kiếm mọi thứ bạn muốn")} className='w-full py-3 pl-5 pr-4 border rounded-md focus:border-black md:text-base' value={search} onChange={(ev) => setSearch(ev.target.value)} onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch()
                        }} />
                        {search?.length > 0 && <button className="absolute p-[1px] border rounded-full right-3 top-2/4 -translate-y-2/4 cursor-pointer" onClick={() => {
                            setSearch("");
                            setActiveSearch("")
                        }}><CloseIcon className="w-4 h-4" /></button>}
                    </div>
                    <button className='md:w-[180px] px-6 py-3 duration-300 font-medium text-white rounded-md bg-primary hover:bg-red-400 text-sm md:text-base' onClick={handleSearch}><p className='hidden md:block'>{t("Tìm kiếm")}</p><SearchIcon className='inline w-5 h-5 md:hidden' /></button>
                    <button className='text-sm md:text-base' onClick={() => {
                        setSearch("");
                        setActiveSearch("");
                        setOpenInputSearch(false);
                    }}><p className='hidden md:block'>{t("Đóng")}</p> <CloseIcon className='inline w-5 h-5 md:hidden' /></button>
                </div>
                <div
                    className="relative w-full overflow-hidden transition-all duration-500 ease-in-out md:h-[72px]"
                    style={{
                        maxWidth: openInputSearch ? '0px' : '100%',
                        opacity: openInputSearch ? 0 : 1,
                        pointerEvents: openInputSearch ? 'none' : 'auto',
                    }}
                >
                    {!isBeginning && (
                        <div className="absolute top-0 left-0 z-10 w-16 h-full pointer-events-none bg-gradient-to-r from-white to-transparent" />
                    )}
                    {!isEnd && (
                        <div className="absolute top-0 right-0 z-10 w-16 h-full pointer-events-none bg-gradient-to-l from-white to-transparent" />
                    )}

                    <Swiper
                        slidesPerView={'auto'}
                        slidesPerGroup={1}
                        spaceBetween={20}
                        centeredSlides={true}
                        centeredSlidesBounds={true}
                        breakpoints={{
                            480: {
                            },
                            640: {
                                spaceBetween: 20,
                            },
                            768: {
                            },
                            1024: {
                                spaceBetween: 60,
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
                        modules={[Navigation]}
                        className="w-full"
                    >
                        <SwiperSlide className="!w-auto">
                            <div className='flex flex-col items-center justify-center w-full gap-1 pb-3 text-sm text-center cursor-pointer md:text-base' onClick={() => setOpenInputSearch(true)}>
                                <SearchIcon className="w-4 h-4 md:w-6 md:h-6" />
                                <p>{t("Tìm kiếm")}</p>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="!w-auto">
                            <Link
                                href={`#recommendations`}
                                onClick={(e) => {
                                    e.preventDefault(); // chặn href scroll mặc định, dùng scrollIntoView thay thế
                                    handleClick("recommendations");
                                }}
                                className={`w-full text-center relative flex flex-col items-center justify-center gap-1 pb-3 uppercase transition-colors duration-300 ${"recommendations" === hash
                                    ? "text-primary"
                                    : ""
                                    }`}
                            >
                                <AiOutlineLike className="w-4 h-4 md:w-6 md:h-6" />
                                <p className='w-full text-sm whitespace-nowrap md:text-base'>{t("Bạn sẽ thích")}</p>

                                <span
                                    className={`absolute bottom-0 left-0 h-1 md:h-[6px] w-full rounded-full bg-primary transition-all duration-300 ${"recommendations" === hash
                                        ? "opacity-100 scale-x-100"
                                        : "opacity-0 scale-x-0"
                                        }`}
                                />
                            </Link>
                        </SwiperSlide>
                        {carouselList.length > 0 && carouselList.map(carouselItem => (
                            <SwiperSlide key={carouselItem.name} className="!w-auto">
                                <Link
                                    href={`#${carouselItem.slug}`}
                                    onClick={(e) => {
                                        e.preventDefault(); // chặn href scroll mặc định, dùng scrollIntoView thay thế
                                        handleClick(carouselItem.slug);
                                    }}
                                    className={`relative flex flex-col items-center justify-center gap-1 pb-3 uppercase transition-colors duration-300 w-full text-center ${carouselItem.slug === hash
                                        ? "text-primary"
                                        : ""
                                        }`}
                                >
                                    {carouselItem.icons}
                                    <p className='w-full text-sm md:text-base whitespace-nowrap'>{t.has(carouselItem.name) ? t(carouselItem.name) : carouselItem.name}</p>

                                    <span
                                        className={`absolute bottom-0 left-0 h-1 md:h-[6px] w-full rounded-full bg-primary transition-all duration-300 ${carouselItem.slug === hash
                                            ? "opacity-100 scale-x-100"
                                            : "opacity-0 scale-x-0"
                                            }`}
                                    />
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <button
                        ref={prevRef}
                        className={`absolute z-20 flex items-center justify-center text-black -translate-y-1/2 bg-white rounded-full w-5 h-5 md:w-7 md:h-7 left-2 top-1/2 shadow transition-opacity ${isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ChevronLeft strokeWidth={3} className="w-4 h-4 md:w-6 md:h-6" />
                    </button>

                    <button
                        ref={nextRef}
                        className={`absolute z-20 flex items-center justify-center text-black -translate-y-1/2 bg-white rounded-full w-5 h-5 md:w-7 md:h-7 right-2 top-1/2 shadow transition-opacity ${isEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ChevronRight strokeWidth={3} className="w-4 h-4 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        </div>
    )
}