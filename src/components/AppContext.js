"use client";
import { SessionProvider } from "next-auth/react";
import React, { createContext, useCallback, useEffect, useState } from "react";

export const CartContext = createContext({});


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
        const cartProduct = { ...product, size, extras, quantity, noteOrder };
        newProducts = [...prevProducts, cartProduct];
      }
      saveCartProductToLocalStorage(newProducts);
      return newProducts;
    })
  }

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
        cartProducts, setCartProducts, addToCart, clearCart, removeCartProduct, updateCart
      }}>
        {children}
      </CartContext.Provider>
    </SessionProvider>
  );
};
export default AppProvider;
