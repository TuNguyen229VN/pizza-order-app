"use client";
import { CART_ROUTE, HOME_ROUTE, LOGIN_ROUTE, MENU_ROUTE, PROFILE_ROUTE, REGISTER_ROUTE } from "@/constant/routesApp";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useState } from "react";
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



const Header = () => {
  const session = useSession();
  const status = session.status;
  const userData = session.data?.user;
  let userName = userData?.name || userData?.email;
  const [open, setOpen] = useState(false);
  const { cartProducts } = useContext(CartContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { deliveryInfo } = useDelivery();
  return (
    <header className="sticky top-0 z-30 max-w-6xl p-4 mx-auto bg-white ">
      <div className="">
        <h1 className="sr-only">Pizza Teo ngon nhất TP.HCM</h1>
        <div className="grid items-center grid-cols-3">

          <DeliveryPickupModal
            isOpen={open}
            onClose={() => setOpen(false)}
          />
          <div onClick={() => setOpen(true)} className="cursor-pointer">
            {deliveryInfo ? <> <p className="text-secondary">{deliveryInfo?.mode === "delivery" ? "Mua mang về" : "Giao hàng tới"}</p>
              <p className="font-medium truncate w-[400px]">{deliveryInfo?.address || deliveryInfo?.store.address}</p></>
              : <p className="">Bạn đang ở đâu? </p>
            }
          </div>

          <div className="flex justify-center">
            <Link href={HOME_ROUTE}>
              <Image src={"/logo.png"} width={180} height={180} alt="logo" />
            </Link>
          </div>
          <div className="flex items-center justify-end flex-1 min-w-0 gap-5">
            <Bell />
            <p className="text-base font-semibold text-primary">VI</p>
            <Link
              href={CART_ROUTE}
              className={`w-[80px] flex justify-center items-center p-3 border rounded-[50px] transition-colors duration-200 ${cartProducts.length > 0 ? "bg-primary text-white" : "bg-white text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2 transition-transform hover:scale-105">
                <span className="min-w-[1.2rem] text-center tabular-nums">
                  {totalQuantity(cartProducts)}
                </span>
                <ShoppingCart />
              </div>
            </Link>
            <div className={`group relative flex justify-center border items-center gap-2 p-3  rounded-[50px] cursor-pointer ${status === "authenticated" ? "border-primary " : ""}`}>
              <Bars2 className={`${status === "authenticated" && "text-primary"} w-6 h-6`} />
              <UserIcon className={`${status === "authenticated" && "text-primary"} w-6 h-6`} />
              <div className="absolute bg-white w-[210px] rounded-3xl top-[80%]  right-0 shadow-lg py-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto duration-250 delay-200">
                {status === "unauthenticated" && (<>
                  <Link href={LOGIN_ROUTE} className="block py-3 pl-4 hover:font-medium hover:text-primary">Đăng nhập</Link>
                  <Link href={REGISTER_ROUTE} className="block py-3 pl-4 hover:font-medium hover:text-primary">Đăng ký</Link>
                  <div className="w-full h-[1px] bg-gray-200"></div>
                </>)}
                <p className="py-3 pl-4 hover:font-medium hover:text-primary">Theo dõi đơn hàng</p>
                {status === "authenticated" && (
                  <>
                    <div className="w-full h-[1px] bg-gray-200"></div>
                    <Link href={PROFILE_ROUTE} className="block py-3 pl-4 hover:font-medium hover:text-primary">Hồ sơ của tôi</Link>
                  </>
                )}
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

      {/* 
      <div className="flex items-center justify-between md:hidden">
        <Link className="text-2xl font-semibold text-primary" href={'/'}>
          <Image src={"/logo.png"} width={100} height={200} alt="logo" />
        </Link>
        <div className="flex items-center gap-8">
          <Link href={'/cart'} className="relative">
            <ShoppingCart />
            {cartProducts?.length > 0 && (
              <span className="absolute px-1 py-1 text-xs leading-3 text-white rounded-full -top-2 -right-4 bg-primary">
                {cartProducts.length}
              </span>
            )}
          </Link>
          <button
            className="p-1 border"
            onClick={() => setMobileNavOpen(prev => !prev)}>
            <Bars2 />
          </button>
        </div>
      </div>
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="flex flex-col gap-2 p-4 mt-2 text-center bg-gray-200 rounded-lg md:hidden">
          <Link href={'/'}>Home</Link>
          <Link href={'/menu'}>Menu</Link>
          <Link href={'/#about'}>About</Link>
          <Link href={'/#contact'}>Contact</Link>
          <AuthLinks status={status} userName={userName} />
        </div>
      )} */}
    </header >

  );
};

export default Header;
