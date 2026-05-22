"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import ButtonPrimary from "@/components/buttons/ButtonPrimary";
import SearchIcon from "@/components/icons/SearchIcon";
import Image from "next/image";
import { STYLES } from "./style";
import { MdOutlineMyLocation } from "react-icons/md";
import DeliveryResult from "./DeliveryResult";
import ShipFeeTable from "./ShipFeeTable";
import { BRANCHES } from "@/constant/deliveryConstant";
import useAutocomplete from "@/hooks/useAutocomplete";
import { calcDeliveryInfo, hasHouseNumber } from "../../utils/utils";
import Tabs from "./Tabs";
import { useDelivery } from "@/context/DeliveryContext";
import PickupMap from "./PickupMap";
import { createPortal } from "react-dom";

const HCM_BOUNDS = { minLat: 10.349, maxLat: 11.160, minLng: 106.364, maxLng: 107.031 };
const inHCM = (lat, lng) =>
    lat >= HCM_BOUNDS.minLat && lat <= HCM_BOUNDS.maxLat &&
    lng >= HCM_BOUNDS.minLng && lng <= HCM_BOUNDS.maxLng;

async function reverseGeocode(lat, lng) {
    const params = new URLSearchParams({
        lat, lon: lng, format: "json", addressdetails: "1", "accept-language": "vi",
    });
    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params}`,
        { headers: { "User-Agent": "PizzaPalaceApp/1.0" } }
    );
    const r = await res.json();
    const label = buildLabel(r.address || {});
    return { label, lat: +r.lat, lng: +r.lon, address: r.address || {} };
}

export default function DeliveryPickupModal({ onConfirm }) {

    // ── Tab ─────────────────────────────────────────────────
    const [mode, setMode] = useState("delivery");

    // ── Delivery state ───────────────────────────────────────
    const [deliveryQuery, setDeliveryQuery] = useState("");
    const [deliveryAddr, setDeliveryAddr] = useState(null);
    const [showDrop, setShowDrop] = useState(false);
    const [locLoading, setLocLoading] = useState(false);
    const [locError, setLocError] = useState("");

    // ── Pickup state ─────────────────────────────────────────
    const [pickupStore, setPickupStore] = useState(null);

    // ── Misc ─────────────────────────────────────────────────
    const [success, setSuccess] = useState(false);
    const { isDeliveryModalOpen, closeDeliveryModal, saveDelivery, deliveryInfo: savedInfo } = useDelivery();

    const inputRef = useRef(null);
    const dropRef = useRef(null);
    const { items, loading } = useAutocomplete(deliveryQuery);

    const deliveryInfo = useMemo(
        () => deliveryAddr ? calcDeliveryInfo(deliveryAddr.lat, deliveryAddr.lng) : null,
        [deliveryAddr]
    );

    const addrValid =
        deliveryAddr &&
        (deliveryAddr.address?.house_number || hasHouseNumber(deliveryAddr.label));

    // ── Load savedInfo khi modal mở, reset khi đóng ──────────
    useEffect(() => {
        if (isDeliveryModalOpen) {
            if (savedInfo) {
                setMode(savedInfo.mode);
                if (savedInfo.mode === "delivery") {
                    setDeliveryQuery(savedInfo.address);
                    setDeliveryAddr({ label: savedInfo.address, lat: savedInfo.lat, lng: savedInfo.lng });
                } else {
                    setPickupStore(savedInfo.store);
                }
            }
        } else {
            setMode("delivery");
            setDeliveryQuery("");
            setDeliveryAddr(null);
            setPickupStore(null);
            setShowDrop(false);
            setLocError("");
            setSuccess(false);
        }
    }, [isDeliveryModalOpen]);

    // ── Reset chỉ UI phụ khi đổi tab (KHÔNG reset addr/store) ─
    useEffect(() => {
        setShowDrop(false);
        setLocError("");
    }, [mode]);

    // ── Đóng dropdown khi click ngoài ────────────────────────
    useEffect(() => {
        const fn = (e) => {
            if (
                dropRef.current && !dropRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)
            ) setShowDrop(false);
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    // ── Geolocation ──────────────────────────────────────────
    const handleGetLocation = () => {
        if (!navigator.geolocation) { setLocError("Trình duyệt không hỗ trợ định vị."); return; }
        setLocLoading(true);
        setLocError("");
        setDeliveryAddr(null);
        setDeliveryQuery("");

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const { latitude: lat, longitude: lng } = coords;
                try {
                    if (!inHCM(lat, lng)) {
                        setLocError("Vị trí của bạn không nằm trong TP.HCM.");
                        return;
                    }
                    const result = await reverseGeocode(lat, lng);
                    setDeliveryAddr(result);
                    setDeliveryQuery(result.label);
                } catch {
                    setLocError("Không lấy được địa chỉ, thử nhập tay nhé.");
                } finally {
                    setLocLoading(false);
                }
            },
            (err) => {
                setLocLoading(false);
                setLocError(
                    err.code === 1
                        ? "Bạn chưa cho phép truy cập vị trí. Kiểm tra cài đặt trình duyệt."
                        : "Không lấy được vị trí, thử lại nhé."
                );
            },
            { timeout: 8000 }
        );
    };

    const handlePick = (item) => {
        setDeliveryAddr(item);
        setDeliveryQuery(item.label);
        setShowDrop(false);
        setLocError("");
    };

    // ── Confirm ──────────────────────────────────────────────
    const canConfirm =
        (mode === "delivery" && addrValid && deliveryInfo?.canDeliver) ||
        (mode === "pickup" && pickupStore);

    const handleConfirm = () => {
        if (!canConfirm) return;
        const data = mode === "delivery"
            ? {
                mode,
                address: deliveryAddr.label,
                lat: deliveryAddr.lat,
                lng: deliveryAddr.lng,
                nearestBranch: {
                    id: deliveryInfo.branch.id,
                    name: deliveryInfo.branch.name,
                    address: deliveryInfo.branch.address,
                    distanceKm: deliveryInfo.distanceKm,
                },
                shipFee: deliveryInfo.fee,
                shipFeeText: deliveryInfo.feeText,
                savedAt: new Date().toISOString(),
            }
            : { mode, store: pickupStore, savedAt: new Date().toISOString() };

        try { saveDelivery(data); } catch { }
        setSuccess(true);
        setTimeout(() => { setSuccess(false); onConfirm?.(data); closeDeliveryModal(); }, 500);
    };

    const handleClose = () => closeDeliveryModal();

    const confirmLabel = () => {
        if (success) return "✓ Đã lưu thành công!";
        if (mode === "pickup") return pickupStore ? `Chọn ${pickupStore.name}` : "Chọn cửa hàng này";
        if (!deliveryAddr) return "Xác nhận giao hàng";
        if (!addrValid) return "Vui lòng nhập số nhà";
        if (!deliveryInfo?.canDeliver) return "Ngoài vùng giao hàng";
        return `Xác nhận – Phí ship ${deliveryInfo.feeText}`;
    };

    if (!isDeliveryModalOpen) return null;

    return createPortal(
        <>
            <style>{STYLES}</style>
            <div className="pp-overlay" onClick={handleClose}>
                <div className="pp-box" onClick={(e) => e.stopPropagation()}>

                    {/* Header */}
                    <div className="pp-head bg-primary">
                        <Image src="/logo-small.png" alt="logo" width={100} height={100} className="bg-white rounded-full" />
                        <div>
                            <div className="pp-htitle">Nhận hàng thế nào?</div>
                            <div className="pp-hsub">Chọn cách bạn muốn nhận pizza</div>
                        </div>
                        <button className="pp-x" onClick={handleClose}>✕</button>
                    </div>

                    {/* Tabs */}
                    <Tabs mode={mode} setMode={setMode} />

                    {/* Body */}
                    <div className="pp-body">

                        {/* ── DELIVERY ── */}
                        {mode === "delivery" && (
                            <div className="pp-section">
                                <div className="pp-label-row">
                                    <label className="pp-lbl">
                                        Địa chỉ giao hàng <span style={{ color: "#E63946" }}>*</span>
                                    </label>
                                    <button className="pp-locate-btn" onClick={handleGetLocation} disabled={locLoading} type="button">
                                        {locLoading
                                            ? <><span className="pp-spin" /> Đang lấy...</>
                                            : <><MdOutlineMyLocation /> Vị trí của tôi</>}
                                    </button>
                                </div>

                                <div className="pp-field" style={{ position: "relative" }}>
                                    <span className="pp-ficon">
                                        {loading ? <span className="pp-spin" /> : <SearchIcon className="text-secondary" />}
                                    </span>
                                    <input
                                        ref={inputRef}
                                        className="pp-input"
                                        type="text"
                                        autoComplete="off"
                                        placeholder="VD: 123 Nguyễn Huệ, Quận 1..."
                                        value={deliveryQuery}
                                        onChange={(e) => {
                                            setDeliveryQuery(e.target.value);
                                            setDeliveryAddr(null);
                                            setShowDrop(true);
                                            setLocError("");
                                        }}
                                        onFocus={() => items.length && setShowDrop(true)}
                                    />
                                    {deliveryQuery && (
                                        <button className="pp-clr" onClick={() => {
                                            setDeliveryQuery("");
                                            setDeliveryAddr(null);
                                            setLocError("");
                                            inputRef.current?.focus();
                                        }}>✕</button>
                                    )}

                                    {showDrop && items.length > 0 && (
                                        <ul className="pp-drop" ref={dropRef}>
                                            {items.map((it) => (
                                                <li key={it.id} className="pp-drop-item" onMouseDown={() => handlePick(it)}>
                                                    <span className="pp-drop-pin">📍</span>
                                                    <span className="pp-drop-txt">{it.label}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {showDrop && !loading && deliveryQuery.length >= 3 && items.length === 0 && (
                                        <div className="pp-empty">Không tìm thấy địa chỉ trong TP.HCM</div>
                                    )}
                                </div>

                                {deliveryAddr && !addrValid && (
                                    <div className="pp-warn">
                                        ⚠️ Địa chỉ chưa có <b>số nhà</b>. Vui lòng nhập cụ thể hơn,
                                        ví dụ: <i>&quot;123 Nguyễn Huệ, Quận 1&quot;</i>
                                    </div>
                                )}
                                {locError && <div className="pp-warn pp-warn-err">⚠️ {locError}</div>}

                                <ShipFeeTable deliveryInfo={deliveryInfo} />
                                {deliveryInfo && addrValid && (
                                    <DeliveryResult deliveryInfo={deliveryInfo} pickedAddr={deliveryAddr} />
                                )}
                            </div>
                        )}

                        {/* ── PICKUP ── */}
                        {mode === "pickup" && (
                            <div className="pp-section">
                                <div className="pp-map">
                                    <PickupMap selected={pickupStore} onSelect={setPickupStore} />
                                </div>
                                <label className="pp-lbl" style={{ marginBottom: 8 }}>Chọn chi nhánh gần bạn:</label>
                                <div className="pp-branches">
                                    {BRANCHES.map((b) => (
                                        <button
                                            key={b.id}
                                            className={`pp-branch${pickupStore?.id === b.id ? " sel" : ""}`}
                                            onClick={() => setPickupStore(b)}
                                        >
                                            <span className="pp-radio">{pickupStore?.id === b.id ? "●" : "○"}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="pp-bname">{b.name}</div>
                                                <div className="pp-baddr">{b.address}</div>
                                                <div className="pp-bmeta">⏰ {b.hours}&nbsp;&nbsp;📞 {b.phone}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pp-foot">
                        <ButtonPrimary
                            className={`pp-confirm${canConfirm ? " on" : ""}${success ? " ok" : ""}`}
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                        >
                            {confirmLabel()}
                        </ButtonPrimary>
                    </div>
                </div>
            </div>
        </>
        , document.body);
}