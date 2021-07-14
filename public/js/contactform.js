function contactForm() {
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

contactForm();
