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

// Initialize
showTestimonial(currentIndex);
