"use client";
import { HOME_ROUTE, LOGIN_ROUTE, PROFILE_ROUTE, REGISTER_ROUTE } from "@/constant/routesApp";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

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
  return (
    <header className="flex items-center justify-between">
      <nav className="flex items-center gap-8 font-semibold text-gray-500">
        <Link className="text-2xl font-semibold text-primary" href={HOME_ROUTE}>
          ST PIZZA
        </Link>
        <Link href={HOME_ROUTE}>Home</Link>
        <Link href={""}>Menu</Link>
        <Link href={""}>About</Link>
        <Link href={""}>Contact</Link>
      </nav>
      <nav className="flex items-center gap-4 font-semibold text-gray-500">
        <AuthLinks status={status} userName={userName} />
      </nav>
    </header>
  );
};

export default Header;
