// Testimonials data
const testimonials = [
  {
    text: "Helply helped me find a reliable babysitter within hours. The process was super easy!",
    author: "Neha Kapoor, Delhi"
  },
  {
    text: "As a tutor, I quickly found students near my home. This platform is a game-changer!",
    author: "Rohit Sharma, Mumbai"
  },
  {
    text: "I posted a cleaning job and got responses instantly. Very smooth experience.",
    author: "Anjali Singh, Bangalore"
  }
];

let currentTestimonial = 0;
const container = document.getElementById("testimonialContainer");

// Function to render testimonial
function showTestimonial(index) {
  container.style.opacity = 0;
  setTimeout(() => {
    container.innerHTML = `
      <p class="testimonial">"${testimonials[index].text}"</p>
      <p class="testimonial-author">- ${testimonials[index].author}</p>
    `;
    container.style.opacity = 1;
  }, 500);
}

// Auto-rotate every 4 seconds
setInterval(() => {
  currentTestimonial = (currentTestimonial + 1) % testimonials.length;
  showTestimonial(currentTestimonial);
}, 4000);

// Initial load
showTestimonial(currentTestimonial);
