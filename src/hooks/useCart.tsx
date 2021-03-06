import { error } from "node:console";
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
      const updatedCart = [...cart];
      const productExists = updatedCart.find(
        (product) => product.id === productId
      );

      const stock = await api.get(`/stock/${productId}`);

      const stockAmount = stock.data.amount;
      const currentAmount = productExists ? productExists.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      if (productExists) {
        productExists.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`);
        const newProduct = {
          ...product.data,
          amount: 1,
        };
        updatedCart.push(newProduct);
      }

      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));

      // let isProductCart = false;

      // const newCart = cart.map((product) => {
      //   if (product.id === productId) {
      //     product.amount++;
      //     isProductCart = true;
      //   }
      //   return product;
      // });

      // if (isProductCart) {
      //   localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));

      //   setCart(newCart);
      // } else {
      //   const response = await api.get("products");
      //   const [productToAdd] = response.data.filter((product: Product) => {
      //     return product.id === productId;
      //   });
      //   console.log(productToAdd);
      //   const cartItem = {
      //     ...productToAdd,
      //     amount: 1,
      //   };
      //   localStorage.setItem(
      //     "@RocketShoes:cart",
      //     JSON.stringify([...cart, cartItem])
      //   );

      //   setCart([...cart, cartItem]);
      // }
    } catch {
      toast.error("Erro na adi????o do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productIndex = updatedCart.findIndex(
        (product) => product.id === productId
      );

      if (productIndex >= 0) {
        updatedCart.splice(productIndex, 1);
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na remo????o do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const updatedCart = [...cart];
      const stock = await api.get(`/stock/${productId}`);

      const stockAmount = stock.data.amount;

      updatedCart.forEach((product) => {
        if (product.id === productId) {
          if (product.amount >= stockAmount) {
            toast.error("Quantidade solicitada fora de estoque");
            throw Error();
          }
          product.amount = amount;
        }
      });

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch {
      toast.error("Erro na altera????o de quantidade do produto");
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
