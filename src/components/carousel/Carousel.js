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

export default function Carousel({ carouselList = [], setHash, hash, isScrollingTo, search, setSearch, handleSearch, activeSearch, setActiveSearch, openInputSearch, setOpenInputSearch }) {
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const swiperRef = useRef(null);
    const [isBeginning, setIsBeginning] = useState(true)
    const [isEnd, setIsEnd] = useState(false)

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

    const handleClick = (slug) => {
        setHash(slug);
        window.history.replaceState(null, "", `#${slug}`);

        // Bật flag, scroll xong thì tắt
        isScrollingTo.current = true;

        const target = document.getElementById(slug);
        if (target) {
            const headerOffset = 190;
            const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top, behavior: "smooth" });
        }

        // Tắt flag sau khi scroll xong (~800ms)
        setTimeout(() => {
            isScrollingTo.current = false;
        }, 800);
    };

    return (
        <div className='sticky z-10 pt-6 top-[80px] bg-white'>
            <div className="relative flex items-center pb-3 overflow-hidden">
                <div
                    className="flex items-center flex-shrink-0 gap-3 overflow-hidden transition-all duration-500 ease-in-out"
                    style={{
                        maxWidth: openInputSearch ? '100%' : '0px',
                        opacity: openInputSearch ? 1 : 0,
                        width: '100%',
                        pointerEvents: openInputSearch ? 'auto' : 'none',
                    }}
                >
                    <div className='relative flex-1 min-w-0'>
                        <input type="text" placeholder='Tìm kiếm mọi thứ bạn muốn' className='w-full py-3 pl-5 pr-4 text-sm border rounded-md focus:border-black md:text-base' value={search} onChange={(ev) => setSearch(ev.target.value)} onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch()
                        }} />
                        {search?.length > 0 && <button className="absolute p-[1px] border rounded-full right-3 top-2/4 -translate-y-2/4 cursor-pointer" onClick={() => {
                            setSearch("");
                            setActiveSearch("")
                        }}><CloseIcon className="w-4 h-4" /></button>}
                    </div>
                    <button className='md:w-[180px] px-6 py-3 duration-300 font-medium text-white rounded-md bg-primary hover:bg-red-400 text-sm md:text-base' onClick={handleSearch}>Tìm kiếm</button>
                    <button className='text-sm md:text-base' onClick={() => {
                        setSearch("");
                        setActiveSearch("");
                        setOpenInputSearch(false);
                    }}>Đóng</button>
                </div>


                <div
                    className="relative w-full overflow-hidden transition-all duration-500 ease-in-out h-[72px]"
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
                        slidesPerView={3.7}
                        slidesPerGroup={3}
                        spaceBetween={10}
                        breakpoints={{
                            480: {
                                slidesPerView: 4.7,
                            },
                            640: {
                                slidesPerView: 5.7,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 7.7,
                                spaceBetween: 30,
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
                    >
                        <SwiperSlide>
                            <div className='flex flex-col items-center justify-center gap-1 pb-3 text-sm cursor-pointer md:text-base' onClick={() => setOpenInputSearch(true)}>
                                <SearchIcon className="w-4 h-4 md:w-6 md:h-6" />
                                <p>Tìm kiếm</p>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide>
                            <Link
                                href={`#recommendations`}
                                onClick={(e) => {
                                    e.preventDefault(); // chặn href scroll mặc định, dùng scrollIntoView thay thế
                                    handleClick("recommendations");
                                }}
                                className={`relative flex flex-col items-center justify-center gap-1 pb-3 uppercase transition-colors duration-300 ${"recommendations" === hash
                                    ? "text-primary"
                                    : ""
                                    }`}
                            >
                                <AiOutlineLike className="w-4 h-4 md:w-6 md:h-6" />
                                <p className='text-sm md:text-base'>Bạn sẽ thích</p>

                                <span
                                    className={`absolute bottom-0 left-0 h-[6px] w-full rounded-full bg-primary transition-all duration-300 ${"recommendations" === hash
                                        ? "opacity-100 scale-x-100"
                                        : "opacity-0 scale-x-0"
                                        }`}
                                />
                            </Link>
                        </SwiperSlide>
                        {carouselList.length > 0 && carouselList.map(carouselItem => (
                            <SwiperSlide key={carouselItem.name}>
                                <Link
                                    href={`#${carouselItem.slug}`}
                                    onClick={(e) => {
                                        e.preventDefault(); // chặn href scroll mặc định, dùng scrollIntoView thay thế
                                        handleClick(carouselItem.slug);
                                    }}
                                    className={`relative flex flex-col items-center justify-center gap-1 pb-3 uppercase transition-colors duration-300 ${carouselItem.slug === hash
                                        ? "text-primary"
                                        : ""
                                        }`}
                                >
                                    {carouselItem.icons}
                                    <p className='text-sm md:text-base'>{carouselItem.name}</p>

                                    <span
                                        className={`absolute bottom-0 left-0 h-[6px] w-full rounded-full bg-primary transition-all duration-300 ${carouselItem.slug === hash
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