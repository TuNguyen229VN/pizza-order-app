import React, { useContext, useEffect, useRef, useState } from "react";
import { CartContext } from "../AppContext";
import MenuItemTile from "./MenuItemTile";
import Image from "next/image";
import FlyingButton from "../buttons/FlyingButton";
import InputRadio from "../input/InputRadio";
import CloseIcon from "../icons/CloseIcon";
import InputCheckbox from "../input/InputCheckbox";
import ButtonPrimary from "../buttons/ButtonPrimary";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { createPortal } from "react-dom";
import { useDelivery } from "@/context/DeliveryContext";
import DeliveryPickupModal from "@/modules/DeliveryPickupModal";
import { KEYWORDS } from "@/constant/constant";
import SkeletonLoadingBox from "../skeleton/SkeletonLoadingBox";

const MenuItems = ({ recomStyle, ...menuItem }) => {
  const { image, name, description, basePrice, sizes, extraIngredientPrices } = menuItem
  const [
    selectedSize, setSelectedSize
  ] = useState(sizes?.[0] || null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1)
  const [noteOrder, setNoteOrder] = useState("")
  const [pendingAdd, setPendingAdd] = useState(false);

  const { addToCart } = useContext(CartContext);
  const { deliveryInfo, openDeliveryModal } = useDelivery();
  const [showPopup, setShowPopup] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);
  useLockBodyScroll(showPopup);

  const flyingBtnRef = useRef(null);

  const doAddToCart = () => {
    addToCart(menuItem, selectedSize, selectedExtras, quantity, noteOrder);
    setSelectedSize(sizes?.[0] || null);
    setSelectedExtras([]);
    setShowPopup(false);
    setNoteOrder("");
    setQuantity(1);
  }

  useEffect(() => {
    if (pendingAdd && deliveryInfo) {
      setPendingAdd(false);
      const hasOptions = sizes.length > 1 || extraIngredientPrices.length > 1;
      if (hasOptions) {
        setShowPopup(true);
      } else {
        flyingBtnRef.current?.triggerFly();
        // addToCart(menuItem, selectedSize, selectedExtras, quantity, noteOrder);
        // setQuantity(1);
      }
    }
  }, [deliveryInfo, pendingAdd]);

  const handleAddToCartButtonClick = async () => {
    if (!deliveryInfo) {
      setPendingAdd(true);
      openDeliveryModal();
      return;
    }
    const hasOptions = sizes.length > 1 || extraIngredientPrices.length > 1;
    if (hasOptions && !showPopup) {
      setShowPopup(true);
      return;
    }
    addToCart(menuItem, selectedSize, selectedExtras, quantity, noteOrder);
    setSelectedSize(sizes?.[0] || null);
    setSelectedExtras([]);
    setShowPopup(false);
    setNoteOrder("");
    setQuantity(1);
  }

  const closePopup = () => {
    setShowPopup(false);
    setSelectedSize(sizes?.[0] || null);
    setSelectedExtras([]);
    setShowPopup(false);
    setNoteOrder("");
    setQuantity(1);
  }
  const handleQtyChange = (quantityChange) => {
    const newQuantity = quantity + quantityChange;
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  }
  const handleExtraThingClick = (extraThing) => {
    const exists = selectedExtras.find(e => e._id === extraThing._id);
    if (exists) {
      setSelectedExtras(prev => prev.filter(e => e._id !== extraThing._id));
    } else {
      setSelectedExtras(prev => [...prev, extraThing]);
    }
  };

  const isPizza = KEYWORDS.some(keyword =>
    name?.toLowerCase().includes(keyword)
  );

  // Choose option will increase the product price 
  // Ex: choose Size (Large,Medium, Small), Extra ingredient(Cheese, Pork,...) => Price Increase (basePrice + selectedPrice + ExtraIngredientPrice)
  let selectedPrice = basePrice;
  if (selectedSize) {
    selectedPrice += selectedSize.price;
  }
  if (selectedExtras?.length > 0) {
    for (const extra of selectedExtras) {
      selectedPrice += extra.price;
    }
  }
  if (quantity >= 1) {
    selectedPrice = selectedPrice * quantity;
  }

  return (
    <>
      {showPopup && createPortal(
        <div onClick={closePopup} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div onClick={ev => ev.stopPropagation()}
            className="flex flex-col w-full md:flex-row max-w-screen-lg h-full md:h-[560px] overflow-hidden bg-white md:rounded-xl relative overflow-y-auto">
            <button
              className="absolute z-10 bg-white rounded-full right-11 top-5"
              onClick={closePopup}>
              <CloseIcon />
            </button>
            <div className="w-full md:w-[430px] h-[310px] md:h-full shrink-0 relative overflow-hidden">
              {loadingImage && <SkeletonLoadingBox className='w-full h-full' />}
              <Image
                src={image}
                alt={name}
                quality={100}
                onLoad={() => setLoadingImage(false)}
                fill
                className={`object-cover ${isPizza ? "md:scale-150 left-0 md:!-left-[15%]" : ""}  ${loadingImage ? "opacity-0" : "opacity-100"}`}
                style={isPizza ? {
                  objectPosition: 'right center',
                } : {}}
              />
            </div>
            <div className="flex flex-col flex-1">
              <div className="overflow-auto h-[calc(100%-80px)] p-5 lg:w-[570px]">
                <div>
                  <h3 className="md:text-2xl leading-[30px] font-semibold break-words absolute md:static top-0 left-0 bg-white md:bg-none w-full md:w-max p-3 md:p-0">{name}</h3>
                  <p className="text-sm break-words md:mt-2 md:text-base text-secondary">{description}</p>
                </div>
                {sizes?.length > 0 && (
                  <div className="mt-4 md:mt-7 ">
                    <h3 className="font-medium md:font-semibold ">Kích thước</h3>
                    <div className="flex mt-2 overflow-hidden text-center border rounded-md">
                      {sizes.map(size => (
                        <InputRadio key={size._id} name={size.name} onClick={() => setSelectedSize(size)} selectedSize={selectedSize?.name} />
                      ))}
                    </div>
                  </div>
                )}
                {extraIngredientPrices?.length > 0 && (
                  <div className="mt-4 md:mt-6">
                    <h3 className="mb-5 font-medium md:font-semibold md:mb-7">Topping thêm</h3>
                    {extraIngredientPrices.map(extraThing => {
                      const sel = selectedExtras.find(e => e._id === extraThing._id);
                      const isChecked = !!sel;
                      return (
                        <InputCheckbox key={extraThing._id} extraThing={extraThing} onClick={() => handleExtraThingClick(extraThing)} isChecked={isChecked} />
                      )
                    })}
                  </div>
                )}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-medium md:font-semibold">Ghi chú (tùy chọn)</h3>
                    <span className="text-xs md:text-sm whitespace-nowrap">{noteOrder?.length}/72</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={72}
                      placeholder="Chúng tôi sẽ cố gắng hết sức để phục vụ bạn nếu có thể!"
                      value={noteOrder}
                      onChange={e => setNoteOrder(e.target.value)}
                      className="flex-1 w-full px-4 py-3 pr-10 border rounded-lg outline-none focus:border-black"
                    />
                    {noteOrder?.length > 0 && <button className="absolute p-[1px] border rounded-full right-3 top-2/4 -translate-y-2/4 cursor-pointer" onClick={() => setNoteOrder("")}><CloseIcon className="w-4 h-4" /></button>}
                  </div>
                </div>
              </div>
              <div className="sticky flex flex-col items-center justify-between w-full gap-4 px-5 py-4 bg-white border-t-4 border-gray-300 md:border-t-0 md:flex-row bottom-2 lg:gap-9 md:py-0">
                <div className="flex items-center justify-center gap-4 lg:gap-6">
                  <button onClick={() => handleQtyChange(-1)}
                    className="flex items-center justify-center w-10 h-10 text-2xl border rounded-md text-primary">−</button>
                  <span className="w-5 text-sm font-medium text-center md:text-base">{quantity}</span>
                  <button onClick={() => handleQtyChange(1)}
                    className="flex items-center justify-center w-10 h-10 text-2xl border rounded-md text-primary">+</button>
                </div>
                {/* <FlyingButton
                  className="flex items-center justify-center w-full"
                  targetTop={'6%'}
                  targetLeft={'80%'}
                  src={image}
                  >
                  <ButtonPrimary onClick={handleAddToCartButtonClick}>
                    <div
                      className="text-center text-white"
                    >
                      Thêm vào giỏ hàng <span className="inline-block w-2 h-2 mx-2 bg-white rounded-full"></span> {selectedPrice.toLocaleString('vi-VN')} <span className="underline">đ</span>
                    </div>
                  </ButtonPrimary>
                </FlyingButton> */}
                <FlyingButton
                  ref={flyingBtnRef}
                  className="flex items-center justify-center w-full"
                  targetTop={'6%'}
                  targetLeft={'80%'}
                  src={image}
                  onClick={() => {
                    // chỉ chạy khi animation xong, chỉ dùng cho flow có deliveryInfo + showPopup
                    addToCart(menuItem, selectedSize, selectedExtras, quantity, noteOrder);
                    setSelectedSize(sizes?.[0] || null);
                    setSelectedExtras([]);
                    setNoteOrder("");
                    setQuantity(1);
                  }}
                >
                  <ButtonPrimary onClick={(e) => {
                    if (!deliveryInfo) {
                      // flow pendingAdd: không bay, chỉ mở modal
                      e.stopPropagation(); // ← chặn bubble lên FlyingButton, không bay
                      setPendingAdd(true);
                      setOpen(true);
                      return;
                    }
                    if (sizes.length > 1 || extraIngredientPrices.length > 1) {
                      if (!showPopup) {
                        e.stopPropagation(); // ← chặn bubble, chỉ mở popup
                        setShowPopup(true);
                        return;
                      }
                      // showPopup đang true → cho bubble lên FlyingButton → bay → addToCart
                      setShowPopup(false); // đóng popup ngay trước khi bay
                    } else {
                      // không có options, cho bay luôn
                      setShowPopup(false);
                    }
                  }}>
                    <div className="text-center text-white">
                      Thêm vào giỏ hàng{" "}
                      <span className="inline-block w-2 h-2 mx-2 bg-white rounded-full" />{" "}
                      {selectedPrice.toLocaleString('vi-VN')} <span className="underline">đ</span>
                    </div>
                  </ButtonPrimary>
                </FlyingButton>
              </div>
            </div>
          </div>
        </div>
        , document.body
      )}
      <MenuItemTile
        addToCartRef={flyingBtnRef}
        addToCartFn={doAddToCart}
        onClick={() => setShowPopup(true)}
        onAddToCart={handleAddToCartButtonClick}
        recomStyle={recomStyle}
        {...menuItem}
      />
    </>
  );
};

export default MenuItems;
