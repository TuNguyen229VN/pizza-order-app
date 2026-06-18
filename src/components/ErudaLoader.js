"use client";
import { useEffect } from "react";

export default function ErudaLoader() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.search.includes("debug=1")) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    script.onload = () => window.eruda.init();
    document.body.appendChild(script);
  }, []);
  return null;
}