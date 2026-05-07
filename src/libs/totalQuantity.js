
export function totalQuantity(cartProducts) {
    return cartProducts.reduce((sum, p) => sum + (p.quantity ?? 1), 0);
}
