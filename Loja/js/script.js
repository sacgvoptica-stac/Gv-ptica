const slidesContainer = document.querySelector('.slides');
const slides = document.querySelectorAll('.slides img');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let currentIndex = 0;
const totalSlides = slides.length;

function showSlide(index) {
  slidesContainer.style.transform = `translateX(${-index * 100}%)`;
}

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % totalSlides;
  showSlide(currentIndex);
});

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  showSlide(currentIndex);
});

document.addEventListener('DOMContentLoaded', () => {
  if (totalSlides <= 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    return;
  }

  showSlide(currentIndex);
});

// Inicia no primeiro slide
showSlide(currentIndex);
