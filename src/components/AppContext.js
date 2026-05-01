"use client";
import { SessionProvider } from "next-auth/react";
import React, { createContext, useEffect, useState } from "react";

export const CartContext = createContext({});
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

  function addToCart(product, size = null, extras = []) {
    setCartProducts(prevProducts => {
      const cartProduct = { ...product, size, extras }
      const newProducts = [...prevProducts, cartProduct];
      saveCartProductToLocalStorage(newProducts);
      return newProducts;
    })
  }

  function clearCart() {
    setCartProducts([])
    saveCartProductToLocalStorage([])
  }

  function removeCartProduct(indexToRemove) {
    setCartProducts(prevCartProducts => {
      const newCartProducts = prevCartProducts.filter((v, index) => index !== indexToRemove)
      saveCartProductToLocalStorage(newCartProducts);
      return newCartProducts;
    })

  }

  return <SessionProvider>
    <CartContext.Provider value={{
      cartProducts, setCartProducts, addToCart, clearCart, removeCartProduct
    }}>
      {children}
    </CartContext.Provider>
  </SessionProvider>;
};

export default AppProvider;
