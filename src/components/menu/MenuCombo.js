import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import PlusIcon from '../icons/PlusIcon'
import ButtonAdd from '../buttons/ButtonAdd'

export default function MenuCombo(...item) {
    const { image, name, price} = item;
    return (
        <Link href={"#"} className={`flex flex-row h-[132px] md:h-full border rounded-2xl cursor-pointer overflow-hidden group transition duration-300 md:hover:shadow-[0_3px_8px_rgba(0,0,0,0.1)] md:flex-col }`}>
            <div className='relative h-full md:h-[285px] w-[130px] md:w-full overflow-hidden bg-red-500 shrink-0'>
                <Image src={image} alt={name} fill className='transition-transform duration-500 group-hover:scale-105' />
            </div>
            <div className='flex flex-col justify-center gap-2 p-2 md:p-4'>
                <h4 className='text-sm capitalize text-[#374151]  md:text-[28px] font-semibold md:leading-[40px]'>{name}</h4>
                <div className='relative flex flex-col-reverse gap-2 md:flex-col'>
                    <div className='text-sm md:text-lg text-secondary'><span className='block mb-1 text-xs md:mb-0 md:inline'>Chỉ từ</span> <span className='font-semibold text-[#374151] '>{price}</span> <span className='font-semibold underline text-[#374151] '>đ</span></div>
                    <p className='text-sm line-clamp-1 md:text-lg text-secondary'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita libero ipsa assumenda accusamus nemo vel, quas cumque minima tempora aspernatur excepturi rem facere repellat porro? Consectetur temporibus voluptate dolores aliquam?</p>
                    <ButtonAdd className={"md:hidden block absolute bottom-0 right-0"} />
                </div>
            </div>
        </Link>
    )
}
