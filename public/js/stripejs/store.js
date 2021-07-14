/**
 * store.js
 * Stripe Payments Demo. Created by Romain Huet (@romainhuet)
 * and Thorsten Schaeff (@thorwebdev).
 *
 * Representation of products, and line items stored in Stripe.
 * Please note this is overly simplified class for demo purposes (all products
 * are loaded for convenience, there is no cart management functionality, etc.).
 * A production app would need to handle this very differently.
 */

class Store {
  constructor() {
    this.amount = 100;
  }
  async updateTotal(amount, intent) {
    this.amount = amount;
    await this.updatePaymentIntentWithAmount(intent);
  }
  getPaymentTotal() {
    return this.amount;
  }

  // Retrieve the configuration from the API.
  async getConfig() {
    try {
      const response = await fetch('/config');
      const config = await response.json();
      if (config.stripePublishableKey.includes('live')) {
        // Hide the demo notice if the publishable key is in live mode.
        document.querySelector('#order-total .demo').style.display = 'none';
      }
      return config;
    } catch (err) {
      return {error: err.message};
    }
  }

  // Create the PaymentIntent with the cart details.
  async createPaymentIntent(currency) {
    try {
      const response = await fetch('/payment_intents', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          currency,
          amount: this.amount,
        }),
      });
      const data = await response.json();
      if (data.error) {
        return {error: data.error};
      } else {
        return data;
      }
    } catch (err) {
      return {error: err.message};
    }
  }

  // Create the PaymentIntent with the cart details.
  async updatePaymentIntentWithAmount(paymentIntent) {
    try {
      const response = await fetch(
        `/payment_intents/${paymentIntent}/amount_change`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            amount: this.amount,
          }),
        }
      );
      const data = await response.json();
      if (data.error) {
        return {error: data.error};
      } else {
        return data;
      }
    } catch (err) {
      return {error: err.message};
    }
  }

  // Update the PaymentIntent with the the currency and payment value.
  async updatePaymentIntentCurrency(paymentIntent, currency, payment_methods) {
    try {
      const response = await fetch(
        `/payment_intents/${paymentIntent}/update_currency`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            currency,
            payment_methods,
          }),
        }
      );
      const data = await response.json();
      if (data.error) {
        return {error: data.error};
      } else {
        return data;
      }
    } catch (err) {
      return {error: err.message};
    }
  }

  // Format a price (assuming a two-decimal currency like EUR or USD for simplicity).
  formatPrice(amount) {
    let price = (amount / 100).toFixed(2);
    let numberFormat = new Intl.NumberFormat(['en-US'], {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'symbol',
    });
    return numberFormat.format(price);
  }

}

window.store = new Store();
