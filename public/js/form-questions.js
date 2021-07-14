const arrowSelector = ".form-collapsable__arrow";

const childFitHeightSelector = "h1";
const maxFitHeightSelector = "p";

const classClosed = "form-collapsable__closed";

const arrows = document.querySelectorAll(arrowSelector);
function getAbsoluteHeight(el) {
  // Get the DOM Node if you pass in a string
  el = typeof el === "string" ? document.querySelector(el) : el;

  var styles = window.getComputedStyle(el);
  var margin =
    parseFloat(styles["marginTop"]) + parseFloat(styles["marginBottom"]);

  return Math.ceil(el.offsetHeight + margin);
}

function elementIsClosed(element) {
  return element.classList.contains(classClosed);
}

function closedHeight(element) {
  const elementToFit = element.querySelector(childFitHeightSelector);
  const heightOfFit = elementToFit.offsetHeight;
  return `${heightOfFit}px`;
}
function openedHeight(element) {
  const height =
    getAbsoluteHeight(element.querySelector(childFitHeightSelector)) +
    getAbsoluteHeight(element.querySelector(maxFitHeightSelector));
  return `${height}px`;
}

function handleToClose(element) {
  element.classList.add(classClosed);
  element.style.height = closedHeight(element);
}
function handleToOpen(element) {
  element.classList.remove(classClosed);
  element.style.height = openedHeight(element);
}

function arrowHandler(element) {
  const parentId = element.target.parentElement.id;
  const parent = document.getElementById(parentId);

  if (elementIsClosed(parent)) {
    handleToOpen(parent);
    return;
  }
  handleToClose(parent);
}

for (let i = 0; i < arrows.length; i++) {
  // Give an initial height
  handleToClose(arrows[i].parentNode);

  // Add listeners
  arrows[i].addEventListener("click", arrowHandler);
}
