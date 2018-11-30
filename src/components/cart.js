import React from 'react';

import {
  convertWholeDollarsToCents,
  pluralize,
  calculateProductTotals
} from '../helpers.js';

let stripeHandler = undefined;

class Cart extends React.Component {
  constructor(props) {
    super(props);

    this.renderStatus = this.renderStatus.bind(this);
    this.renderCartItems = this.renderCartItems.bind(this);
    this.removeFromCart = this.removeFromCart.bind(this);
    this.openStripeCheckout = this.openStripeCheckout.bind(this);
  }

  componentDidMount() {
    stripeHandler = window.StripeCheckout.configure({
      key: 'pk_test_AuNpDt9SitHlyrmEchqAlPjy',
      locale: 'auto'
    });
  }

  openStripeCheckout(event) {
    event.preventDefault();

    const cartItems = this.props.cart.items;
    const totals = calculateProductTotals(cartItems);

    stripeHandler.open({
      name: 'Tiny Shopo',
      image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
      description: `${totals.quantity} item${pluralize(totals.quantity)}`,
      zipCode: true,
      billingAddress: true,
      shippingAddress: true,
      amount: convertWholeDollarsToCents(totals.price),
      currency: 'eur',
      token: (token, args) => {
        fetch('/.netlify/functions/charge', {
          method: 'POST',
          body: JSON.stringify({
            token,
            args,
            cart: this.props.cart,
            charge: {
              amount: totals.price,
              currency: 'EUR'
            }
          })
        })
          .then(response => {
            return response.json();
          })
          .then(json => {
            this.props.removeAllFromCart();
            return console.log(json);
          })
          .catch(error => {
            console.log('Fetch failed:' + error);
          });
      }
    });
  }

  renderStatus() {
    const cartItems = this.props.cart.items;
    let status = 'Nothing in your cart yet :(.';

    if (cartItems.length) {
      const totals = calculateProductTotals(cartItems);
      status = `It looks like you're buying <strong>${
        totals.quantity
      }</strong> for a grand total of <strong>€${
        totals.price
      }</strong>. Sweet!`;
    }

    return { __html: status };
  }

  removeFromCart(id) {
    this.props.removeFromCart(id);
  }

  renderCartItems() {
    return this.props.cart.items.map(item => {
      const image = item.image;
      return (
        <li className="cart-item" key={item.id}>
          <div className="cancel" onClick={e => this.removeFromCart(item.id)}>
            remove
          </div>
          {/* <img src={image.file.url} alt={image.description} /> */}
          <img src={image} alt={image.description} />
          <p className="description">
            <strong>{item.quantity}</strong> x {item.name}
          </p>
          <p className="price">
            <strong>€{item.price}</strong>
          </p>
        </li>
      );
    });
  }

  render() {
    if (!this.props.cart.items.length) {
      return (
        <h3 className="status" dangerouslySetInnerHTML={this.renderStatus()} />
      );
    } else {
      return (
        <div>
          <h3
            className="status"
            dangerouslySetInnerHTML={this.renderStatus()}
          />
          <button
            className="buy"
            name="buy"
            onClick={e => this.openStripeCheckout(e)}
          >
            Buy Now!
          </button>
          <button
            className="clear-cart"
            name="clear-cart"
            onClick={this.props.removeAllFromCart}
          >
            Clear All
          </button>
          <ul className="cart-items">{this.renderCartItems()}</ul>
        </div>
      );
    }
  }
}

export default Cart;
