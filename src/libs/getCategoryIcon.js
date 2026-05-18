import { CiDiscount1, CiPizza } from "react-icons/ci";
import { RiDrinksLine } from "react-icons/ri";
import { LuSalad } from "react-icons/lu";
import { GiChickenLeg } from "react-icons/gi";
import { AiOutlineLike } from "react-icons/ai";
export function getCategoryIcon(name = "", className = "w-4 h-4 md:w-6 md:h-6") {
    const lower = name.toLowerCase();
    if (lower.includes("pizza")) return <CiPizza className={className} />;
    if (lower.includes("drink") || lower.includes("thức uống")) return <RiDrinksLine className={className} />;
    if (lower.includes("starter") || lower.includes("khai vị")) return <LuSalad className={className} />;
    if (lower.includes("chicken lover") || lower.includes("ghiền gà")) return <GiChickenLeg className={className} />;
    if (lower.includes("recommend") || lower.includes("bạn sẽ thích")) return <AiOutlineLike className={className} />;
    return <CiDiscount1 className={className} />;
}