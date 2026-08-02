"use client";

import Link from "next/link";
import { useCart } from "components/cart/cart-context";
import Footer from "components/layout/footer";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { EditItemQuantityButton } from "components/cart/edit-item-quantity-button";
import { DeleteItemButton } from "components/cart/delete-item-button";
import { Button } from "components/ui/button";

export default function CartPage() {
  const { cart, updateCartItem } = useCart();
  const totalAmount = Number(cart?.cost?.totalAmount?.amount || 0);
  const freeDeliveryThreshold = 1000;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - totalAmount);
  const deliveryProgress = Math.min(100, (totalAmount / freeDeliveryThreshold) * 100);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full">
        <div className="mb-6 border-b border-emerald-100 pb-4 dark:border-neutral-800">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Shopping Cart ({cart?.totalQuantity || 0} Items)
          </h1>
          <p className="text-xs text-neutral-500">Review your selected items before checkout</p>
        </div>

        {/* Free Delivery Progress Bar */}
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
            <span>
              {remainingForFreeDelivery === 0
                ? "You have unlocked Free Nationwide Delivery!"
                : `Add BDT ${remainingForFreeDelivery.toFixed(2)} more to get Free Shipping!`}
            </span>
            <span>{Math.round(deliveryProgress)}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-950">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${deliveryProgress}%` }}
            />
          </div>
        </div>

        {!cart || cart.lines.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <ShoppingCartIcon className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-neutral-900 dark:text-white">
              Your cart is currently empty
            </h2>
            <p className="mt-1 text-xs text-neutral-500 max-w-md">
              Explore our fresh seeds, fertilizers, and agro tools to start shopping.
            </p>
            <Link href="/search" className="mt-6">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.lines.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.merchandise.product.featuredImage?.url}
                      alt={item.merchandise.product.title}
                      className="h-20 w-20 rounded-xl object-cover border border-neutral-100 dark:border-neutral-800"
                    />
                    <div>
                      <Link
                        href={`/product/${item.merchandise.product.handle}`}
                        className="font-bold text-sm text-neutral-900 hover:text-emerald-600 dark:text-white"
                      >
                        {item.merchandise.product.title}
                      </Link>
                      <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                        BDT {Number(item.cost.totalAmount.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t pt-3 sm:border-t-0 sm:pt-0 border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 px-2 py-1">
                      <EditItemQuantityButton
                        item={item}
                        type="minus"
                        optimisticUpdate={updateCartItem}
                      />
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <EditItemQuantityButton
                        item={item}
                        type="plus"
                        optimisticUpdate={updateCartItem}
                      />
                    </div>

                    <DeleteItemButton item={item} optimisticUpdate={updateCartItem} />
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs h-fit space-y-4 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-bold text-neutral-900 border-b pb-3 dark:border-neutral-800 dark:text-white">
                Order Summary
              </h2>

              <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    BDT {totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery Fee</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {remainingForFreeDelivery === 0 ? "FREE" : "BDT 60.00"}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-sm font-extrabold text-neutral-900 dark:text-white dark:border-neutral-800">
                  <span>Total Bill</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">
                    BDT {(totalAmount + (remainingForFreeDelivery === 0 ? 0 : 60)).toFixed(2)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="block pt-2">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
