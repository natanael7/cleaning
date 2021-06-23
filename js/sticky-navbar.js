const navClass = "nav";
const fixedClass = "nav-fixed";

const navBar = document.querySelector(`.${navClass}`);

function fixIt() {
  navBar.classList.add(fixedClass);
  document.querySelector(".hero").style.marginTop = `${navBar.offsetHeight}px`;
}
function unFixIt() {
  navBar.classList.remove(fixedClass);
  document.querySelector(".hero").style.marginTop = "auto";
}

function handleScroll() {
  if (
    (document.documentElement.scrollTop || document.body.scrollTop) >
    navBar.offsetTop
  ) {
    fixIt();
    return;
  }
  unFixIt();
}

document.addEventListener("scroll", handleScroll);
