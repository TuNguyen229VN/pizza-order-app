import Link from "next/link";

const Header = () => {
  return (
    <header className="flex items-center justify-between">
      <Link className="text-2xl font-semibold text-primary" href="">
        ST PIZZA
      </Link>
      <nav className="flex items-center gap-8 font-semibold text-gray-500">
        <Link href={""}>Home</Link>
        <Link href={""}>Menu</Link>
        <Link href={""}>About</Link>
        <Link href={""}>Contact</Link>
        <Link
          href={""}
          className="px-8 py-2 text-white rounded-full bg-primary"
        >
          Login
        </Link>
      </nav>
    </header>
  );
};

export default Header;
