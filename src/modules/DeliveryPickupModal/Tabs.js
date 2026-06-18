import { useTranslations } from "next-intl";

export default function Tabs({
    mode,
    setMode,
}) {
     const sTrans = useTranslations("System");
    return (
        <div className="pp-tabs">
            {[
                { key: "delivery", icon: "🛵", label: "Giao hàng đến" },
                { key: "pickup", icon: "🏪", label: "Mua mang về" },
            ].map((t) => (
                <button
                    key={t.key}
                    className={`pp-tab${mode === t.key ? " active" : ""}`}
                    onClick={() => setMode(t.key)}
                >
                    <span>{t.icon}</span> {sTrans(t.label)}
                </button>
            ))}
        </div>
    );
}