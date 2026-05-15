// ── Bảng phí ship ────────────────────────────────────────────
export const SHIP_TIERS = [
    { maxKm: 3, fee: 15000, label: "0 – 3 km" },
    { maxKm: 7, fee: 25000, label: "3 – 7 km" },
    { maxKm: 15, fee: 40000, label: "7 – 15 km" },
    { maxKm: null, fee: null, label: "> 15 km" },
];

// ── Chi nhánh ────────────────────────────────────────────────
export const BRANCHES = [
    { id: 1, name: "Pizza Teo – Quận 1", address: "123 Nguyễn Huệ, P. Bến Nghé, Q.1", lat: 10.7743, lng: 106.7036, phone: "028 1234 5601", hours: "10:00–22:00" },
    { id: 2, name: "Pizza Teo – Quận 3", address: "45 Võ Văn Tần, P.6, Q.3", lat: 10.7742, lng: 106.6888, phone: "028 1234 5602", hours: "10:00–22:00" },
    { id: 3, name: "Pizza Teo – Bình Thạnh", address: "200 Phan Văn Trị, P.11, Q. Bình Thạnh", lat: 10.8073, lng: 106.7143, phone: "028 1234 5603", hours: "10:00–22:30" },
    { id: 4, name: "Pizza Teo – Thủ Đức", address: "88 Võ Văn Ngân, P. Bình Thọ, TP. Thủ Đức", lat: 10.8502, lng: 106.7717, phone: "028 1234 5604", hours: "10:00–22:00" },
    { id: 5, name: "Pizza Teo – Tân Bình", address: "312 Hoàng Văn Thụ, P.4, Q. Tân Bình", lat: 10.7994, lng: 106.6644, phone: "028 1234 5605", hours: "09:30–22:30" },
];
