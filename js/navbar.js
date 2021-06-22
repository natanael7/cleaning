const elementSelector = ".nav-burger";
const attribute = "state";
const valueIfClosed = "closed";
const valueIfOpened = "opened";
const classIfOpened = "nav-burger__opened";

function changeNavState(state) {
  navButton.setAttribute(attribute, state);
}
function toggleClass(state) {
  if (state) {
    navButton.classList.add(classIfOpened);
    return;
  }
  navButton.classList.remove(classIfOpened);
}

function handleClosedNav() {
  changeNavState(valueIfOpened);
  toggleClass(1);
}
function handleOpenedNav() {
  changeNavState(valueIfClosed);
  toggleClass(0);
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

const navButton = document.querySelector(elementSelector);
navButton.addEventListener("click", handleNavClick);

