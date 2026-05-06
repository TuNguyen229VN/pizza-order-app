import React, { useContext, useState } from "react";
import { CartContext } from "../AppContext";
import toast from "react-hot-toast";
import MenuItemTile from "./MenuItemTile";
import Image from "next/image";
import FlyingButton from "../buttons/FlyingButton";
import InputRadio from "../input/InputRadio";
import CloseIcon from "../icons/CloseIcon";
import InputCheckbox from "../input/InputCheckbox";
import ButtonPrimary from "../buttons/ButtonPrimary";


const MenuItems = (menuItem) => {
  const { image, name, description, basePrice, sizes, extraIngredientPrices } = menuItem
  const [
    selectedSize, setSelectedSize
  ] = useState(sizes?.[0] || null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1)
  const [noteOrder, setNoteOrder] = useState("")
  
  const { addToCart } = useContext(CartContext);
  const [showPopup, setShowPopup] = useState(false)
  const handleAddToCartButtonClick = async () => {
    const hasOptions = sizes.length > 0 || extraIngredientPrices.length > 0;
    if (hasOptions && !showPopup) {
      setShowPopup(true);
      return;
    }
    addToCart(menuItem, selectedSize, selectedExtras, quantity, noteOrder);
    setSelectedSize(sizes?.[0] || null);
    setSelectedExtras([]);
    setShowPopup(false);
  }

  // function handleExtraThingClick(ev, extraThing) {
  //   const checked = ev.target.checked;
  //   if (checked) {
  //     setSelectedExtras(prev => [...prev, extraThing]);
  //   } else {
  //     setSelectedExtras(prev => {
  //       return prev.filter(e => e.name !== extraThing.name);
  //     });
  //   }
  // }

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
      {showPopup && (
        <div onClick={() => setShowPopup(false)} className="fixed inset-0 z-20 flex items-center justify-center bg-black/80">
          <div onClick={ev => ev.stopPropagation()}
            className="flex max-w-screen-lg h-[560px] overflow-hidden bg-white rounded-xl relative">
            <button
              className="absolute right-5 top-5"
              onClick={() => setShowPopup(false)}>
              <CloseIcon />
            </button>
            <div className="w-full">
              <Image src={image} alt={name} width={200} height={200} className="object-cover object-center w-full h-full" />
            </div>
            <div className="">
              <div className="overflow-auto h-[calc(100%-80px)] p-5">
                <div>
                  <h3 className="text-2xl leading-[30px] font-semibold">{name}</h3>
                  <p className="mt-2 text-secondary w-[570px]">{description}</p>
                </div>
                {sizes?.length > 0 && (
                  <div className="mt-7 ">
                    <h3 className="font-semibold ">Kích thước</h3>
                    <div className="flex mt-2 overflow-hidden text-center border rounded-md">
                      {sizes.map(size => (
                        <InputRadio key={size._id} name={size.name} onClick={() => setSelectedSize(size)} selectedSize={selectedSize?.name} />
                      ))}
                    </div>
                  </div>
                )}
                {extraIngredientPrices?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-7">Topping thêm</h3>
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
                    <h3 className="font-semibold">Ghi chú (tùy chọn)</h3>
                    <span className="text-sm whitespace-nowrap">{noteOrder?.length}/72</span>
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
              <div className="sticky flex items-center justify-between w-full px-5 bottom-2 gap-9">
                <div className="flex items-center justify-center gap-6">
                  <button onClick={() => handleQtyChange(-1)}
                    className="flex items-center justify-center w-10 h-10 text-2xl border rounded-md text-primary">−</button>
                  <span className="w-5 font-medium text-center">{quantity}</span>
                  <button onClick={() => handleQtyChange(1)}
                    className="flex items-center justify-center w-10 h-10 text-2xl border rounded-md text-primary">+</button>
                </div>
                <FlyingButton
                  className="flex items-center justify-center w-full"
                  targetTop={'6%'}
                  targetLeft={'80%'}
                  src={image}>
                  <ButtonPrimary onClick={handleAddToCartButtonClick}>
                    <div
                      className="text-center text-white"
                    >
                      Thêm vào giỏ hàng <span className="inline-block w-2 h-2 mx-2 bg-white rounded-full"></span> {selectedPrice} <span className="underline">đ</span>
                    </div>
                  </ButtonPrimary>
                </FlyingButton>
              </div>
            </div>


            {/* --------------------------------------- */}
            {/* <div
              className="p-2 overflow-y-scroll"
              style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <Image src={image} alt={name} width={300} height={200} className="mx-auto" />
              <h2 className="mb-2 text-lg font-bold text-center">{name}</h2>
              <p className="mb-2 text-sm text-center text-gray-500">
                {description}
              </p>
              {sizes?.length > 0 && (
                <div className="py-2">
                  <h3 className="text-center text-gray-700">Pick your size</h3>
                  {sizes.map(size => (
                    <label
                      key={size._id}
                      className="flex items-center gap-2 p-4 mb-1 border rounded-md">
                      <input
                        type="radio"
                        onChange={() => setSelectedSize(size)}
                        checked={selectedSize?.name === size.name}
                        name="size" />
                      {size.name} ${basePrice + size.price}
                    </label>
                  ))}
                </div>
              )}
              {extraIngredientPrices?.length > 0 && (
                <div className="py-2">
                  <h3 className="text-center text-gray-700">Any extras?</h3>
                  {extraIngredientPrices.map(extraThing => (
                    <label
                      key={extraThing._id}
                      className="flex items-center gap-2 p-4 mb-1 border rounded-md">
                      <input
                        type="checkbox"
                        onChange={ev => handleExtraThingClick(ev, extraThing)}
                        checked={selectedExtras.map(e => e._id).includes(extraThing._id)}
                        name={extraThing.name} />
                      {extraThing.name} +${extraThing.price}
                    </label>
                  ))}
                </div>
              )}
              <div className="sticky rounded-xl bg-primary bottom-2">
                <FlyingButton
                  targetTop={'6%'}
                  targetLeft={'80%'}
                  src={image}>
                  <div
                    className="text-center text-white"
                    onClick={handleAddToCartButtonClick}>
                    Add to cart ${selectedPrice}
                  </div>
                </FlyingButton>
              </div>
              <button
                className="mt-2"
                onClick={() => setShowPopup(false)}>
                Cancel
              </button>
            </div> */}
          </div>
        </div>
      )}
      <MenuItemTile onClick={() => setShowPopup(true)} onAddToCart={handleAddToCartButtonClick} {...menuItem} />
    </>
  );
};

export default MenuItems;
