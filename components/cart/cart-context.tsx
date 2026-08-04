"use client";

import type {
  Cart,
  CartItem,
  Product,
  ProductVariant,
} from "lib/shopify/types";
import React, {
  createContext,
  use,
  useContext,
  useEffect,
  useState,
} from "react";

type UpdateType = "plus" | "minus" | "delete";

type CartAction =
  | {
      type: "UPDATE_ITEM";
      payload: { merchandiseId: string; updateType: UpdateType };
    }
  | {
      type: "ADD_ITEM";
      payload: { variant: ProductVariant; product: Product; quantity?: number };
    };

type CartContextType = {
  cartPromise: Promise<Cart | undefined>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  localCart: Cart | undefined;
  setLocalCart: React.Dispatch<React.SetStateAction<Cart | undefined>>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "krishi-udokta-cart";

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function updateCartItem(
  item: CartItem,
  updateType: UpdateType,
): CartItem | null {
  if (updateType === "delete") return null;

  const newQuantity =
    updateType === "plus" ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity === 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(
    newQuantity,
    singleItemAmount.toString(),
  );

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount,
      },
    },
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
  quantityToAdd: number = 1,
): CartItem {
  const quantity = existingItem ? existingItem.quantity + quantityToAdd : quantityToAdd;
  const totalAmount = calculateItemCost(quantity, variant.price.amount);

  return {
    id: existingItem?.id,
    quantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: variant.price.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage,
      },
    },
  };
}

function updateCartTotals(
  lines: CartItem[],
): Pick<Cart, "totalQuantity" | "cost"> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce(
    (sum, item) => sum + Number(item.cost.totalAmount.amount),
    0,
  );
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "BDT";

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: "0", currencyCode },
    },
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: "",
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "BDT" },
      totalAmount: { amount: "0", currencyCode: "BDT" },
      totalTaxAmount: { amount: "0", currencyCode: "BDT" },
    },
  };
}

function cartReducer(state: Cart | undefined, action: CartAction): Cart {
  const currentCart = state || createEmptyCart();

  switch (action.type) {
    case "UPDATE_ITEM": {
      const { merchandiseId, updateType } = action.payload;
      const updatedLines = currentCart.lines
        .map((item) =>
          item.merchandise.id === merchandiseId
            ? updateCartItem(item, updateType)
            : item,
        )
        .filter(Boolean) as CartItem[];

      if (updatedLines.length === 0) {
        return {
          ...currentCart,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...currentCart.cost,
            totalAmount: { ...currentCart.cost.totalAmount, amount: "0" },
          },
        };
      }

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    case "ADD_ITEM": {
      const { variant, product, quantity = 1 } = action.payload;
      const existingItem = currentCart.lines.find(
        (item) => item.merchandise.id === variant.id,
      );
      const updatedItem = createOrUpdateCartItem(
        existingItem,
        variant,
        product,
        quantity,
      );

      const updatedLines = existingItem
        ? currentCart.lines.map((item) =>
            item.merchandise.id === variant.id ? updatedItem : item,
          )
        : [...currentCart.lines, updatedItem];

      return {
        ...currentCart,
        ...updateCartTotals(updatedLines),
        lines: updatedLines,
      };
    }
    default:
      return currentCart;
  }
}

export function CartProvider({
  children,
  cartPromise,
}: {
  children: React.ReactNode;
  cartPromise: Promise<Cart | undefined>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localCart, setLocalCart] = useState<Cart | undefined>(undefined);

  return (
    <CartContext.Provider
      value={{ cartPromise, isOpen, setIsOpen, localCart, setLocalCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const serverCart = use(context.cartPromise);
  const { isOpen, setIsOpen, localCart, setLocalCart } = context;

  // Restore cart from localStorage on first mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.lines)) {
          setLocalCart(parsed);
        }
      }
    } catch (e) {
      // Ignore corrupted storage data
    }
  }, [setLocalCart]);

  // The local (client-side) cart takes precedence over the server cart
  const cart = localCart ?? serverCart ?? createEmptyCart();

  // Persist the cart whenever it changes
  useEffect(() => {
    if (localCart) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localCart));
      } catch (e) {
        // Ignore storage write failures
      }
    }
  }, [localCart]);

  const openCartModal = () => setIsOpen(true);
  const closeCartModal = () => setIsOpen(false);

  const updateCartItem = (merchandiseId: string, updateType: UpdateType) => {
    setLocalCart((prev) => {
      const nextCart = cartReducer(prev ?? serverCart, {
        type: "UPDATE_ITEM",
        payload: { merchandiseId, updateType },
      });
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCart));
      } catch (e) {}
      return nextCart;
    });
  };

  const addCartItem = (
    variant: ProductVariant,
    product: Product,
    quantity: number = 1,
    shouldOpenModal: boolean = false,
  ) => {
    setLocalCart((prev) => {
      const nextCart = cartReducer(prev ?? serverCart, {
        type: "ADD_ITEM",
        payload: { variant, product, quantity },
      });
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCart));
      } catch (e) {}
      return nextCart;
    });
    if (shouldOpenModal) {
      setIsOpen(true);
    }
  };

  return {
    cart,
    isOpen,
    openCartModal,
    closeCartModal,
    updateCartItem,
    addCartItem,
  };
}
