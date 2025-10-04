// New function to fetch worker's applications
async function fetchWorkerApplications() {
    try {
        const response = await fetch('/api/worker/applications'); 
        if (!response.ok) throw new Error('Failed to fetch applications.');
        return response.json();
    } catch (error) {
        console.error("Error fetching worker applications:", error);
        return [];
    }
}

// Load Dashboard Data (Applications and Mock Jobs)
async function loadDashboard() {
    const applicationsContainer = document.getElementById("applicationsList");
    const jobsList = document.getElementById("recommendedJobs");
    
    // 1. Load Worker's Applications
    if (applicationsContainer) {
        const applications = await fetchWorkerApplications();
        
        // Clear previous content
        applicationsContainer.innerHTML = '';

        if (applications.length === 0) {
            applicationsContainer.innerHTML = `
                <div class="empty-state" style="display: block; margin-top: 1.5rem;">
                    <h3>No Recent Applications</h3>
                    <p>Apply for a job to see its status here.</p>
                </div>
            `;
            // Ensure proper layout for the empty state
            applicationsContainer.style.display = 'block'; 
        } else {
            // Restore grid display if there are items
            applicationsContainer.style.display = 'grid'; 

            applications.forEach(app => {
                const card = document.createElement("div");
                card.classList.add("card");
                card.innerHTML = `
                    <h3>${app.jobTitle}</h3>
                    <p><strong>Location:</strong> ${app.jobLocation}</p>
                    <p><strong>Salary:</strong> ₹${app.jobSalary}</p>
                    <p class="status ${app.status.toLowerCase()}">${app.status.toUpperCase()}</p>
                `;
                applicationsContainer.appendChild(card);
            });

            // Update stats counts
            const appliedCount = applications.length;
            const acceptedCount = applications.filter(app => app.status.toLowerCase() === 'accepted').length;
            
            if (document.getElementById('appliedCount')) {
                document.getElementById('appliedCount').textContent = appliedCount;
            }
            if (document.getElementById('acceptedCount')) {
                document.getElementById('acceptedCount').textContent = acceptedCount;
            }
        }
    }

    // 2. Load Recommended Jobs (Mock Data Retained from previous code for now)
    const recommendedJobs = [
      { title: "Electrical Repair", location: "Bangalore", pay: "₹500/day" },
      { title: "Evening Babysitter", location: "Delhi", pay: "₹300/hr" },
      { title: "Cooking Help", location: "Chennai", pay: "₹400/day" }
    ];

    if (jobsList) {
        jobsList.innerHTML = '';
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
    }

}

// Apply Button Event (Retained mock alert for apply on recommended jobs)
document.addEventListener("click", e => {
  if (e.target.classList.contains("applyBtn")) {
    // In a real scenario, this button would trigger a redirect to /job-request/:jobId
    alert("Application submitted successfully! ✅ (Mock Apply on Recommended Job)");
  }
});

// Initialize the dashboard on load
loadDashboard();
