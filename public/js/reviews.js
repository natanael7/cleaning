function slider(document) {
  const wrapper = document.querySelector('.slider-wrapper');
  const indicators = [
    ...document.querySelectorAll('.slider-indicators .slider-indicators__btn'),
  ];

  let currentSlide = 0; // Default 0

  indicators.forEach((item, i) => {
    item.addEventListener('click', () => {
      indicators[currentSlide].classList.remove('active');
      wrapper.style.marginLeft = `-${100 * i}%`;
      item.classList.add('active');
      currentSlide = i;
    });
  });
}

slider(document.getElementById('reviews'));
