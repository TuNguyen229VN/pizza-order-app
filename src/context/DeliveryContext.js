"use client";
import { createContext, useContext, useState, useEffect } from "react";

const DeliveryContext = createContext(null);

export function DeliveryProvider({ children }) {
  const [deliveryInfo, setDeliveryInfo] = useState(null); // ✅ null cho cả server lẫn client

  useEffect(() => {
    // Chỉ chạy trên client sau khi mount
    try {
      const raw = localStorage.getItem("pizza_delivery_info");
      if (raw) setDeliveryInfo(JSON.parse(raw));
    } catch { }
  }, []);

  const saveDelivery = (data) => {
    localStorage.setItem("pizza_delivery_info", JSON.stringify(data));
    setDeliveryInfo(data);
  };

  return (
    <DeliveryContext.Provider value={{ deliveryInfo, saveDelivery }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export const useDelivery = () => useContext(DeliveryContext);