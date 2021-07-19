function toggleForm() {
  const contactButtonClass = 'contact-button';
  const closeContactButtonClass = 'sidecontact-close';
  const sideContactClass = 'sidecontact';
  const overlayClass = 'overlay';

  const contactButtons =
    document.getElementsByClassName(contactButtonClass) || [];
  const closeContactButton = document.querySelector(
    `.${closeContactButtonClass}`
  );
  const sideContact = document.querySelector(`.${sideContactClass}`);
  const overlay = document.querySelector(`.${overlayClass}`);

  const attribute = 'state';

  const valueIfClosed = 'closed';
  const valueIfOpened = 'opened';

  const modifierIfOpened = '-active';

  function closeContactForm() {
    sideContact.classList.remove(`${sideContactClass}${modifierIfOpened}`);
    overlay.classList.remove(`${overlayClass}${modifierIfOpened}`);

    sideContact.setAttribute(attribute, valueIfClosed);
    overlay.setAttribute(attribute, valueIfClosed);
  }
  function openContactForm() {
    sideContact.classList.add(`${sideContactClass}${modifierIfOpened}`);
    overlay.classList.add(`${overlayClass}${modifierIfOpened}`);

    sideContact.setAttribute(attribute, valueIfOpened);
    overlay.setAttribute(attribute, valueIfOpened);
  }

  closeContactButton.addEventListener('click', closeContactForm);
  for (let i = 0; i < contactButtons.length; i++)
    contactButtons[i].addEventListener('click', openContactForm);
}
function sendForm() {
  const formClass = 'sidecontact-form';
  const form = document.querySelector(`.${formClass}`);
  const loaderClass = 'sidecontact-loader';
  const loader = document.querySelector(`.${loaderClass}`);
  const successClass = 'sidecontact-result__success';
  const success = document.querySelector(`.${successClass}`);
  const rejectClass = 'sidecontact-result__reject';
  const reject = document.querySelector(`.${rejectClass}`);
  const resultClass = 'sidecontact-result';
  const result = document.querySelector(`.${resultClass}`);
  function displayResult() {
    result.style.display = 'flex';
  }
  function hideResult() {
    result.style.display = 'none';
  }
  function displayLoader() {
    loader.style.display = 'block';
  }
  function hideLoader() {
    loader.style.display = 'none';
  }
  function displaySuccess() {
    success.style.display = 'flex';
    setTimeout(() => {
      hideResult();
      success.style.display = 'none';
    }, 5000);
  }
  function displayReject() {
    reject.style.display = 'flex';
    setTimeout(() => {
      hideResult();
      reject.style.display = 'none';
    }, 5000);
  }
  async function submitHandler(event) {
    const name = form.querySelector('input[name="name"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const phone = form.querySelector('input[name="phone"]').value;
    const message = form.querySelector('textarea').value || null;
    const subject = 'Conatct Us Request';
    const text = `Name:${name}
Email:${email}
Phone:${phone}
Message:${message}`;

    event.preventDefault();
    displayResult();
    displayLoader();
    try {
      const response = await fetch(
        `/send_email?subject=${subject}&text=${text}`,
        {
          method: 'POST',
        }
      );
      hideLoader();
      if (response.status != 200) throw '';
      displaySuccess();
    } catch (err) {
      hideLoader();
      displayReject();
    }
  }
  form.addEventListener('submit', submitHandler);
}
toggleForm();
sendForm();
