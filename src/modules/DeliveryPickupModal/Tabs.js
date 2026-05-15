export default function Tabs({
    mode,
    setMode,
}) {
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
                    <span>{t.icon}</span> {t.label}
                </button>
            ))}
        </div>
    );
}