import Image from 'next/image';
import React, { useState } from 'react'
import { cartProductPrice } from '../../components/AppContext';
import TrashCircel from '@/components/icons/TrashCircel';
import CartProductDetail from './CartProductDetail';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import ConfirmPopup from '@/components/popup/ConfirmPopup';
import { useSwipeDelete } from '@/hooks/useSwipeDelete';
import Trash from '@/components/icons/Trash';

export default function CartProduct({ index, product, onRemove, showEdit = false }) {
  const [showPopup, setShowPopup] = useState(false)
  useLockBodyScroll(showPopup);
  const { wrapperRef, itemRef, bgRef } = useSwipeDelete(() => onRemove?.(index));
  return (
    <div ref={wrapperRef}  className="relative overflow-hidden rounded-md md:rounded-none">

      {/* Nền đỏ hiện ra khi kéo — chỉ hiện trên mobile */}
      <div
        ref={bgRef}
        className="absolute inset-y-0 right-0 flex items-center justify-center w-20 bg-primary md:hidden"
        style={{ opacity: 0 }}
      >
        <Trash className="w-6 h-6 text-white" />
      </div>

      <div
        ref={itemRef}
        className="flex justify-between gap-4 py-4 text-sm bg-white md:text-base dark:bg-background touch-pan-y" >
        <div className='flex gap-4'>
          <div className='w-[82px] h-[96px] overflow-hidden'>
            <Image width={240} height={240} src={product.image} alt={product.name} className='object-cover object-center w-full h-full' />
          </div>
          <div className='lg:w-[350px] break-words'>
            <h4 className='font-medium'>{product.name}</h4>
            {product.size && (
              <div className="mt-1 text-secondary">
                Cỡ: <span>{product.size.name}</span>
              </div>
            )}
            {product.extras?.length > 0 && (
              <div className="mt-1 text-secondary">
                Topping thêm:
                {product.extras.map((extra, index) => (
                  <span key={extra.name}> {extra.name}{index !== product.extras.length - 1 && ","}</span>
                ))}
              </div>
            )}
            {product.noteOrder && <div className='text-xs md:text-sm text-secondary'>
              Ghi chú: <p>{product.noteOrder}</p>
            </div>}

            {showEdit && (
              <>
                <div className='mt-1 cursor-pointer text-primary' onClick={() => setShowPopup(true)}>Chỉnh sửa
                </div>
                <CartProductDetail menuItem={product} showPopup={showPopup} setShowPopup={setShowPopup} />
              </>
            )}
          </div>
        </div>
        <div className='flex flex-col gap-2 md:flex-row'>
          <div className='font-medium text-center md:text-lg'>
            {product.quantity}
          </div>
          <div className='flex items-center md:items-start   md:text-lg font-medium w-[200px] justify-center md:justify-end gap-5'>
            <p>{cartProductPrice(product).toLocaleString('vi-VN')} <span className='underline'>đ</span></p>
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
