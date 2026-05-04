"use client";
import { CART_ROUTE, HOME_ROUTE, LOGIN_ROUTE, MENU_ROUTE, PROFILE_ROUTE, REGISTER_ROUTE } from "@/constant/routesApp";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useContext, useState } from "react";
import { CartContext } from "../AppContext";
import ShoppingCart from "../icons/ShoppingCart";
import Bars2 from "../icons/Bars";
import Image from "next/image";

function AuthLinks({ status = "unauthenticated", userName }) {
  if (status === "authenticated") {
    return (
      <>
        <Link href={PROFILE_ROUTE} className="whitespace-nowrap" title={userName}>
          Hello, {userName.split(" ")[0]}
        </Link>
        <button
          onClick={() => signOut()}
          className="px-8 py-2 text-white rounded-full bg-primary"
        >
          Logout
        </button>
      </>
    );
  }
  if (status === "unauthenticated") {
    return (
      <>
        <Link href={LOGIN_ROUTE}>Login</Link>
        <Link
          href={REGISTER_ROUTE}
          className="px-8 py-2 text-white rounded-full bg-primary"
        >
          Register
        </Link>
      </>
    );
  }
}

const Header = () => {
  const session = useSession();
  const status = session.status;
  const userData = session.data?.user;
  let userName = userData?.name || userData?.email;
  const { cartProducts } = useContext(CartContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <header>
      <div className="flex items-center justify-between md:hidden">
        <Link className="text-2xl font-semibold text-primary" href={'/'}>
          <Image src={"/logo.png"} width={100} height={200} alt="logo"/>
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
      )}

      {/* Desktop Header */}
      <div className="items-center justify-between hidden md:flex">
        <nav className="flex items-center gap-8 font-semibold text-gray-500">
          <Link className="text-2xl font-semibold text-primary" href={HOME_ROUTE}>
           <Image src={"/logo.png"} width={200} height={200} alt="logo"/>
          </Link>
          <Link href={HOME_ROUTE}>Home</Link>
          <Link href={MENU_ROUTE}>Menu</Link>
          <Link href={""}>About</Link>
          <Link href={""}>Contact</Link>
        </nav>

        <nav className="flex items-center gap-4 font-semibold text-gray-500">
          <AuthLinks status={status} userName={userName} />

          <Link href={CART_ROUTE} className="relative">
            <ShoppingCart />
            <span className="absolute px-1 py-1 text-xs leading-3 text-white rounded-full -top-2 -right-4 bg-primary">
              {cartProducts.length}
            </span>
          </Link>
        </nav>
      </div>
    </header>

  );
};

export default Header;
