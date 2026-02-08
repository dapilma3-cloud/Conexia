const navLinks = document.querySelectorAll(".nav-link");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchHint = document.getElementById("searchHint");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("is-active"));
    link.classList.add("is-active");
  });
});

const suggestions = [
  "Try \"quantum computing\" or \"genomics\".",
  "Looking for AI? Search \"machine learning\".",
  "Find ebooks like \"astrophysics\" or \"genetics\".",
];

function updateHint() {
  const value = searchInput.value.trim();
  if (value.length === 0) {
    searchHint.textContent = suggestions[Math.floor(Math.random() * suggestions.length)];
    return;
  }
  searchHint.textContent = `Searching for “${value}”...`;
}

searchInput.addEventListener("input", updateHint);
searchButton.addEventListener("click", () => {
  updateHint();
  searchButton.classList.add("pulse");
  setTimeout(() => searchButton.classList.remove("pulse"), 400);
});
