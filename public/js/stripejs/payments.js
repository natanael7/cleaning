let paymentIntent;

(async () => {
  ('use strict');

  // Storage
  const style = {
    base: {
      iconColor: '#666ee8',
      color: '#31325f',
      fontWeight: 400,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '15px',
      '::placeholder': {
        color: '#aab7c4',
      },
      ':-webkit-autofill': {
        color: '#666ee8',
      },
    },
  };
  const paymentMethods = {
    card: {
      name: 'Card',
      flow: 'none',
    },
  };

  let submitButtonPayText = 'Pay';

  // Config
  const config = await store.getConfig();
  let activeCurrency = config.currency;
  let country = config.country;

  // Stripe Initialization
  const stripe = Stripe(config.stripePublishableKey);

  // Stripe Payment Requests
  const paymentRequest = stripe.paymentRequest({
    country: config.stripeCountry,
    currency: config.currency,
    total: {
      label: 'Total',
      amount: store.getPaymentTotal(),
    },
    requestShipping: true,
    requestPayerEmail: true,
    shippingOptions: config.shippingOptions,
  });
  const paymentRequestSupport = await paymentRequest.canMakePayment();

  // Stripe Elements
  const elements = stripe.elements();
  const card = elements.create('card', {style, hidePostalCode: true});
  const paymentRequestButton = elements.create('paymentRequestButton', {
    paymentRequest,
  });

  // URL variables
  const urlParams = new URLSearchParams(window.location.search);
  const url = new URL(window.location.href);

  // DOM elements
  const mainElement = document.getElementById('main');
  const form = document.getElementById('payment-form');
  const submitButton = form.querySelector('button[type=submit]');
  const amount = form.querySelector('input[name=amount]');

  const updateSubmitButtonPayText = (newText) => {
    submitButton.textContent = newText;
    submitButtonPayText = newText;
  };
  const handlePayment = (paymentResponse) => {
    const {paymentIntent, error} = paymentResponse;

    const confirmationElement = document.getElementById('confirmation');

    if (error && error.type === 'validation_error') {
      mainElement.classList.remove('processing');
      mainElement.classList.remove('receiver');
      submitButton.disabled = false;
      submitButton.textContent = submitButtonPayText;
    } else if (error) {
      mainElement.classList.remove('processing');
      mainElement.classList.remove('receiver');
      confirmationElement.querySelector('.error-message').innerText =
        error.message;
      mainElement.classList.add('error');
    } else if (paymentIntent.status === 'succeeded') {
      mainElement.classList.remove('processing');
      mainElement.classList.remove('receiver');

      confirmationElement.querySelector('.note').innerText =
        'We just sent your receipt to your email address, and your items will be on their way shortly.';
      mainElement.classList.add('success');
    } else if (paymentIntent.status === 'processing') {
      mainElement.classList.remove('processing');

      confirmationElement.querySelector('.note').innerText =
        'We’ll send your receipt and ship your items as soon as your payment is confirmed.';
      mainElement.classList.add('success');
    } else if (paymentIntent.status === 'requires_payment_method') {
      mainElement.classList.remove('processing');
      confirmationElement.querySelector('.error-message').innerText =
        paymentIntent.last_payment_error || 'Payment failed';
      mainElement.classList.add('error');
    } else {
      mainElement.classList.remove('success');
      mainElement.classList.remove('processing');
      mainElement.classList.remove('receiver');
      mainElement.classList.add('error');
    }
  };

  const handleError = (updateResponse) => {
    const {paymentIntent, error} = updateResponse;

    const mainElement = document.getElementById('main');
    const confirmationElement = document.getElementById('confirmation');

    if (error && error.type === 'validation_error') {
      mainElement.classList.remove('processing');
      mainElement.classList.remove('receiver');
      submitButton.disabled = false;
      submitButton.textContent = submitButtonPayText;
    } else if (error) {
      mainElement.classList.remove('processing');
      mainElement.classList.remove('receiver');
      confirmationElement.querySelector('.error-message').innerText =
        error.message;
      mainElement.classList.add('error');
    }
  };

  const handleSourceActivation = (source) => {
    const mainElement = document.getElementById('main');
    const confirmationElement = document.getElementById('confirmation');
    switch (source.flow) {
      case 'none':
        if (source.type === 'wechat') {
          const qrCode = new QRCode('wechat-qrcode', {
            text: source.wechat.qr_code_url,
            width: 128,
            height: 128,
            colorDark: '#424770',
            colorLight: '#f8fbfd',
            correctLevel: QRCode.CorrectLevel.H,
          });

          form.querySelector('.payment-info.wechat p').style.display = 'none';
          let amount = store.formatPrice(
            store.getPaymentTotal(),
            activeCurrency
          );
          updateSubmitButtonPayText(
            `Scan this QR code on WeChat to pay ${amount}`
          );

          pollPaymentIntentStatus(paymentIntent.id, 300000);
        } else {
          console.log('Unhandled none flow.', source);
        }
        break;
      case 'redirect':
        submitButton.textContent = 'Redirecting…';
        window.location.replace(source.redirect.url);
        break;
      case 'code_verification':
        break;
      case 'receiver':
        mainElement.classList.add('success', 'receiver');
        const receiverInfo =
          confirmationElement.querySelector('.receiver .info');
        let amount = store.formatPrice(source.amount, activeCurrency);
        switch (source.type) {
          case 'ach_credit_transfer':
            const ach = source.ach_credit_transfer;
            receiverInfo.innerHTML = `
              <ul>
                <li>
                  Amount:
                  <strong>${amount}</strong>
                </li>
                <li>
                  Bank Name:
                  <strong>${ach.bank_name}</strong>
                </li>
                <li>
                  Account Number:
                  <strong>${ach.account_number}</strong>
                </li>
                <li>
                  Routing Number:
                  <strong>${ach.routing_number}</strong>
                </li>
              </ul>`;
            break;
          case 'multibanco':
            const multibanco = source.multibanco;
            receiverInfo.innerHTML = `
              <ul>
                <li>
                  Amount (Montante):
                  <strong>${amount}</strong>
                </li>
                <li>
                  Entity (Entidade):
                  <strong>${multibanco.entity}</strong>
                </li>
                <li>
                  Reference (Referencia):
                  <strong>${multibanco.reference}</strong>
                </li>
              </ul>`;
            break;
          default:
            console.log('Unhandled receiver flow.', source);
        }

        pollPaymentIntentStatus(paymentIntent.id);
        break;
      default:
        break;
    }
  };

  const paymentIntentTerminalState = ({status, last_payment_error}) => {
    const endStates = ['succeeded', 'processing', 'canceled'];
    const hasError = typeof last_payment_error !== 'undefined';

    return (
      endStates.includes(status) ||
      (status === 'requires_payment_method' && hasError)
    );
  };

  const pollPaymentIntentStatus = async (
    paymentIntent,
    timeout = 30000,
    interval = 500,
    start = null
  ) => {
    start = start ? start : Date.now();
    const endStates = [
      'succeeded',
      'processing',
      'canceled',
      'requires_payment_method',
    ];

    const rawResponse = await fetch(`payment_intents/${paymentIntent}/status`);
    const response = await rawResponse.json();
    const isTerminalState = paymentIntentTerminalState(response.paymentIntent);

    if (!isTerminalState && Date.now() < start + timeout) {
      setTimeout(
        pollPaymentIntentStatus,
        interval,
        paymentIntent,
        timeout,
        interval,
        start
      );
    } else {
      handlePayment(response);
      if (!isTerminalState) {
        console.warn(new Error('Polling timed out.'));
      }
    }
  };
  const updateButtonLabel = (paymentMethod = 'card', bankName) => {
    let amount = store.formatPrice(store.getPaymentTotal(), activeCurrency);
    let name = paymentMethods[paymentMethod].name;
    let label = `Pay ${amount}`;
    if (paymentMethod !== 'card') {
      label = `Pay ${amount} with ${name}`;
    }
    if (paymentMethod === 'wechat') {
      label = `Generate QR code to pay ${amount} with ${name}`;
    }
    if (['sepa_debit', 'au_becs_debit'].includes(paymentMethod) && bankName) {
      label = `Debit ${amount} from ${bankName}`;
    }

    updateSubmitButtonPayText(label);
  };

  const selectCountry = (country) => {
    const selector = document.getElementById('country');
    selector.querySelector(`option[value=${country}]`).selected = 'selected';
    selector.className = `field ${country.toLowerCase()}`;

    if (country === 'AU') {
      activeCurrency = 'aud';
    } else {
      activeCurrency = config.currency;
    }

    showRelevantFormFields();
    showRelevantPaymentMethods();
  };

  const showRelevantFormFields = (country) => {
    if (!country) {
      country = form.querySelector('select[name=country] option:checked').value;
    }
    const zipLabel = form.querySelector('label.zip');
    const zipInput = form.querySelector('label.zip input');
    const zipSpan = form.querySelector('label.zip span');
    zipLabel.parentElement.classList.toggle(
      'with-state',
      ['AU', 'US'].includes(country)
    );
    switch (country) {
      case 'US':
        zipSpan.innerText = 'ZIP';
        zipInput.placeholder = '94103';
        break;
      case 'GB':
        zipSpan.innerText = 'Postcode';
        zipInput.placeholder = 'EC1V 9NR';
        break;
      case 'AU':
        zipSpan.innerText = 'Postcode';
        zipInput.placeholder = '3000';
        break;
      case 'IE':
        zipSpan.innerText = 'Aircode';
        zipInput.placeholder = 'EC1V 9NR';
        break;
      default:
        zipSpan.innerText = 'Postal Code';
        zipInput.placeholder = '94103';
        break;
    }

    const cityInput = form.querySelector('label.city input');
    const citySpan = form.querySelector('label.city span');
    switch (country) {
      case 'AU':
        citySpan.innerText = 'City / Suburb';
        cityInput.placeholder = 'Melbourne';
        break;
      default:
        citySpan.innerText = 'City';
        cityInput.placeholder = 'San Francisco';
        break;
    }
  };

  const showRelevantPaymentMethods = (country) => {
    if (!country) {
      country = form.querySelector('select[name=country] option:checked').value;
    }

    const paymentInputs = form.querySelectorAll('input[name=payment]');
    for (let i = 0; i < paymentInputs.length; i++) {
      let input = paymentInputs[i];
      input.parentElement.classList.toggle(
        'visible',
        input.value === 'card' ||
          (config.paymentMethods.includes(input.value) &&
            paymentMethods[input.value].countries.includes(country) &&
            paymentMethods[input.value].currencies.includes(activeCurrency))
      );
    }

    const paymentMethodsTabs = document.getElementById('payment-methods');
    paymentMethodsTabs.classList.toggle(
      'visible',
      paymentMethodsTabs.querySelectorAll('li.visible').length > 1
    );

    paymentInputs[0].checked = 'checked';
    form.querySelector('.payment-info.card').classList.add('visible');
    form.querySelector('.payment-info.redirect').classList.remove('visible');
    updateButtonLabel(paymentInputs[0].value);
  };

  const changeAmount = async (amount) => {
    await store.updateTotal(amount, paymentIntent.id);
    updateButtonLabel();
  };

  const amountChangeHandler = (event) => {
    if (event.target.value == '') {
      changeAmount(100);
      return;
    }
    changeAmount(event.target.value * 100);
  };

  amount.addEventListener('input', amountChangeHandler);

  card.mount('#card-element');

  card.on('change', ({error}) => {
    const cardErrors = document.getElementById('card-errors');
    if (error) {
      cardErrors.textContent = error.message;
      cardErrors.classList.add('visible');
    } else {
      cardErrors.classList.remove('visible');
    }

    submitButton.disabled = false;
  });

  paymentRequest.on('paymentmethod', async (event) => {
    console.log('Payment');

    const {error} = await stripe.confirmCardPayment(
      paymentIntent.client_secret,
      {
        payment_method: event.paymentMethod.id,
        shipping: {
          name: event.shippingAddress.recipient,
          phone: event.shippingAddress.phone,
          address: {
            line1: event.shippingAddress.addressLine[0],
            city: event.shippingAddress.city,
            postal_code: event.shippingAddress.postalCode,
            country: event.shippingAddress.country,
          },
        },
      },
      {handleActions: false}
    );
    if (error) {
      event.complete('fail');
      handlePayment({error});
    } else {
      event.complete('success');

      const response = await stripe.confirmCardPayment(
        paymentIntent.client_secret
      );
      handlePayment(response);
    }
  });

  if (paymentRequestSupport) {
    paymentRequestButton.mount('#payment-request-button');

    document.querySelector('.instruction span').innerText = 'Or enter';

    document.getElementById('payment-request').classList.add('visible');
  }

  form
    .querySelector('select[name=country]')
    .addEventListener('change', (event) => {
      event.preventDefault();
      selectCountry(event.target.value);
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payment = form.querySelector('input[name=payment]:checked').value;
    const phone = form.querySelector('input[name=phone]').value;
    const name = form.querySelector('input[name=name]').value;
    const country = form.querySelector(
      'select[name=country] option:checked'
    ).value;
    const email = form.querySelector('input[name=email]').value;
    const billingAddress = {
      line1: form.querySelector('input[name=address]').value,
      postal_code: form.querySelector('input[name=postal_code]').value,
    };
    const shipping = {
      name,
      phone,
      address: {
        line1: form.querySelector('input[name=address]').value,
        city: form.querySelector('input[name=city]').value,
        postal_code: form.querySelector('input[name=postal_code]').value,
        country,
      },
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Processing…';

    if (config.currency !== activeCurrency) {
      const response = await store.updatePaymentIntentCurrency(
        paymentIntent.id,
        activeCurrency,
        [payment]
      );

      if (response.error) {
        handleError(response);
        return;
      }
    }

    if (payment === 'card') {
      const response = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card,
            billing_details: {
              name,
              address: billingAddress,
            },
          },
          shipping,
        }
      );
      handlePayment(response);
    } else {
      const sourceData = {
        type: payment,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        owner: {
          name,
          email,
        },
        redirect: {
          return_url: `${window.location.href}?payment_intent=${paymentIntent.id}`,
        },
        statement_descriptor: 'Stripe Payments Demo',
        metadata: {
          paymentIntent: paymentIntent.id,
        },
      };

      switch (payment) {
        case 'sofort':
          sourceData.sofort = {
            country,
          };
          break;
        case 'ach_credit_transfer':
          sourceData.owner.email = `amount_${paymentIntent.amount}@example.com`;
          break;
      }

      const {source} = await stripe.createSource(sourceData);
      handleSourceActivation(source);
    }
  });

  if (url.searchParams.get('payment_intent')) {
    if (
      url.searchParams.get('source') &&
      url.searchParams.get('client_secret')
    ) {
      mainElement.classList.add('checkout', 'success', 'processing');
    }

    pollPaymentIntentStatus(url.searchParams.get('payment_intent'));
  } else {
    mainElement.classList.add('checkout');

    const response = await store.createPaymentIntent(
      config.currency,

      []
    );
    paymentIntent = response.paymentIntent;
  }
  document.getElementById('main').classList.remove('loading');

  for (let input of document.querySelectorAll('input[name=payment]')) {
    input.addEventListener('change', (event) => {
      event.preventDefault();
      const payment = form.querySelector('input[name=payment]:checked').value;
      const flow = paymentMethods[payment].flow;

      updateButtonLabel(event.target.value);

      form
        .querySelector('.payment-info.card')
        .classList.toggle('visible', payment === 'card');
      form
        .querySelector('.payment-info.ideal')
        .classList.toggle('visible', payment === 'ideal');
      form
        .querySelector('.payment-info.sepa_debit')
        .classList.toggle('visible', payment === 'sepa_debit');
      form
        .querySelector('.payment-info.wechat')
        .classList.toggle('visible', payment === 'wechat');
      form
        .querySelector('.payment-info.au_becs_debit')
        .classList.toggle('visible', payment === 'au_becs_debit');
      form
        .querySelector('.payment-info.redirect')
        .classList.toggle('visible', flow === 'redirect');
      form
        .querySelector('.payment-info.receiver')
        .classList.toggle('visible', flow === 'receiver');
      document
        .getElementById('card-errors')
        .classList.remove('visible', payment !== 'card');
    });
  }

  let countryParam = urlParams.get('country')
    ? urlParams.get('country').toUpperCase()
    : config.country;
  if (form.querySelector(`option[value="${countryParam}"]`)) {
    country = countryParam;
  }
  selectCountry(country);
})();
