import React from "react";
import { Link } from "react-router-dom";
import { MdShoppingBasket } from "react-icons/md";

import logo from "../../assets/images/logo.svg";
import { Container, Cart } from "./styles";
import { useCart } from "../../hooks/useCart";
interface CartItemsAmount {
  [key: number]: number;
}

const Header = (): JSX.Element => {
  const { cart } = useCart();

  // let cartItemsAmount = cart.reduce((sumItems, item) => {
  //   if (item.id in sumItems) {
  //     sumItems[item.id]++;
  //   } else {
  //     sumItems[item.id] = 1;
  //   }
  //   return sumItems;
  // }, {} as CartItemsAmount);

  // const cartSize = Object.keys(cartItemsAmount).length;
  const cartSize = cart.length;
  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
