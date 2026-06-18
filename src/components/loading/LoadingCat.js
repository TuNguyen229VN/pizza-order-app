"use client"
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "motion/react";
import { LuBike } from 'react-icons/lu'
import { PiPizza } from 'react-icons/pi'
import { CiHeart } from "react-icons/ci";
import { useTranslations } from 'next-intl';

export default function LoadingCat() {
    const [progress, setProgress] = useState(0);
    const sTrans = useTranslations("System");
    // Simulate loading progress
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Auto-reset for demo purposes
                    setTimeout(() => setProgress(0), 2000);
                    return 100;
                }
                return prev + 1;
            });
        }, 40);
        return () => clearInterval(interval);
    }, [progress === 0]);
    return (
        <>
            {/* Decorative background elements */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
                <div className="absolute top-10 left-10"><PiPizza size={40} /></div>
                <div className="absolute top-1/4 right-20"><PiPizza size={32} /></div>
                <div className="absolute bottom-20 left-1/3"><PiPizza size={48} /></div>
                <div className="absolute top-1/2 right-1/4"><PiPizza size={24} /></div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key="loading-container"
                    className="relative z-10 flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    {/* Mascot Container */}
                    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
                        {/* Soft Glow/Shadow under the scooter */}
                        <motion.div
                            className="absolute bottom-8 w-40 h-6 bg-gray-200 rounded-[100%] blur-md"
                            animate={{
                                scaleX: [1, 1.1, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* The Cat Mascot */}
                        <motion.img
                            src="/images/neko_scooter_delivery_1779214532169.png"
                            alt="Kawaii Pizza Cat"
                            className="z-10 object-contain w-full h-full"
                            animate={{
                                y: [-4, 4, -4],
                                rotate: [-1, 1, -1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        {/* Floating Particles (Pizza Slice icons) */}
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute pointer-events-none text-primary"
                                initial={{
                                    x: 0,
                                    y: 0,
                                    opacity: 0,
                                    scale: 0
                                }}
                                animate={{
                                    x: [0, (i % 2 === 0 ? 1 : -1) * (40 + i * 15)],
                                    y: [0, -60 - i * 20],
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0.5],
                                    rotate: [0, 180]
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeOut"
                                }}
                            >
                                <PiPizza size={16 + i * 2} />
                            </motion.div>
                        ))}

                        {/* Speed Lines for Delivery Motion */}
                        <div className="absolute left-[-40px] top-1/2 flex flex-col gap-3">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={`line-${i}`}
                                    className="h-1 rounded-full bg-primary/20"
                                    initial={{ width: 0 }}
                                    animate={{ width: [0, 30, 0], x: [0, -20, -40] }}
                                    transition={{
                                        duration: 0.8,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "linear"
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="mt-8 space-y-3 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-display md:text-4xl">
                            {sTrans("Đang")} <span className="text-brand-red">{sTrans("tải")}...</span>
                        </h1>
                        <p className="flex items-center justify-center gap-2 font-medium text-gray-500">
                            {sTrans("Mèo siêu cấp đang tới")}! <CiHeart size={16} className="text-brand-red fill-brand-red" />
                        </p>
                    </div>

                    {/* Custom Progress Bar */}
                    <div className="w-64 mt-10 space-y-4 md:w-80">
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-inner p-0.5">
                            <motion.div
                                className="flex items-center justify-end h-full pr-1 rounded-full bg-brand-red"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1 }}
                            >
                                {progress > 5 && (
                                    <motion.div
                                        className="w-2 h-2 bg-white rounded-full shadow-sm"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                    />
                                )}
                            </motion.div>
                        </div>
                        <div className="flex items-center justify-between px-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
                            <span>Đang tải</span>
                            <span className="text-brand-red">{progress}%</span>
                            <span>Loading</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Footer Branding */}
            <div className="absolute left-0 right-0 flex items-center justify-center gap-2 select-none bottom-10 opacity-30">
                <LuBike size={20} className="text-gray-900" />
                <span className="font-display font-light text-sm tracking-[0.2em] uppercase">Pizza Teo</span>
            </div>
        </>
    )
}
