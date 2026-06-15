import { POINT_TIERS } from "@/constant/constant";

// Trả về tier hiện tại của user (hoặc null nếu chưa đủ mốc nào)
export function getUserTier(pointRewards) {
    return POINT_TIERS.find(tier => pointRewards >= tier.minPoints) ?? null;
}

// Tính số tiền được giảm dựa trên điểm và tổng đơn
export function calcPointDiscount(pointRewards, subtotal) {
    const tier = getUserTier(pointRewards);
    if (!tier) return { discountPercent: 0, discountAmount: 0, tier: null };
    const discountAmount = Math.round(subtotal * tier.discountPercent / 100);
    return { discountPercent: tier.discountPercent, discountAmount, tier };
}