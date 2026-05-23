import Image from 'next/image';
import React, { useState } from 'react'
import { cartComboPrice, cartProductPrice } from '../../components/AppContext';
import TrashCircel from '@/components/icons/TrashCircel';
import CartProductDetail from './CartProductDetail';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import ConfirmPopup from '@/components/popup/ConfirmPopup';
import { useSwipeDelete } from '@/hooks/useSwipeDelete';
import Trash from '@/components/icons/Trash';
import ComboSelector from '../combo/ComboSelector';

export default function CartProduct({ index, product, onRemove, onUpdateCombo, showEdit = false }) {
  const [showPopup, setShowPopup] = useState(false);
  const [showComboEdit, setShowComboEdit] = useState(false);
  useLockBodyScroll(showPopup || showComboEdit);
  const { wrapperRef, itemRef, bgRef } = useSwipeDelete(() => onRemove?.(index));

  const isCombo = product?.type === "combo";

  /**
   * Chuyển product.slots (đã lưu trong cart) về shape initialSelections của ComboSelector:
   *   initialSelections[slotIdx] = Array<{ menuItem, selectedSize, quantity }>
   *
   * Cart lưu slots dạng:
   *   product.slots = [{ menuItem, selectedSize, quantity, slotIndex }, ...]
   *
   * ComboSelector nhận mảng hoặc Map – ở đây trả mảng, useEffect trong ComboSelector
   * sẽ tự convert sang Map.
   */
  function buildInitialSelections() {
    // Ưu tiên product.slots (field mà addComboToCart lưu vào cart)
    const source = product?.slots?.length ? product.slots
      : product?.items?.length ? product.items   // fallback nếu cấu trúc cũ dùng items
      : [];

    if (!source.length) return {};

    const map = {};
    source.forEach((item) => {
      // slotIndex phải có; nếu không thì mặc định 0
      const idx = item.slotIndex ?? 0;
      if (!map[idx]) map[idx] = [];
      map[idx].push({
        menuItem: item.menuItem,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity || 1,
      });
    });
    return map;
  }

  return (
    <div ref={wrapperRef} className="relative overflow-hidden rounded-md md:rounded-none">

      {/* Nền đỏ khi swipe – chỉ mobile */}
      <div
        ref={bgRef}
        className="absolute inset-y-0 right-0 flex items-center justify-center w-20 bg-primary md:hidden"
        style={{ opacity: 0 }}
      >
        <Trash className="w-6 h-6 text-white" />
      </div>

      <div
        ref={itemRef}
        className="flex justify-between gap-4 py-4 text-sm bg-white md:text-base dark:bg-background touch-pan-y"
      >
        <div className='flex gap-4'>
          <div className='w-[82px] h-[96px] overflow-hidden'>
            <Image
              width={240}
              height={240}
              src={product.image}
              alt={product.name}
              className={`object-center w-full h-full ${isCombo ? "object-fill" : "object-cover"}`}
            />
          </div>

          <div className='lg:w-[350px] break-words'>
            <h4 className='font-medium capitalize'>{product.name}</h4>

            {product.size && (
              <div className="mt-1 text-secondary">
                Cỡ: <span>{product.size.name}</span>
              </div>
            )}

            {product.extras?.length > 0 && (
              <div className="mt-1 text-secondary">
                Topping thêm:
                {product.extras.map((extra, i) => (
                  <span key={extra.name}> {extra.name}{i !== product.extras.length - 1 && ","}</span>
                ))}
              </div>
            )}

            {/* Hiển thị items của combo */}
            {product?.slots?.length > 0 && (
              <div className="mt-1 text-secondary text-xs space-y-0.5">
                {product.slots.map((item, i) => (
                  <span key={i} className="block">
                    • {item.menuItem?.name}
                    {item.selectedSize?.name && ` (${item.selectedSize.name})`}
                    {item.quantity > 1 && ` x${item.quantity}`}
                  </span>
                ))}
              </div>
            )}

            {product.noteOrder && (
              <div className='text-xs md:text-sm text-secondary'>
                Ghi chú: <p>{product.noteOrder}</p>
              </div>
            )}

            {showEdit && (
              <>
                <div
                  className='mt-1 cursor-pointer text-primary'
                  onClick={() => isCombo ? setShowComboEdit(true) : setShowPopup(true)}
                >
                  Chỉnh sửa
                </div>

                {/* Edit modal cho sản phẩm thường */}
                {!isCombo && (
                  <CartProductDetail menuItem={product} showPopup={showPopup} setShowPopup={setShowPopup} />
                )}

                {/* Edit modal cho combo */}
                {isCombo && showComboEdit && (
                  <ComboSelector
                    combo={product.comboDetail ?? product}
                    mode="edit"
                    initialSelections={buildInitialSelections()}
                    initialQuantity={product.quantity}
                    initialNote={product.noteOrder}
                    cartItemId={product.cartId}
                    onUpdate={(cartItemId, selectedItems, qty, note) => {
                      onUpdateCombo?.(cartItemId, selectedItems, qty, note);
                      setShowComboEdit(false);
                    }}
                    onClose={() => setShowComboEdit(false)}
                  />
                )}
              </>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-2 md:flex-row'>
          <div className='font-medium text-center md:text-lg'>
            {product.quantity}
          </div>
          <div className='flex items-center md:items-start md:text-lg font-medium w-[200px] justify-center md:justify-end gap-5'>
            <p>
              {isCombo
                ? cartComboPrice(product).toLocaleString('vi-VN')
                : cartProductPrice(product).toLocaleString('vi-VN')}
              {' '}<span className='underline'>đ</span>
            </p>
            <div className='hidden md:inline'>
              {!!onRemove && (
                <ConfirmPopup onDelete={() => onRemove(index)}>
                  <TrashCircel />
                </ConfirmPopup>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}