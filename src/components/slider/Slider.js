"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// import required modules
import { EffectFade, Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ChevronRight from '../icons/ChevronRight';
import ChevronLeft from '../icons/ChevronLeft';

export default function Slider({ listSlide = [] }) {
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    return (
        <div className="relative w-full">
            <Swiper
                spaceBetween={30}
                effect={'fade'}
                fadeEffect={{ crossFade: true }}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                onBeforeInit={(swiper) => {
                    // gán custom button vào swiper
                    swiper.params.navigation.prevEl = prevRef.current;
                    swiper.params.navigation.nextEl = nextRef.current;
                }}
                navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                }}
                pagination={{
                    clickable: true,
                    renderBullet: (index, className) => {
                        return `
              <span class="${className} custom-dot"></span>
            `;
                    },
                }}
                modules={[Autoplay, EffectFade, Navigation, Pagination]}
            >
                {listSlide.length > 0 && listSlide.map(listItem => (
                    <SwiperSlide key={listItem.name}>
                        <Link href={`#${listItem.name}`} >
                            <Image src={listItem.url} alt={listItem.name} width={500} height={500} className='w-full' />
                        </Link>
                    </SwiperSlide>
                )
                )}
                {/* Custom Buttons */}
                <button
                    ref={prevRef}
                    className="absolute z-10 flex items-center justify-center text-black -translate-y-1/2 bg-white rounded-full w-7 h-7 left-2 top-1/2"
                >
                    <ChevronLeft strokeWidth={3} />
                </button>

                <button
                    ref={nextRef}
                    className="absolute z-10 flex items-center justify-center text-black -translate-y-1/2 bg-white rounded-full w-7 h-7 right-2 top-1/2"
                >
                    <ChevronRight strokeWidth={3} />
                </button>
            </Swiper>
        </div>
    )
}
