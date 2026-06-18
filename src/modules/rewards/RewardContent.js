import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import { POINT_TIERS } from '@/constant/constant'
import { REGISTER_ROUTE } from '@/constant/routesApp';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useState } from 'react'
import { FaUserCheck } from "react-icons/fa";
import { FaMedal } from "react-icons/fa";
import { FaAward } from "react-icons/fa";
import { FaCrown } from "react-icons/fa";

export default function RewardContent({ status }) {
  const [selected, setSelected] = useState(1);
  const rTrans = useTranslations("Rewards");
  const REWARDS_LIST = [
    {
      title: "Vàng",
      icon: FaCrown,
      discountPercent: 20,
      content: [
        "Giảm giá trực tiếp 20% trên mọi đơn hàng đủ điều kiện",
        "Tích lũy điểm thưởng sau mỗi lần thanh toán",
        "Hưởng mức ưu đãi cao nhất của chương trình Teo Rewards",
      ],
      levelup: [
        "Đạt từ 1000 điểm tích lũy để nâng hạng Vàng"
      ],
    },
    {
      title: "Bạc",
      icon: FaAward,
      discountPercent: 10,
      content: [
        "Giảm giá trực tiếp 10% trên mọi đơn hàng đủ điều kiện",
        "Tích lũy điểm thưởng sau mỗi lần thanh toán",
        "Tiếp tục tích điểm để nâng lên hạng Vàng",
      ],
      levelup: [
        "Đạt từ 500 điểm tích lũy để nâng hạng Bạc",
      ],
    },
    {
      title: "Đồng",
      icon: FaMedal,
      discountPercent: 5,
      content: [
        "Giảm giá trực tiếp 5% trên mọi đơn hàng đủ điều kiện",
        "Tích lũy điểm thưởng sau mỗi lần thanh toán",
        "Mở khóa nhiều ưu đãi hơn khi nâng hạng",
      ],
      levelup: [
        "Đạt từ 200 điểm tích lũy để nâng hạng Đồng",
      ],
    },
    {
      title: "Thân thiết",
      icon: FaUserCheck,
      discountPercent: 2,
      content: [
        "Giảm giá trực tiếp 2% trên mọi đơn hàng đủ điều kiện",
        "Bắt đầu tích lũy điểm thưởng với mỗi giao dịch",
        "Càng tích nhiều điểm, mức giảm giá càng cao",
      ],
      levelup: [
        "Đạt từ 50 điểm tích lũy để nâng hạng Thân thiết",
      ],
    },
  ];
  return (
    <div className='w-full bg-white md:border md:rounded-2xl md:w-2/3'>
      <div className='flex items-center justify-between bg-gray-100 md:rounded-t-2xl '>
        {REWARDS_LIST.reverse().map((item, index) => {
          const Icon = item.icon;
          return (
            <div className={`flex-1 flex items-center justify-center p-4 md:p-6 gap-2 cursor-pointer relative`} key={index} onClick={() => setSelected(index)}>
              <Icon className='w-7 h-7' />
              <p>{rTrans(item.title)}</p>
              <span className={`absolute bottom-0 left-0 h-1 md:h-[6px] w-full rounded-full bg-primary transition-all duration-300 ${selected === index
                ? "opacity-100 scale-x-100"
                : "opacity-0 scale-x-0"
                }`}></span>
            </div>
          )
        }
        )}
      </div>

      <div className="flex flex-col items-center justify-center my-4 md:my-6">
        <div className="relative w-[100px] h-[100px] flex items-center justify-center ">

          <svg className="absolute inset-0 w-full h-full fill-[#E71E23]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path fill="#C8102E" d="M96 48c0-2.887-1.094-5.52-2.89-7.51a9.54 9.54 0 0 1-2.292-8.549c.562-2.62.193-5.448-1.25-7.948a11.17 11.17 0 0 0-6.258-5.057 9.54 9.54 0 0 1-6.26-6.26 11.16 11.16 0 0 0-5.057-6.257 11.17 11.17 0 0 0-7.948-1.252 9.53 9.53 0 0 1-8.551-2.29c-4.01-3.818-11.006-3.815-15.017-.002a9.53 9.53 0 0 1-8.55 2.294 11.16 11.16 0 0 0-7.948 1.25 11.17 11.17 0 0 0-5.058 6.257 9.54 9.54 0 0 1-6.259 6.26 11.17 11.17 0 0 0-6.257 5.057 11.17 11.17 0 0 0-1.252 7.948 9.54 9.54 0 0 1-2.29 8.551C-.956 44.503-.953 51.498 2.862 55.51a9.53 9.53 0 0 1 2.292 8.55 11.16 11.16 0 0 0 1.25 7.947 11.17 11.17 0 0 0 6.258 5.057 9.54 9.54 0 0 1 6.26 6.26 11.16 11.16 0 0 0 5.057 6.258 11.17 11.17 0 0 0 7.948 1.251 9.53 9.53 0 0 1 8.551 2.29c4.01 3.818 11.007 3.816 15.017 0a9.54 9.54 0 0 1 8.55-2.291c2.62.562 5.448.194 7.948-1.25a11.17 11.17 0 0 0 5.058-6.258 9.54 9.54 0 0 1 6.259-6.261 11.16 11.16 0 0 0 6.257-5.056 11.17 11.17 0 0 0 1.252-7.948 9.54 9.54 0 0 1 2.29-8.551A11.16 11.16 0 0 0 96 48"></path>
          </svg>

          <span className="relative text-3xl font-bold text-white">{REWARDS_LIST[selected].discountPercent}%</span>
        </div>

        <p className="text-lg font-medium text-black">{rTrans("Giảm giá")} {REWARDS_LIST[selected].discountPercent}%</p>
      </div>
      <div className='p-4 mx-4 mb-4 overflow-hidden bg-gray-100 rounded-lg md:mb-6 md:mx-6 h-fit bg-background md:p-6'>
        <div>
          <p>{rTrans("Quyền lợi")}:</p>
          {REWARDS_LIST[selected].content.map((item, i) =>
            (<li className='mt-4 ml-8' key={i}>{rTrans(item)}</li>)
          )}
        </div>
        <div>
          <p className='mt-4'>{rTrans("Quy định bảng xếp hạng")}:</p>
          {REWARDS_LIST[selected].levelup.map((item, i) =>
            (<li className='mt-4 ml-8' key={i}>{rTrans(item)}</li>)
          )}
        </div>
      </div>
      {status === "unauthenticated" && <div className='flex flex-col items-center justify-center gap-2 mb-4 md:mb-6'>
        <p className='text-center text-secondary'>{rTrans("Không phải là thành viên")}?</p>
        <Link href={REGISTER_ROUTE}>
          <ButtonPrimary className={"w-max p-4 "}>{rTrans("Tham gia ngay")}</ButtonPrimary>
        </Link>
      </div>}
    </div>
  )
}
