import { CiDiscount1, CiPizza } from "react-icons/ci";
import { RiDrinksLine } from "react-icons/ri";
import { LuSalad } from "react-icons/lu";
export function getCategoryIcon(name = "",className="w-6 h-6") {
    const lower = name.toLowerCase();
    if (lower.includes("pizza")) return <CiPizza   className={className}/>;
    if (lower.includes("drink") || lower.includes("thức uống")) return <RiDrinksLine  className={className}/>;
    if (lower.includes("appetizer") || lower.includes("khai vị")) return <LuSalad   className={className}/>;
    return <CiDiscount1 className={className}/>;
}