"use client"
import React, { useRef, useState } from 'react'
import SearchIcon from '../icons/SearchIcon'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, EffectFade, FreeMode, Navigation, Pagination } from 'swiper/modules'
import ChevronLeft from '../icons/ChevronLeft'
import ChevronRight from '../icons/ChevronRight'

export default function Carousel({ carouselList = [] }) {
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const [isBeginning, setIsBeginning] = useState(true)
    const [isEnd, setIsEnd] = useState(false)
    return (
        <div className='relative mt-10'>
            {/* Gradient trái */}
            {!isBeginning && (
                <div className="absolute top-0 left-0 z-10 w-16 h-full pointer-events-none bg-gradient-to-r from-white to-transparent" />
            )}

            {/* Gradient phải */}
            {!isEnd && (
                <div className="absolute top-0 right-0 z-10 w-16 h-full pointer-events-none bg-gradient-to-l from-white to-transparent" />
            )}

            <Swiper
                slidesPerView={7.7}
                slidesPerGroup={3}
                spaceBetween={30}
                onBeforeInit={(swiper) => {
                    swiper.params.navigation.prevEl = prevRef.current;
                    swiper.params.navigation.nextEl = nextRef.current;
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
                    <div className='flex flex-col items-center justify-center gap-1'>
                        <SearchIcon />
                        <p>Tìm kiếm</p>
                    </div>
                </SwiperSlide>
                {carouselList.length > 0 && carouselList.map(carouselItem => (
                    <SwiperSlide key={carouselItem.name}>
                        <Link href={"#"} className='flex flex-col items-center justify-center gap-1 uppercase'>
                            {carouselItem.icons}
                            <p>{carouselItem.name}</p>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Button trái - ẩn khi ở đầu */}
            <button
                ref={prevRef}
                className={`absolute z-20 flex items-center justify-center text-black -translate-y-1/2 bg-white rounded-full w-7 h-7 left-2 top-1/2 shadow transition-opacity ${isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <ChevronLeft strokeWidth={3} />
            </button>

            {/* Button phải - ẩn khi ở cuối */}
            <button
                ref={nextRef}
                className={`absolute z-20 flex items-center justify-center text-black -translate-y-1/2 bg-white rounded-full w-7 h-7 right-2 top-1/2 shadow transition-opacity ${isEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <ChevronRight strokeWidth={3} />
            </button>
        </div>
    )
}
