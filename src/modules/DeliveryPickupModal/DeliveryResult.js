import { useTranslations } from "next-intl";

export default function DeliveryResult({ deliveryInfo, pickedAddr }) {
    const sTrans = useTranslations("System");
    return (
        <div className={`pp-result ${deliveryInfo.canDeliver ? "ok" : "no"}`}>
            <div className="pp-result-addr">
                <span>📦</span>
                <div>
                    <div className="pp-result-label">{sTrans("Giao đến")}</div>
                    <div className="pp-result-val">{pickedAddr.label}</div>
                </div>
            </div>
            <div className="pp-result-row">
                <span>{sTrans("Chi nhánh giao")}</span>
                <span className="pp-result-strong">{deliveryInfo.branch.name}</span>
            </div>
            <div className="pp-result-row">
                <span>{sTrans("Khoảng cách")}</span>
                <span className="pp-result-strong">{deliveryInfo.distanceKm} km</span>
            </div>
            <div className="pp-result-row pp-result-fee-row">
                <span>{sTrans("Phí ship")}</span>
                {deliveryInfo.canDeliver
                    ? <span className="pp-fee-badge">{deliveryInfo.feeText}</span>
                    : <span className="pp-no-badge">{sTrans("Ngoài vùng giao")}</span>}
            </div>
            {!deliveryInfo.canDeliver && (
                <div className="pp-out-of-range">
                    ⚠️ {sTrans("Địa chỉ này cách chi nhánh gần nhất")} {deliveryInfo.distanceKm} km,
                    {sTrans("OUT_DISTANCE_DELI")}.
                </div>
            )}
        </div>
    );
}