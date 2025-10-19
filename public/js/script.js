let testimonials = document.querySelectorAll(".testimonial");
let currentIndex = 0;

function showTestimonial(index) {
  testimonials.forEach((t, i) => {
    t.style.display = i === index ? "block" : "none";
  });
}

function nextTestimonial() {
  currentIndex = (currentIndex + 1) % testimonials.length;
  showTestimonial(currentIndex);
}

function searchService() {
  let query = document.getElementById("search").value.trim();
  if (query) {
    alert("Searching for: " + query);
  } else {
    alert("Please enter a service to search.");
  }
}

// Initialize first testimonial
showTestimonial(currentIndex);

// Auto change every 4 seconds
setInterval(nextTestimonial, 4000);

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('header nav');

menuToggle.addEventListener('click', () => {
  nav.classList.toggle('active');
});

document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".testimonial-track");
    const slides = document.querySelectorAll(".testimonial-slide");
    const dots = document.querySelectorAll(".slider-dot");
    let currentIndex = 0;

    function goToSlide(index) {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(dot => dot.classList.remove("active"));
        dots[index].classList.add("active");
        currentIndex = index;
    }

    function nextSlide() {
        let nextIndex = (currentIndex + 1) % slides.length;
        goToSlide(nextIndex);
    }

    // Auto slide every 5 seconds
    let autoSlide = setInterval(nextSlide, 5000);

    // Optional: allow clicking on dots
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            clearInterval(autoSlide);
            goToSlide(index);
            autoSlide = setInterval(nextSlide, 5000);
        });
    });

    // Initialize
    goToSlide(0);
});