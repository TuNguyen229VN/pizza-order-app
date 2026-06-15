
export function cartProductPrice(cartProduct) {
  let price = cartProduct.basePrice;
  if (cartProduct.size) price += cartProduct.size.price;
  if (cartProduct.extras?.length > 0) {
    for (const extra of cartProduct.extras) price += extra.price;
  }
  if (cartProduct?.quantity) price = price * cartProduct.quantity;
  return price;
}

export function cartComboPrice(comboCartItem) {
  return (comboCartItem.price || 0) * (comboCartItem.quantity || 1);
}

export function totalCartPrice(cartProducts) {
  return cartProducts.reduce((sum, item) => {
    if (item.type === "combo") return sum + cartComboPrice(item);
    return sum + cartProductPrice(item);
  }, 0);
}