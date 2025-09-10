// This array will be populated with data from the server
let jobs = [];

// Get DOM elements
const jobsContainer = document.getElementById("jobsContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const locationFilter = document.getElementById("locationFilter");
const jobModal = document.getElementById("jobModal");
const closeModal = document.querySelector(".close");
const applyBtn = document.getElementById("applyBtn");

// Render jobs to the page
function renderJobs(filteredJobs) {
  jobsContainer.innerHTML = "";
  if (filteredJobs.length === 0) {
    jobsContainer.innerHTML = "<p>No jobs found matching your criteria.</p>";
    return;
  }
  filteredJobs.forEach(job => {
    const jobCard = document.createElement("div");
    jobCard.classList.add("job-card");
    // Use job.id which is the Job_ID from the database
    jobCard.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.description.slice(0, 80)}...</p>
      <p><strong>Category:</strong> ${job.category}</p>
      <p><strong>Location:</strong> ${job.location}</p>
      <p><strong>Pay:</strong> ₹${job.pay}</p>
      <button onclick="openJobModal(${job.id})" aria-label="View details for ${job.title}">View Details</button>
    `;
    jobsContainer.appendChild(jobCard);
  });
}

// Find a specific job by its ID to show in the modal
function openJobModal(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (job) {
    document.getElementById("jobTitle").innerText = job.title;
    document.getElementById("jobDescription").innerText = job.description;
    document.getElementById("jobCategory").innerText = job.category;
    document.getElementById("jobLocation").innerText = job.location;
    document.getElementById("jobPay").innerText = job.pay;
    jobModal.style.display = "block";
  }
}

// Modal closing logic
closeModal.onclick = () => jobModal.style.display = "none";
window.onclick = (event) => {
  if (event.target === jobModal) {
    jobModal.style.display = "none";
  }
};

// Apply button action
applyBtn.onclick = () => {
  // Redirect to the detailed application page
  window.location.href = '/job-request';
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

// Event listeners for filters
searchInput.addEventListener("input", filterJobs);
categoryFilter.addEventListener("change", filterJobs);
locationFilter.addEventListener("change", filterJobs);

// Fetch jobs from the API when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/jobs')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            jobs = data; // Store fetched jobs in the global array
            renderJobs(jobs); // Initial render of all jobs
        })
        .catch(error => {
            console.error('Error fetching jobs:', error);
            jobsContainer.innerHTML = "<p>Could not load jobs. Please try again later.</p>";
        });
});
