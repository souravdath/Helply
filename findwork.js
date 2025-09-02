// findwork.js

// Dummy job data
const jobs = [
  {
    title: "Babysitter Needed",
    description: "Looking for a responsible babysitter for 2 kids in the evening.",
    category: "Babysitting",
    location: "Delhi",
    pay: 500
  },
  {
    title: "Math Tuition Teacher",
    description: "Require a tutor for 10th grade Mathematics.",
    category: "Tuition",
    location: "Mumbai",
    pay: 800
  },
  {
    title: "House Cleaning Help",
    description: "Need cleaning help for a 2BHK flat.",
    category: "Cleaning",
    location: "Bangalore",
    pay: 400
  },
  {
    title: "Electrician Required",
    description: "Fix wiring issue and install new fan.",
    category: "Electrical",
    location: "Chennai",
    pay: 1000
  }
];

// Get elements
const jobsContainer = document.getElementById("jobsContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const locationFilter = document.getElementById("locationFilter");
const jobModal = document.getElementById("jobModal");
const closeModal = document.querySelector(".close");

// Render jobs
function renderJobs(filteredJobs) {
  jobsContainer.innerHTML = "";

  if (filteredJobs.length === 0) {
    jobsContainer.innerHTML = "<p>No jobs found.</p>";
    return;
  }

  filteredJobs.forEach((job, index) => {
    const jobCard = document.createElement("div");
    jobCard.classList.add("job-card");
    jobCard.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.description.substring(0, 60)}...</p>
      <p><strong>Category:</strong> ${job.category}</p>
      <p><strong>Location:</strong> ${job.location}</p>
      <p><strong>Pay:</strong> ₹${job.pay}</p>
      <button onclick="openJobModal(${index})">View Details</button>
    `;
    jobsContainer.appendChild(jobCard);
  });
}

// Open job modal
function openJobModal(index) {
  const job = jobs[index];
  document.getElementById("jobTitle").innerText = job.title;
  document.getElementById("jobDescription").innerText = job.description;
  document.getElementById("jobCategory").innerText = job.category;
  document.getElementById("jobLocation").innerText = job.location;
  document.getElementById("jobPay").innerText = job.pay;
  jobModal.style.display = "block";
}

// Close modal
closeModal.onclick = () => {
  jobModal.style.display = "none";
};
window.onclick = (event) => {
  if (event.target === jobModal) {
    jobModal.style.display = "none";
  }
};

// Filtering logic
function filterJobs() {
  const searchText = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const location = locationFilter.value;

  const filtered = jobs.filter(job =>
    job.title.toLowerCase().includes(searchText) &&
    (category === "" || job.category === category) &&
    (location === "" || job.location === location)
  );

  renderJobs(filtered);
}

// Event listeners
searchInput.addEventListener("input", filterJobs);
categoryFilter.addEventListener("change", filterJobs);
locationFilter.addEventListener("change", filterJobs);

// Initial render
renderJobs(jobs);
