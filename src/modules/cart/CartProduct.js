import Image from 'next/image';
import React, { useState } from 'react'
import { cartComboPrice, cartProductPrice } from '../../components/AppContext';
import TrashCircel from '@/components/icons/TrashCircel';
import CartProductDetail from './CartProductDetail';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import ConfirmPopup from '@/components/popup/ConfirmPopup';
import { useSwipeDelete } from '@/hooks/useSwipeDelete';
import Trash from '@/components/icons/Trash';
import { useRouter } from 'next/navigation';
import SkeletonLoadingBox from '@/components/skeleton/SkeletonLoadingBox';
import { useTranslations } from 'next-intl';

export default function CartProduct({ index, product, onRemove, showEdit = false }) {
  const [showPopup, setShowPopup] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);
  const cTrans = useTranslations("Cart");
 const sTrans = useTranslations("System");
  useLockBodyScroll(showPopup);
  const { wrapperRef, itemRef, bgRef } = useSwipeDelete(() => onRemove?.(index));
  const router = useRouter();
  const isCombo = product?.type === "combo";

  const handleEditCombo = () => {
    if (isCombo) {
      router.push(`/combo-order/${product._id}?cartComboId=${product?.cartComboId}`);
    }
  };
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
          <div className='w-[82px] h-[96px] overflow-hidden flex-shrink-0'>
           {loadingImage && <SkeletonLoadingBox className='w-full h-full' />}
            <Image
              width={240}
              height={240}
              src={product.image}
              alt={product.name}
              onLoad={() => setLoadingImage(false)}
              className={`object-center object-cover ${loadingImage ? "opacity-0" : "opacity-100"}`}
            />
          </div>

          <div className='lg:w-[350px] break-words'>
            <h4 className='font-medium capitalize'>{product.name}</h4>

            {product.size && (
              <div className="mt-1 text-secondary">
                {sTrans("Cỡ")}: <span>{product.size.name}</span>
              </div>
            )}

            {product.extras?.length > 0 && (
              <div className="mt-1 text-secondary">
                {sTrans("Topping thêm")}:
                {product.extras.map((extra, i) => (
                  <span key={extra.name}> {extra.name}{i !== product.extras.length - 1 && ","}</span>
                ))}
              </div>
            )}

            {/* Hiển thị items của combo */}
            {product?.slots?.length > 0 && (
              <div className="mt-1 text-secondary">
                {product.slots.map((item, i) => (
                  <span key={i} className="block">
                    • {item.menuItem?.name}
                    {item.selectedSize?.name && ` (${item.selectedSize.name})`}
                    {item.quantity > 0 && ` x${item.quantity}`}
                  </span>
                ))}
              </div>
            )}

            {product.noteOrder && (
              <div className='text-xs md:text-sm text-secondary'>
                {sTrans("Ghi chú")}: <p>{product.noteOrder}</p>
              </div>
            )}

            {showEdit && (
              <>
                <div
                  className='mt-1 cursor-pointer text-primary'
                  onClick={() => isCombo ? handleEditCombo() : setShowPopup(true)}
                >
                  {sTrans("Chỉnh sửa")}
                </div>

                {/* Edit modal cho sản phẩm thường */}
                {!isCombo && (
                  <CartProductDetail menuItem={product} showPopup={showPopup} setShowPopup={setShowPopup} />
                )}

              </>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-2 md:flex-row'>
          <div className='font-medium text-center md:text-lg'>
            {product.quantity}
          </div>
          <div className='flex items-center md:items-start md:text-lg font-medium w-max md:w-[200px] justify-center md:justify-end gap-5'>
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