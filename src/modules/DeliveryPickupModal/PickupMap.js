import { BRANCHES } from '@/constant/deliveryConstant';
import React, { useEffect, useRef } from 'react'
//  ── Leaflet map (pickup mode) ────────────────────────────────
export default function PickupMap({ selected, onSelect }) {
    const divRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (!divRef.current) return;
        if (divRef.current._leaflet_id) {
            if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
            else { divRef.current._leaflet_id = null; }
        }
        let cancelled = false;
        import("leaflet").then((mod) => {
            if (cancelled || !divRef.current) return;
            const L = mod.default;
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });
            const map = L.map(divRef.current, { center: [10.7769, 106.7009], zoom: 12 });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors", maxZoom: 19,
            }).addTo(map);
            const mkIcon = () => L.divIcon({
                html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#E63946;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center">
                         <img src="/logo-small.png" alt="" style="width:30px;height:30px;border-radius:999px;background:white;transform:rotate(45deg);" />
                       </div>`,
                className: "", iconSize: [34, 34], iconAnchor: [10, 34], popupAnchor: [8, -34],
            });
            BRANCHES.forEach((b) => {
                const m = L.marker([b.lat, b.lng], { icon: mkIcon() }).addTo(map);
                m.bindPopup(`<div style="font-family:inherit;min-width:175px;padding:4px 2px">
                    <b style="color:#E63946;font-size:13px">${b.name}</b><br/>
                    <span style="font-size:12px;color:#444">${b.address}</span><br/>
                    <span style="font-size:12px;color:#777">⏰ ${b.hours} · 📞 ${b.phone}</span>
                  </div>`);
                m.on("click", () => onSelect(b));
            });
            mapRef.current = map;
        });
        return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, []); // eslint-disable-line

    useEffect(() => {
        if (mapRef.current && selected)
            mapRef.current.flyTo([selected.lat, selected.lng], 15, { duration: 0.7 });
    }, [selected]);

    return <div ref={divRef} style={{ width: "100%", height: "100%" }} />;
}
