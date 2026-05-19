"use client"
import { CartContext, cartProductPrice } from '@/components/AppContext';
import CartProduct from '@/modules/cart/CartProduct';
import HeaderCart from '@/modules/cart/HeaderCart';
import React, { useContext, useEffect, useState } from 'react'
import { totalQuantity } from '@/libs/totalQuantity';
import CartProductEmpty from '@/modules/cart/CartProductEmpty';
import CartSubtotal from '@/modules/cart/CartSubtotal';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import Link from 'next/link';
import { CHECKOUT_ROUTE, HOME_ROUTE } from '@/constant/routesApp';
import { useDelivery } from '@/context/DeliveryContext';
import RecommendMenuItems from '@/components/layout/RecommendMenuItems';

export default function CartPage() {
  const { cartProducts, removeCartProduct } = useContext(CartContext);
  let subtotal = 0;
  for (const p of cartProducts) {
    subtotal += cartProductPrice(p);
  }

  const { deliveryInfo } = useDelivery();
  return (
    <section>
      <HeaderCart urlLink={HOME_ROUTE} />
      <div className="grid grid-cols-1 gap-4 mt-0 md:mt-8 md:gap-8 md:grid-cols-3">
        <div className='md:col-span-2'>
          {cartProducts?.length === 0 && (
            <CartProductEmpty />
          )}
          {cartProducts?.length > 0 && <div className='px-4 border rounded-2xl'>
            <p className='py-4 text-sm font-semibold text-blackHeader md:text-base'>Có {totalQuantity(cartProducts)} sản phẩm trong giỏ hàng của bạn</p>
            {cartProducts?.length > 0 && cartProducts.map((product, index) => (
              <CartProduct
                key={product._id}
                index={index}
                product={product}
                onRemove={removeCartProduct}
                showEdit
              />
            ))}
          </div>}
          <div className='px-4 mt-4 border rounded-2xl '>
            <RecommendMenuItems classNameTitle={"normal-case"} hasLine={false} slidesConfig={{
              mobile: 2.3,
              tablet: 1.3,
              desktop: 1.3,
            }} />
          </div>
        </div>
        <div className="">
          <CartSubtotal subtotal={subtotal} deliveryFee={deliveryInfo?.shipFee} />
          <div className='px-4 md:px-0'>
            <Link href={cartProducts?.length > 0 ? CHECKOUT_ROUTE : '#'}
              className={cartProducts?.length === 0 ? 'pointer-events-none' : ''}>
              <ButtonPrimary className={"mt-6"} disabled={!cartProducts?.length}>Thanh toán</ButtonPrimary>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
