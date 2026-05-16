
import { SHIP_TIERS } from "@/constant/deliveryConstant";
import { fmtVnd } from "../../utils/utils";


export default function ShipFeeTable({
    deliveryInfo,
}) {
    return (
        <div className="pp-tier-table">
            <div className="pp-tier-title">Bảng phí ship</div>
            {SHIP_TIERS.map((t) => (
                <div
                    key={t.label}
                    className={`pp-tier-row${deliveryInfo?.tierLabel === t.label ? " active" : ""}`}
                >
                    <span className="pp-tier-range">{t.label}</span>
                    <span className="pp-tier-fee">
                        {t.fee == null
                            ? <span className="pp-no-ship">Không giao</span>
                            : fmtVnd(t.fee)}
                    </span>
                </div>
            ))}
        </div>
    );
}