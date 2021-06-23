const burgerClass = "nav-burger";
const listClass = "nav-list";

const attribute = "state";

const valueIfClosed = "closed";
const valueIfOpened = "opened";

const modifierIfOpened = "__opened";

const classWithOpenModifier = (selector) => `${selector}${modifierIfOpened}`;

function changeState(state, element) {
  element.setAttribute(attribute, state);
}
function toggleClass(state, element, selector) {
  if (state) {
    element.classList.add(classWithOpenModifier(selector));
    return;
  }
  element.classList.remove(classWithOpenModifier(selector));
}

function handleClosedNav() {
  changeState(valueIfOpened, navButton);
  toggleClass(1, navButton, burgerClass);

  changeState(valueIfOpened, navList);
  toggleClass(1, navList, listClass);
}
function handleOpenedNav() {
  changeState(valueIfClosed, navButton);
  toggleClass(0, navButton, burgerClass);

  changeState(valueIfClosed, navList);
  toggleClass(0, navList, listClass);
}

function handleNavClick() {
  // State can be either 'closed' either 'opene'
  const state = navButton.getAttribute(attribute);

  if (state == valueIfClosed) {
    handleClosedNav();
    return;
  }

  if (state == valueIfOpened) {
    handleOpenedNav();
    return;
  }

  throw "Invalid NavBar State";
}

const navButton = document.querySelector(`.${burgerClass}`);
const navList = document.querySelector(`.${listClass}`);
navButton.addEventListener("click", handleNavClick);
