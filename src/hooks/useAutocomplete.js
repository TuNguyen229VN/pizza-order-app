"use client";

import { buildLabel } from "@/utils/utils";
import { useEffect, useRef, useState } from "react";


export default function useAutocomplete(query) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const timer = useRef(null);

    useEffect(() => {
        if (!query || query.length < 3) { setItems([]); return; }
        clearTimeout(timer.current);
        timer.current = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    q: query + " Hồ Chí Minh",
                    format: "json",
                    addressdetails: "1",
                    limit: "6",
                    countrycodes: "vn",
                    viewbox: "106.364,10.349,107.031,11.160",
                    bounded: "1",
                    "accept-language": "vi",
                });
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?${params}`,
                    { headers: { "User-Agent": "PizzaPalaceApp/1.0" } }
                );
                const data = await res.json();
                setItems(data.map((r) => ({
                    id: r.place_id,
                    label: buildLabel(r.address || {}),
                    lat: +r.lat,
                    lng: +r.lon,
                })));
            } catch { setItems([]); }
            finally { setLoading(false); }
        }, 420);
        return () => clearTimeout(timer.current);
    }, [query]);

    return { items, loading };
}