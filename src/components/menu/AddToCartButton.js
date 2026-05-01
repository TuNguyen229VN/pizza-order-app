import React from 'react'
import FlyingButton from 'react-flying-item'

export default function AddToCartButton({
    hasSizesOrExtras, onClick, basePrice, image
}) {
    if (!hasSizesOrExtras) {
        return (
            <div className="mt-4 flying-button-parent">
                <FlyingButton
                    targetTop={'5%'}
                    targetLeft={'95%'}
                    src={image}>
                    <div onClick={onClick}>
                        Add to cart ${basePrice}
                    </div>
                </FlyingButton>
            </div>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            className="px-8 py-2 mt-4 text-white rounded-full bg-primary"
        >
            <span>Add to cart (from ${basePrice})</span>
        </button>
    );
}
