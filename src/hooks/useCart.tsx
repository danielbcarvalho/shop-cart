import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      let isProductCart = false;

      const newCart = cart.map((product) => {
        if (product.id === productId) {
          product.amount++;
          isProductCart = true;
        }
        return product;
      });

      if (isProductCart) {
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));

        setCart(newCart);
      } else {
        const response = await api.get("products");
        const [productToAdd] = response.data.filter((product: Product) => {
          return product.id === productId;
        });
        console.log(productToAdd);
        const cartItem = {
          ...productToAdd,
          amount: 1,
        };
        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify([...cart, cartItem])
        );

        setCart([...cart, cartItem]);
      }
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = cart.filter((product) => {
        if (product.id === productId) {
          return false;
        }
        return product;
      });
      setCart(updatedCart);
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const updatedCart = cart.map((product) => {
        if (product.id === productId) {
          product.amount = amount;
        }
        return product;
      });
      setCart(updatedCart);
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
