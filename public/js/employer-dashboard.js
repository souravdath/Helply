// New function to fetch all job postings for the employer
async function fetchJobs() {
    try {
        const response = await fetch('/api/myjobs'); // Assuming your partner will make a GET /api/myjobs for all of the employer's jobs
        if (!response.ok) throw new Error('Failed to fetch jobs posted.');
        return response.json();
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return [];
    }
}

// New function to fetch applications for the employer's jobs
async function fetchApplications() {
    try {
        const response = await fetch('/api/employer/applications');
        if (!response.ok) throw new Error('Failed to fetch applications.');
        return response.json();
    } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
    }
}

// Function to handle the ACCEPT/REJECT status change
async function updateApplicationStatus(appId, status) {
    try {
        const response = await fetch(`/api/applications/${appId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(`Error: ${result.error || 'Could not update status.'}`);
            return false;
        }

        if (result.status === 'accepted') {
            const contactInfo = result.contact.employerContact || 'Not Provided';
            const employerName = result.contact.employerName || 'Employer';
            
            // MANDATORY: Show the contact info to the employer
            alert(`Application Accepted! The worker will be notified with your contact details: ${contactInfo}`);
        } else {
            alert(result.message);
        }

        // Reload the UI to reflect the status change
        location.reload(); 
        return true;

    } catch (error) {
        console.error('Error updating status:', error);
        alert('An unexpected error occurred. Please try again.');
        return false;
    }
}


// Load Applications (Updated to use fetch)
async function loadDashboard() {
    const applicationsList = document.getElementById("applicationsList");
    const applications = await fetchApplications();

    if (applications.length === 0) {
        applicationsList.innerHTML = `
            <div class="empty-state">
                <h3>No Applications Yet</h3>
                <p>Applications will appear here when candidates apply to your jobs.</p>
            </div>
        `;
    } else {
        // Clear previous content
        applicationsList.innerHTML = ''; 
        
        applications.forEach(app => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <h3>${app.workerName}</h3>
                <p><strong>Applied for:</strong> ${app.jobTitle}</p>
                <p class="status ${app.status}">${app.status.toUpperCase()}</p>
                <button class="manageBtn" data-appid="${app.id}">Manage</button> 
            `;
            applicationsList.appendChild(card);
        });
        
        // Update stats count
        const pendingCount = applications.filter(app => app.status === 'pending').length;
        const totalReceived = applications.length;
        document.getElementById('pendingApplications').textContent = pendingCount;
        document.getElementById('applicationsReceived').textContent = totalReceived;
    }
}

// Initialize the dashboard
loadDashboard();

// Job Modal and Manage Modal logic
const jobModal = document.getElementById("jobModal");
const manageModal = document.getElementById("manageModal");
const closeBtns = document.querySelectorAll(".close");

document.addEventListener("click", e => {
    // Open Manage Modal
    if (e.target.classList.contains("manageBtn")) {
        // Get the actual application ID from the button
        const appId = e.target.getAttribute("data-appid"); 
        
        // Find the application object from the loaded list (we'll refetch for simplicity)
        fetch('/api/employer/applications') 
            .then(res => res.json())
            .then(applications => {
                const app = applications.find(a => a.id == appId);
                if (!app) return alert('Application not found.');
                
                // Populate Modal with worker and job details
                document.getElementById("applicantName").innerText = app.workerName;
                document.getElementById("appliedJob").innerText = app.jobTitle;
                document.getElementById("applicationStatus").innerText = app.status.toUpperCase();
                document.getElementById("workerPhone").innerText = app.workerPhone || 'Not Provided';
                
                manageModal.style.display = "block";

                // Handle Accept/Reject using the new API function
                document.getElementById("acceptBtn").onclick = () => {
                    updateApplicationStatus(appId, 'accepted');
                };
                document.getElementById("rejectBtn").onclick = () => {
                    updateApplicationStatus(appId, 'rejected');
                };
            })
            .catch(error => {
                console.error("Error finding application:", error);
                alert("Failed to load application details.");
            });
    }

    // Close Modals
    if ([...closeBtns].includes(e.target) || e.target === jobModal || e.target === manageModal) {
        jobModal.style.display = "none";
        manageModal.style.display = "none";
    }
});
