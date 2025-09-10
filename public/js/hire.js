const form = document.getElementById("jobForm");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  // Collect form data into an object
  const jobData = {
    title: document.getElementById("jobTitle").value,
    category: document.getElementById("jobCategory").value,
    location: document.getElementById("jobLocation").value,
    pay: document.getElementById("jobPay").value,
    description: document.getElementById("jobDescription").value,
    contactInfo: document.getElementById("contactInfo").value,
  };

  // Send the data to the backend API endpoint
  fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
  })
  .then(response => {
      if (!response.ok) {
          // If server responds with an error, throw it to the catch block
          return response.json().then(err => { throw new Error(err.error || 'Server error') });
      }
      return response.json();
  })
  .then(data => {
      alert('Job posted successfully!');
      form.reset(); // Clear the form
  })
  .catch(error => {
      console.error('Error posting job:', error);
      alert(`Failed to post job: ${error.message}`);
  });
});
