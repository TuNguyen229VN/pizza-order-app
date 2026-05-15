import { BRANCHES, SHIP_TIERS } from "@/constant/deliveryConstant";


export function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcShipFee(km) {
    for (const tier of SHIP_TIERS) {
        if (tier.maxKm === null || km <= tier.maxKm)
            return { fee: tier.fee, label: tier.label };
    }
    return { fee: null, label: "> 15 km" };
}

export function fmtVnd(n) {
    return n == null ? null : n.toLocaleString("vi-VN") + "đ";
}

export function calcDeliveryInfo(addrLat, addrLng) {
    let nearest = null, minKm = Infinity;
    for (const b of BRANCHES) {
        const km = haversineKm(addrLat, addrLng, b.lat, b.lng);
        if (km < minKm) { minKm = km; nearest = b; }
    }
    const { fee, label } = calcShipFee(minKm);
    return {
        branch: nearest,
        distanceKm: Math.round(minKm * 10) / 10,
        fee, feeText: fmtVnd(fee), tierLabel: label,
        canDeliver: fee !== null,
    };
}
export function buildLabel(a = {}) {
    return [
        a.house_number,
        a.road || a.pedestrian || a.footway,
        a.suburb || a.neighbourhood || a.quarter,
        a.city_district || a.district,
        "TP. Hồ Chí Minh",
    ].filter(Boolean).join(", ");
}

export function hasHouseNumber(label = "") {
    return /^\d+[\w\/\-]*[\s,]/.test(label.trim());
}