"use client";
import { CART_ROUTE, HOME_ROUTE, LOGIN_ROUTE, MENU_ROUTE, ORDER_TRACKING_ROUTE, PROFILE_ROUTE, REGISTER_ROUTE, REWARDS_ROUTE } from "@/constant/routesApp";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../AppContext";
import ShoppingCart from "../icons/ShoppingCart";
import Bars2 from "../icons/Bars";
import Image from "next/image";
import Bell from "../icons/Bell";
import UserIcon from "../icons/UserIcon";
import { totalQuantity } from "@/libs/totalQuantity";
import ConfirmPopup from "../popup/ConfirmPopup";
import DeliveryPickupModal from "@/modules/DeliveryPickupModal";
import { useDelivery } from "@/context/DeliveryContext";
import CloseIcon from "../icons/CloseIcon";
import MenuMobile from "./MenuMobile";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { NotificationBell } from "../notification/NotificationBell";
import LocaleSelectorClient from "../LocaleSelectorClient";

const Header = ({ className }) => {
  const session = useSession();
  const status = session.status;
  const userData = session.data?.user;
  const [open, setOpen] = useState(false);
  const { cartProducts } = useContext(CartContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { deliveryInfo, openDeliveryModal } = useDelivery();
  useLockBodyScroll(mobileNavOpen);
  return (
    <header className={`sticky top-0 z-30 max-w-6xl p-3 mx-auto bg-white md:p-4 ${className}`}>
      <div className="">
        <h1 className="sr-only">Pizza Teo ngon nhất TP.HCM</h1>
        <div className="grid items-center grid-cols-3">
          <div onClick={() => openDeliveryModal()} className="text-sm cursor-pointer md:text-base">
            {deliveryInfo ? <> <p className="text-secondary">{deliveryInfo?.mode === "delivery" ? "Giao hàng tới" : "Mua mang về"}</p>
              <p className="font-medium truncate lg:w-[400px]">{deliveryInfo?.address || deliveryInfo?.store.name}</p></>
              : <p className="">Bạn đang ở đâu? </p>
            }
          </div>

          <div className="flex justify-center">
            <Link href={HOME_ROUTE}>
              <Image src={"/logo-small.png"} width={50} height={50} alt="logo" className="block object-cover object-center md:hidden" />
              <Image src={"/logo.png"} width={180} height={180} alt="logo" className="hidden md:block" />
            </Link>
          </div>
          <div className="flex items-center justify-end flex-1 min-w-0 gap-3 md:gap-5">
            <NotificationBell />
            <LocaleSelectorClient/>
            <Link
              href={CART_ROUTE}
              className={`md:w-[80px] h-[40px] md:h-[50px] flex justify-center items-center px-3 p-2 md:p-3 border rounded-[50px] transition-colors duration-200 ${cartProducts.length > 0 ? "bg-primary text-white" : "bg-white text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2 transition-transform hover:scale-105">
                <span className="md:min-w-[1.2rem] text-center tabular-nums text-sm md:text-base">
                  {totalQuantity(cartProducts)}
                </span>
                <ShoppingCart className="w-4 h-4 md:w-6 md:h-6" />
              </div>
            </Link>

            {/* mobile menu */}
            <div className={`flex md:hidden group relative justify-center border items-center px-4 p-2 md:p-3 h-[40px]  rounded-[50px] cursor-pointer ${status === "authenticated" ? "border-primary " : ""}`} onClick={() => setMobileNavOpen((prev) => !prev)}>
              {!mobileNavOpen ? <Bars2 className={`${status === "authenticated" && "text-primary"} w-4 h-4 md:w-6 md:h-6`} /> : <CloseIcon className={`${status === "authenticated" && "text-primary"} w-4 h-4 md:w-6 md:h-6`} />}

            </div>
            {mobileNavOpen && <MenuMobile onClose={() => setMobileNavOpen(false)} isAdmin={userData?.admin} status={status} />}
            {/* ============== */}
            <div className={`hidden md:flex group relative justify-center border items-center gap-2 px-3 p-2 md:p-3 h-[50px]  rounded-[50px] cursor-pointer ${status === "authenticated" ? "border-primary " : ""}`}>
              <Bars2 className={`${status === "authenticated" && "text-primary"} w-4 h-4 md:w-6 md:h-6`} />
              <UserIcon className={`${status === "authenticated" && "text-primary"} w-6 h-6`} />
              <div className="hidden md:block absolute bg-white w-[210px] rounded-3xl top-[80%]  right-0 shadow-lg py-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto duration-250 delay-200">
                {status === "unauthenticated" && (<>
                  <Link href={LOGIN_ROUTE} className="block py-3 pl-4 hover:font-medium hover:text-primary">Đăng nhập</Link>
                  <Link href={REGISTER_ROUTE} className="block py-3 pl-4 hover:font-medium hover:text-primary">Đăng ký</Link>
                  <div className="w-full h-[1px] bg-gray-200"></div>
                </>)}
                <Link href={ORDER_TRACKING_ROUTE} className="inline-block py-3 pl-4 hover:font-medium hover:text-primary">
                  Theo dõi đơn hàng
                </Link>
                {status === "authenticated" && (
                  <>
                    <div className="w-full h-[1px] bg-gray-200"></div>
                    <Link href={PROFILE_ROUTE} className="block py-3 pl-4 hover:font-medium hover:text-primary">Hồ sơ của tôi</Link>
                  </>
                )}
                <Link href={REWARDS_ROUTE} className="inline-block py-3 pl-4 hover:font-medium hover:text-primary">Teo Rewards</Link>
                <ConfirmPopup labelConfirm="Gọi ngay" label="Hỗ trợ khách hàng" labelDesc="gọi đến 1900 1822" onDelete={() => window.location.href = 'tel:0123456789'}>
                  <p className="py-3 pl-4 hover:font-medium hover:text-primary">Hỗ trợ khách hàng</p>
                </ConfirmPopup>
                {status === "authenticated" && (<>
                  <div className="w-full h-[1px] bg-gray-200"></div>
                  <ConfirmPopup label="Đăng xuất" labelConfirm="Đăng xuất" onDelete={() => signOut()}>
                    <p className="py-3 pl-4 hover:font-medium hover:text-primary">Đăng xuất</p>
                  </ConfirmPopup>
                </>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
