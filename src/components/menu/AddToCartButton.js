import React from 'react'
import FlyingButton from '../buttons/FlyingButton';


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
                    <div onClick={onClick} className="text-white">
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
            className="px-8 py-2 mt-4 text-white bg-primary"
        >
            <span>Add to cart (from ${basePrice})</span>
        </button>
    );
}
