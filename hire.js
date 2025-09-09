const form = document.getElementById("jobForm");
const previewSection = document.getElementById("previewSection");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  // Collect form data
  const title = document.getElementById("jobTitle").value;
  const category = document.getElementById("jobCategory").value;
  const location = document.getElementById("jobLocation").value;
  const pay = document.getElementById("jobPay").value;
  const description = document.getElementById("jobDescription").value;
  const contact = document.getElementById("contactInfo").value;

  // Show preview
  document.getElementById("previewTitle").innerText = title;
  document.getElementById("previewCategory").innerText = category;
  document.getElementById("previewLocation").innerText = location;
  document.getElementById("previewPay").innerText = pay;
  document.getElementById("previewDescription").innerText = description;
  document.getElementById("previewContact").innerText = contact;

  previewSection.style.display = "block";

  // Reset form
  form.reset();
});
