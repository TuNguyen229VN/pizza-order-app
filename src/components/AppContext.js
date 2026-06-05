"use client";
import { SessionProvider } from "next-auth/react";
import React, { createContext, useCallback, useEffect, useState } from "react";
import uniqid from "uniqid";
export const CartContext = createContext({});

// ─── Tính giá 1 item thường ───
export function cartProductPrice(cartProduct) {
  let price = cartProduct.basePrice;
  if (cartProduct.size) {
    price += cartProduct.size.price;
  }
  if (cartProduct.extras?.length > 0) {
    for (const extra of cartProduct.extras) {
      price += extra.price;
    }
  }
  if (cartProduct?.quantity) {
    price = price * cartProduct.quantity
  }
  return price;
}
// ─── Tính giá 1 combo trong giỏ 
export function cartComboPrice(comboCartItem) {
  return (comboCartItem.price || 0) * (comboCartItem.quantity || 1);
}

// ─── Tính tổng giỏ hàng (cả món lẻ lẫn combo) ───────────────────────────────
export function totalCartPrice(cartProducts) {
  return cartProducts.reduce((sum, item) => {
    if (item.type === "combo") return sum + cartComboPrice(item);
    return sum + cartProductPrice(item);
  }, 0);
}


const AppProvider = ({ children }) => {
  const [cartProducts, setCartProducts] = useState([]);
  const ls = typeof window !== "undefined" ? window.localStorage : null;

  useEffect(() => {
    if (ls && ls.getItem("cart")) {
      setCartProducts(JSON.parse(ls.getItem("cart")))
    }
  }, [])

  function saveCartProductToLocalStorage(cartProducts) {
    if (ls) {
      ls.setItem("cart", JSON.stringify(cartProducts))
    }
  }

  function addToCart(product, size = null, extras = [], quantity = 1, noteOrder = "") {
    setCartProducts(prevProducts => {
      // Kiểm tra có sản phẩm trùng không
      const existingIndex = prevProducts.findIndex(p => {
        // Cùng _id
        if (p._id !== product._id) return false;

        // Cùng size
        const sameSize = (!p.size && !size) ||
          (p.size?._id?.toString() === size?._id?.toString());
        if (!sameSize) return false;

        // Cùng extras (so sánh không quan tâm thứ tự)
        const pExtraIds = p.extras.map(e => e._id.toString()).sort();
        const newExtraIds = extras.map(e => e._id.toString()).sort();
        const sameExtras = JSON.stringify(pExtraIds) === JSON.stringify(newExtraIds);
        if (!sameExtras) return false;

        // Cùng ghi chú order
        const sameNote = (p.noteOrder ?? "") === (noteOrder ?? "");
        return sameNote;
      });

      let newProducts;
      if (existingIndex !== -1) {
        // Trùng → cộng dồn quantity
        newProducts = prevProducts.map((p, i) =>
          i === existingIndex
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      } else {
        // Chưa có → thêm mới
        const cartProduct = { ...product, cartId: uniqid(), size, extras, quantity, noteOrder };
        newProducts = [...prevProducts, cartProduct];
      }
      saveCartProductToLocalStorage(newProducts);
      return newProducts;
    })
  }


  function addComboToCart(comboDetail, selectedItems, quantity = 1, noteOrder = "") {
    setCartProducts((prevProducts) => {
      const existingIndex = prevProducts.findIndex(p => {
        if (p.type !== "combo") return false;
        if (p._id !== comboDetail._id) return false;

        // Cùng noteOrder
        if ((p.noteOrder ?? "") !== (noteOrder ?? "")) return false;

        // Cùng selectedItems (so sánh theo slotIndex + _id + quantity)
        if (p.slots.length !== selectedItems.length) return false;
        const sortFn = (a, b) => `${a.slotIndex}-${a._id}`.localeCompare(`${b.slotIndex}-${b._id}`);
        const pSorted = [...p.slots].sort(sortFn);
        const newSorted = [...selectedItems].sort(sortFn);
        return JSON.stringify(pSorted) === JSON.stringify(newSorted);
      });

      let newProducts;
      if (existingIndex !== -1) {
        // Trùng → cộng dồn quantity
        newProducts = prevProducts.map((p, i) =>
          i === existingIndex
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      } else {
        // Chưa có → thêm mới
        const comboCartItem = {
          cartComboId: uniqid(),
          type: "combo",
          _id: comboDetail._id,
          name: comboDetail.name,
          image: comboDetail.image,
          price: comboDetail.price,
          comboType: comboDetail.comboType,
          slots: selectedItems,
          quantity,
          noteOrder,
        };
        newProducts = [...prevProducts, comboCartItem];
      }

      saveCartProductToLocalStorage(newProducts);
      return newProducts;
    });
  }

  // ── Update món lẻ ────────────
  function updateCart(product, size, extras, quantity, noteOrder) {
    setCartProducts(prevProducts => {
      const currentIndex = prevProducts.findIndex(p => {
        if (p._id !== product._id) return false;

        const sameSize = (!p.size && !product.size) ||
          (p.size?._id?.toString() === product.size?._id?.toString());
        if (!sameSize) return false;

        const pExtraIds = p.extras.map(e => e._id.toString()).sort();
        const productExtraIds = product.extras.map(e => e._id.toString()).sort();
        const sameExtras = JSON.stringify(pExtraIds) === JSON.stringify(productExtraIds);
        if (!sameExtras) return false;

        const sameNote = (p.noteOrder ?? "") === (product.noteOrder ?? "");
        return sameNote;
      });

      if (currentIndex === -1) return prevProducts; // không tìm thấy

      // Tìm xem sau khi update có trùng item nào khác không
      const existingIndex = prevProducts.findIndex((p, i) => {
        if (i === currentIndex) return false; // bỏ qua chính nó

        if (p._id !== product._id) return false;

        const sameSize = (!p.size && !size) ||
          (p.size?._id?.toString() === size?._id?.toString());
        if (!sameSize) return false;

        const pExtraIds = p.extras.map(e => e._id.toString()).sort();
        const newExtraIds = extras.map(e => e._id.toString()).sort();
        const sameExtras = JSON.stringify(pExtraIds) === JSON.stringify(newExtraIds);
        if (!sameExtras) return false;

        const sameNote = (p.noteOrder ?? "") === (noteOrder ?? "");
        return sameNote;
      });

      let newProducts;
      if (existingIndex !== -1) {
        // Trùng → gộp quantity, xóa item cũ
        newProducts = prevProducts
          .map((p, i) =>
            i === existingIndex
              ? { ...p, quantity: p.quantity + quantity }
              : p
          )
          .filter((_, i) => i !== currentIndex);
      } else {
        // Không trùng → update bình thường
        newProducts = prevProducts.map((p, i) =>
          i === currentIndex
            ? { ...p, size, extras, quantity, noteOrder }
            : p
        );
      }

      saveCartProductToLocalStorage(newProducts);
      return newProducts;
    });
  }

  // ── Update combo (chỉ quantity + note) ──────────────
function updateComboInCart(cartComboId, slots, quantity, noteOrder) {
    setCartProducts((prevProducts) => {
        const currentIndex = prevProducts.findIndex(p => p.cartComboId === cartComboId && p.type === "combo");
        if (currentIndex === -1) return prevProducts;

        const current = prevProducts[currentIndex];

        // Tìm item trùng (khác chính nó, cùng _id + slots + noteOrder)
        const existingIndex = prevProducts.findIndex((p, i) => {
            if (i === currentIndex) return false;
            if (p.type !== "combo" || p._id !== current._id) return false;
            if ((p.noteOrder ?? "") !== (noteOrder ?? "")) return false;

            if (p.slots.length !== slots.length) return false;
            const sortFn = (a, b) => `${a.slotIndex}-${a._id}`.localeCompare(`${b.slotIndex}-${b._id}`);
            const pSorted = [...p.slots].sort(sortFn);
            const newSorted = [...slots].sort(sortFn);
            return JSON.stringify(pSorted) === JSON.stringify(newSorted);
        });

        let newProducts;
        if (existingIndex !== -1) {
            // Trùng → gộp quantity, xóa item đang edit
            newProducts = prevProducts
                .map((p, i) =>
                    i === existingIndex
                        ? { ...p, quantity: p.quantity + quantity }
                        : p
                )
                .filter((_, i) => i !== currentIndex);
        } else {
            // Không trùng → update bình thường
            newProducts = prevProducts.map((p, i) =>
                i === currentIndex
                    ? { ...p, slots, quantity, noteOrder }
                    : p
            );
        }

        saveCartProductToLocalStorage(newProducts);
        return newProducts;
    });
}

  const clearCart = useCallback(() => {
    setCartProducts([]);
    saveCartProductToLocalStorage([]);
  }, []);

  function removeCartProduct(indexToRemove) {
    setCartProducts(prevCartProducts => {
      const newCartProducts = prevCartProducts.filter((v, index) => index !== indexToRemove)
      saveCartProductToLocalStorage(newCartProducts);
      return newCartProducts;
    })

  }

  return (
    <SessionProvider>
      <CartContext.Provider value={{
        cartProducts, setCartProducts, addToCart, clearCart, removeCartProduct, updateCart, addComboToCart, updateComboInCart,
      }}>
        {children}
      </CartContext.Provider>
    </SessionProvider>
  );
};
export default AppProvider;
