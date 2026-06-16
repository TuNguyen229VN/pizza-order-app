"use client"
import { CartContext, cartProductPrice, totalCartPrice } from '@/components/AppContext';
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
import UseProfile from '@/components/UseProfile';
import { calcPointDiscount } from '@/libs/pointTier';
import NotificationPopup from '@/components/popup/NotificationPopup';
import { MIN_DELIVERY_AMOUNT } from '@/constant/constant';

export default function CartPage() {
  const { cartProducts, removeCartProduct } = useContext(CartContext);
  const { data: profileData } = UseProfile();
  let subtotal = 0;
  for (const p of cartProducts) {
    subtotal += cartProductPrice(p);
  }

  const { deliveryInfo } = useDelivery();
  const { discountAmount, discountPercent, tier } = calcPointDiscount(profileData?.pointRewards, totalCartPrice(cartProducts));
  const isDeliveryBelowMin = deliveryInfo?.mode === "delivery" && totalCartPrice(cartProducts) < MIN_DELIVERY_AMOUNT;
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
                key={product.cartId || product.cartComboId || index}
                index={index}
                product={product}
                onRemove={removeCartProduct}
                showEdit
              />
            ))}
          </div>}
          <div className='px-4 mt-4 border rounded-2xl '>
            <RecommendMenuItems classNameTitle={"normal-case"} hasLine={false} slidesConfig={{
              mobile: 1.3,
              tablet: 2.3,
              desktop: 1.3,
            }} />
          </div>
        </div>
        <div className="">
          <CartSubtotal subtotal={totalCartPrice(cartProducts)} deliveryFee={deliveryInfo?.shipFee} discountAmount={discountAmount} discountPercent={discountPercent} />
          <div className='px-4 md:px-0'>
            <div className='px-4 md:px-0'>
              {isDeliveryBelowMin ? (
                <NotificationPopup
                  labelDesc={`Đợi đã! Bạn vui lòng mua thêm ${(MIN_DELIVERY_AMOUNT-totalCartPrice(cartProducts)).toLocaleString('vi-VN')} ₫ để đủ điều kiện giao hàng`}
                  labelConfirm="Xác nhận"
                  classNameButton="w-full"
                >
                  <ButtonPrimary className="mt-6" disabled={!cartProducts?.length}>
                    Thanh toán
                  </ButtonPrimary>
                </NotificationPopup>
              ) : (
                <Link href={cartProducts?.length > 0 ? CHECKOUT_ROUTE : '#'}
                  className={!cartProducts?.length ? 'pointer-events-none' : ''}>
                  <ButtonPrimary className="mt-6" disabled={!cartProducts?.length}>
                    Thanh toán
                  </ButtonPrimary>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
