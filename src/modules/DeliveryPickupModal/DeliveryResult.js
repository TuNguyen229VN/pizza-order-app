export default function DeliveryResult({ deliveryInfo, pickedAddr }) {
    return (
        <div className={`pp-result ${deliveryInfo.canDeliver ? "ok" : "no"}`}>
            <div className="pp-result-addr">
                <span>📦</span>
                <div>
                    <div className="pp-result-label">Giao đến</div>
                    <div className="pp-result-val">{pickedAddr.label}</div>
                </div>
            </div>
            <div className="pp-result-row">
                <span>Chi nhánh giao</span>
                <span className="pp-result-strong">{deliveryInfo.branch.name}</span>
            </div>
            <div className="pp-result-row">
                <span>Khoảng cách</span>
                <span className="pp-result-strong">{deliveryInfo.distanceKm} km</span>
            </div>
            <div className="pp-result-row pp-result-fee-row">
                <span>Phí ship</span>
                {deliveryInfo.canDeliver
                    ? <span className="pp-fee-badge">{deliveryInfo.feeText}</span>
                    : <span className="pp-no-badge">Ngoài vùng giao</span>}
            </div>
            {!deliveryInfo.canDeliver && (
                <div className="pp-out-of-range">
                    ⚠️ Địa chỉ này cách chi nhánh gần nhất {deliveryInfo.distanceKm} km,
                    vượt quá phạm vi giao hàng (tối đa 15 km).
                </div>
            )}
        </div>
    );
}