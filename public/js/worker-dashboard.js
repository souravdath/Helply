// Mock Data for Demo
const applications = [
  { title: "Babysitting in Delhi", status: "pending" },
  { title: "Home Tutor - Maths", status: "accepted" },
  { title: "House Cleaning - Mumbai", status: "rejected" }
];

const recommendedJobs = [
  { title: "Electrical Repair", location: "Bangalore", pay: "₹500/day" },
  { title: "Evening Babysitter", location: "Delhi", pay: "₹300/hr" },
  { title: "Cooking Help", location: "Chennai", pay: "₹400/day" }
];

// Load Recent Applications
const applicationsList = document.getElementById("applicationsList");
applications.forEach(app => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <h3>${app.title}</h3>
    <p class="status ${app.status}">${app.status.toUpperCase()}</p>
  `;
  applicationsList.appendChild(card);
});

// Load Recommended Jobs
const jobsList = document.getElementById("recommendedJobs");
recommendedJobs.forEach(job => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <h3>${job.title}</h3>
    <p><strong>Location:</strong> ${job.location}</p>
    <p><strong>Pay:</strong> ${job.pay}</p>
    <button class="applyBtn">Apply</button>
  `;
  jobsList.appendChild(card);
});

// Apply Button Event
document.addEventListener("click", e => {
  if (e.target.classList.contains("applyBtn")) {
    alert("Application submitted successfully! ✅");
  }
});
