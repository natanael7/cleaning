const navClass = "nav";
const fixedClass = "nav-fixed";
const elementAfterNavSelector = ".nav + section";

const navBar = document.querySelector(`.${navClass}`);

function fixIt() {
  navBar.classList.add(fixedClass);
  document.querySelector(
    elementAfterNavSelector
  ).style.marginTop = `${navBar.offsetHeight}px`;
}
function unFixIt() {
  navBar.classList.remove(fixedClass);
  document.querySelector(elementAfterNavSelector).style.marginTop = "auto";
}

function handleScroll() {
  if (
    (document.documentElement.scrollTop || document.body.scrollTop) > navPos
  ) {
    fixIt();
    return;
  }
  unFixIt();
}
const navPos = navBar.offsetTop;
document.addEventListener("scroll", handleScroll);
