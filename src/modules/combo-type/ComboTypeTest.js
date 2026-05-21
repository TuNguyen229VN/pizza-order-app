//        // slots: [{ category: categoryId, quantity: number, label: string }]
//        const [slots, setSlots] = useState(
//            editData?.slots?.map((s) => ({
//                category: s.category?._id || s.category || "",
//                quantity: s.quantity || 1,
//                label: s.label || "",
//            })) || []
//        );
   
//         const [categories, setCategories] = useState([]);

        
//     // Load danh sách category
//     useEffect(() => {
//         fetch(API_CATEGORIES)
//             .then((r) => r.json())
//             .then((d) => setCategories(d.categories || d || []));
//     }, []);


//      // ── Slot helpers ───────────────────────────────────────────────────────
//         function addSlot() {
//             if (loading) return
//             setSlots((prev) => [...prev, { category: "", quantity: 1, label: "" }]);
//             clearError("slots");
//         }
    
//         function removeSlot(idx) {
//             if (loading) return;
//             setSlots((prev) => prev.filter((_, i) => i !== idx));
//         }
    
//         function updateSlot(idx, field, value) {
//             if (loading) {
//                 return
//             }
//             setSlots((prev) =>
//                 prev.map((slot, i) => (i === idx ? { ...slot, [field]: value } : slot))
//             );
//             clearError("slots");
//         }
    
//         function moveSlot(idx, dir) {
//             if (loading) return
//             setSlots((prev) => {
//                 const arr = [...prev];
//                 const target = idx + dir;
//                 if (target < 0 || target >= arr.length) return arr;
//                 [arr[idx], arr[target]] = [arr[target], arr[idx]];
//                 return arr;
//             });
//         }

        

//         // submit validate
// const slotErrors = {};
//         if (slots.length === 0) {
//             slotErrors.slots = "Phải có ít nhất 1 slot";
//         } else {
//             for (let i = 0; i < slots.length; i++) {
//                 if (!slots[i].category) {
//                     slotErrors.slots = `Slot ${i + 1}: chưa chọn danh mục`;
//                     break;
//                 }
//                 if (!slots[i].quantity || slots[i].quantity < 1) {
//                     slotErrors.slots = `Slot ${i + 1}: số lượng phải >= 1`;
//                     break;
//                 }
//             }
//         }

//         if (Object.keys(slotErrors).length > 0) {
//             setErrors((prev) => ({ ...prev, ...slotErrors }));
//         }

//         || Object.keys(slotErrors).length > 0
// // =======================================================
//    {/* Slots */}
//             <div>
//                 <div className="flex items-center justify-between mt-4 mb-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                         Slots <span className="text-red-500">*</span>
//                     </label>
//                     <button
//                         type="button"
//                         onClick={addSlot}
//                         disabled={loading}
//                         className={`flex items-center gap-1 text-sm font-semibold text-primary hover:text-red-700 ${loading ? "pointer-events-none" : "cursor-pointer"}`}
//                     >
//                         + Thêm slot
//                     </button>
//                 </div>

//                 {slots.length === 0 && (
//                     <div className="p-6 text-sm text-center text-gray-400 border-2 border-gray-200 border-dashed rounded-xl">
//                         Chưa có slot nào. Nhấn &quot;+ Thêm slot&quot; để bắt đầu.
//                     </div>
//                 )}

//                 <div className="space-y-3">
//                     {errors.slots && (
//                         <span className="block mt-1 text-xs text-primary">{errors.slots}</span>
//                     )}
//                     {slots.map((slot, idx) => (
//                         <div
//                             key={idx}
//                             className="relative p-4 border border-gray-200 rounded-xl"
//                         >
//                             {/* Header slot */}
//                             <div className="flex items-center justify-between mb-3">
//                                 <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
//                                     Slot {idx + 1}
//                                 </span>
//                                 <div className="flex items-center gap-1">
//                                     <button
//                                         type="button"
//                                         onClick={() => moveSlot(idx, -1)}
//                                         disabled={idx === 0}
//                                         className={`p-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 ${loading ? "pointer-events-none" : "cursor-pointer"}`}
//                                         title="Di chuyển lên"
//                                     >
//                                         ▲
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => moveSlot(idx, 1)}
//                                         disabled={idx === slots.length - 1}
//                                         className={`p-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 ${loading ? "pointer-events-none" : "cursor-pointer"}`}
//                                         title="Di chuyển xuống"
//                                     >
//                                         ▼
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => removeSlot(idx)}
//                                         className={`p-1 ml-1 text-xs text-primary hover:text-red-700 ${loading ? "pointer-events-none" : "cursor-pointer"}`}
//                                         title="Xóa slot"
//                                     >
//                                         <CloseIcon />
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-3">
//                                 {/* Danh mục */}
//                                 <div className="col-span-2">
//                                     <label className="block mb-1 text-xs text-gray-500">
//                                         Danh mục <span className="text-red-400">*</span>
//                                     </label>
//                                     <select
//                                         className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                                         value={slot.category}
//                                         disabled={loading}
//                                         onChange={(e) => updateSlot(idx, "category", e.target.value)}
//                                     >
//                                         <option value="">-- Chọn danh mục --</option>
//                                         {categories.map((cat) => (
//                                             <option key={cat._id} value={cat._id}>
//                                                 {cat.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 {/* Label */}
//                                 <div>
//                                     <label className="block mb-1 text-xs text-gray-500">
//                                         Nhãn hiển thị
//                                     </label>
//                                     <input
//                                         className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                                         value={slot.label}
//                                         disabled={loading}
//                                         onChange={(e) => updateSlot(idx, "label", e.target.value)}
//                                         placeholder="VD: Pizza, Đồ uống..."
//                                     />
//                                 </div>

//                                 {/* Số lượng */}
//                                 <div>
//                                     <label className="block mb-1 text-xs text-gray-500">
//                                         Số lượng <span className="text-red-400">*</span>
//                                     </label>
//                                     <div className="flex items-center gap-2">
//                                         <button
//                                             disabled={loading}
//                                             type="button"
//                                             onClick={() =>
//                                                 updateSlot(idx, "quantity", Math.max(1, slot.quantity - 1))
//                                             }
//                                             className="flex items-center justify-center w-8 h-8 text-lg font-bold leading-none text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
//                                         >
//                                             −
//                                         </button>
//                                         <span className="w-8 font-semibold text-center text-gray-800">
//                                             {slot.quantity}
//                                         </span>
//                                         <button
//                                             disabled={loading}
//                                             type="button"
//                                             onClick={() => updateSlot(idx, "quantity", slot.quantity + 1)}
//                                             className="flex items-center justify-center w-8 h-8 text-lg font-bold leading-none text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
//                                         >
//                                             +
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}

//                 </div>
//             </div>

//             {/* Preview tóm tắt */}
//             {slots.length > 0 && (
//                 <div className="p-3 mt-4 text-[#333] text-sm border border-gray-200 bg-red-50 rounded-xl">
//                     <p className="mb-1 font-medium">Tóm tắt combo:</p>
//                     <ul className="list-disc list-inside space-y-0.5">
//                         {slots.map((slot, idx) => {
//                             const cat = categories.find((c) => c._id === slot.category);
//                             return (
//                                 <li key={idx}>
//                                     <strong>{slot.label || cat?.name || "?"}</strong> — {slot.quantity} món
//                                     {cat && slot.label && cat.name !== slot.label ? ` (${cat.name})` : ""}
//                                 </li>
//                             );
//                         })}
//                     </ul>
//                 </div>
//             )}