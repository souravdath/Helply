// Mock Data
const jobs = [
  { 
    title: "House Cleaning Help", 
    location: "Mumbai", 
    status: "Open", 
    description: "Looking for someone reliable to help with daily cleaning tasks for a family of 4. Approx 3-4 hours/day." 
  },
  { 
    title: "Math Tutor", 
    location: "Delhi", 
    status: "Closed", 
    description: "Need an experienced math tutor for class 10 student. Evening classes, 1 hour daily." 
  },
  { 
    title: "Electrician Needed", 
    location: "Chennai", 
    status: "Open", 
    description: "Require electrician for fixing wiring and maintenance work. One-day urgent job." 
  }
];

const applications = [
  { worker: "Rahul Sharma", job: "House Cleaning Help", status: "pending" },
  { worker: "Sneha Patel", job: "Math Tutor", status: "accepted" },
  { worker: "Arjun Mehta", job: "Electrician Needed", status: "pending" }
];

// Load Job Postings
const jobList = document.getElementById("jobList");
jobs.forEach((job, index) => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <h3>${job.title}</h3>
    <p><strong>Location:</strong> ${job.location}</p>
    <p><strong>Status:</strong> ${job.status}</p>
    <button class="viewBtn" data-index="${index}">View Details</button>
  `;
  jobList.appendChild(card);
});

// Load Applications
const applicationsList = document.getElementById("applicationsList");
applications.forEach((app, index) => {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <h3>${app.worker}</h3>
    <p><strong>Applied for:</strong> ${app.job}</p>
    <p class="status ${app.status}">${app.status.toUpperCase()}</p>
    <button class="manageBtn" data-index="${index}">Manage</button>
  `;
  applicationsList.appendChild(card);
});

// Job Modal
const jobModal = document.getElementById("jobModal");
const manageModal = document.getElementById("manageModal");
const closeBtns = document.querySelectorAll(".close");

document.addEventListener("click", e => {
  // Open Job Modal
  if (e.target.classList.contains("viewBtn")) {
    const jobIndex = e.target.getAttribute("data-index");
    const job = jobs[jobIndex];

    document.getElementById("modalTitle").innerText = job.title;
    document.getElementById("modalLocation").innerText = job.location;
    document.getElementById("modalStatus").innerText = job.status;
    document.getElementById("modalDescription").innerText = job.description;

    jobModal.style.display = "block";
  }

  // Open Manage Modal
  if (e.target.classList.contains("manageBtn")) {
    const appIndex = e.target.getAttribute("data-index");
    const app = applications[appIndex];

    document.getElementById("applicantName").innerText = app.worker;
    document.getElementById("appliedJob").innerText = app.job;
    document.getElementById("applicationStatus").innerText = app.status;

    manageModal.style.display = "block";

    // Handle Accept/Reject
    document.getElementById("acceptBtn").onclick = () => {
      app.status = "accepted";
      alert(`${app.worker}'s application has been accepted.`);
      manageModal.style.display = "none";
      location.reload(); // refresh UI
    };
    document.getElementById("rejectBtn").onclick = () => {
      app.status = "rejected";
      alert(`${app.worker}'s application has been rejected.`);
      manageModal.style.display = "none";
      location.reload(); // refresh UI
    };
  }

  // Close Modals
  if ([...closeBtns].includes(e.target) || e.target === jobModal || e.target === manageModal) {
    jobModal.style.display = "none";
    manageModal.style.display = "none";
  }
});
