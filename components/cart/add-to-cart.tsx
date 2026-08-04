"use client";

import clsx from "clsx";
import { Product, ProductVariant } from "lib/shopify/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "./cart-context";

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(1);

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === searchParams.get(option.name.toLowerCase()),
    ),
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  );

  const price = Number(product.priceRange.maxVariantPrice.amount);
  const productName = product.title;
  const whatsappMessage = `Hi, I want to order *${productName}* (Qty: ${quantity}) - ৳${(price * quantity).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  const whatsappUrl = `https://wa.me/8801604649648?text=${encodeURIComponent(whatsappMessage)}`;
  const phoneNumber = "tel:+8801604649648";

  const handleQuantityChange = (type: "plus" | "minus") => {
    if (type === "plus") {
      setQuantity((prev) => prev + 1);
    } else if (type === "minus" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const isDisabled = !availableForSale || !selectedVariantId;

  const handleAddToCart = () => {
    if (!finalVariant || !selectedVariantId) return;

    addCartItem(finalVariant, product, quantity, false);
    toast.success(`${productName} (Qty: ${quantity}) added to cart!`);
  };

  const handleBuyNow = () => {
    if (!finalVariant || !selectedVariantId) return;

    // Add the item to the cart, then open the checkout page
    addCartItem(finalVariant, product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Quantity:
        </span>
        <div className="inline-flex items-center rounded-md border border-neutral-300 dark:border-neutral-600">
          <button
            type="button"
            onClick={() => handleQuantityChange("minus")}
            disabled={quantity <= 1}
            className="flex h-9 w-9 items-center justify-center text-lg font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="flex h-9 w-10 items-center justify-center border-x border-neutral-300 text-sm font-semibold text-neutral-900 dark:border-neutral-600 dark:text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => handleQuantityChange("plus")}
            className="flex h-9 w-9 items-center justify-center text-lg font-medium text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons — 2×2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* ADD TO CART */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={clsx(
            "flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all cursor-pointer",
            isDisabled
              ? "cursor-not-allowed bg-neutral-400 opacity-60"
              : "bg-orange-500 hover:bg-orange-600 active:scale-[0.98] shadow-md hover:shadow-lg",
          )}
          aria-label="Add to cart"
        >
          <CartIcon />
          {!availableForSale ? "Out of Stock" : "ADD TO CART"}
        </button>

        {/* BUY NOW */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isDisabled}
          className={clsx(
            "flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all cursor-pointer",
            isDisabled
              ? "cursor-not-allowed bg-neutral-400 opacity-60"
              : "bg-[#1a3c34] hover:bg-[#15322c] active:scale-[0.98] shadow-md hover:shadow-lg",
          )}
          aria-label="Buy now"
        >
          BUY NOW
        </button>

        {/* ORDER ON WHATSAPP */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            "flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold tracking-wide text-white transition-all cursor-pointer",
            isDisabled
              ? "pointer-events-none bg-neutral-400 opacity-60"
              : "bg-green-500 hover:bg-green-600 active:scale-[0.98] shadow-md hover:shadow-lg",
          )}
          aria-label="Order on WhatsApp"
        >
          <WhatsAppIcon />
          Order On WhatsApp
        </a>

        {/* CALL FOR ORDER */}
        <a
          href={phoneNumber}
          className={clsx(
            "flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold tracking-wide text-white transition-all cursor-pointer",
            isDisabled
              ? "pointer-events-none bg-neutral-400 opacity-60"
              : "bg-[#1b2a4a] hover:bg-[#152240] active:scale-[0.98] shadow-md hover:shadow-lg",
          )}
          aria-label="Call for order"
        >
          <PhoneIcon />
          Call For Order
        </a>
      </div>
    </div>
  );
}
