
import { SHIP_TIERS } from "@/constant/deliveryConstant";
import { fmtVnd } from "../../utils/utils";
import { useTranslations } from "next-intl";


export default function ShipFeeTable({
    deliveryInfo,
}) {
    const sTrans = useTranslations("System");
    return (
        <div className="pp-tier-table">
            <div className="pp-tier-title">{sTrans("Bảng phí ship")}</div>
            {SHIP_TIERS.map((t) => (
                <div
                    key={t.label}
                    className={`pp-tier-row${deliveryInfo?.tierLabel === t.label ? " active" : ""}`}
                >
                    <span className="pp-tier-range">{t.label}</span>
                    <span className="pp-tier-fee">
                        {t.fee == null
                            ? <span className="pp-no-ship">{sTrans("Không giao")}</span>
                            : fmtVnd(t.fee)}
                    </span>
                </div>
            ))}
        </div>
    );
}