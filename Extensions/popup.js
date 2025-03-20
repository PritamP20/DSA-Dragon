// popup.js
document.getElementById("show-intuition").addEventListener("click", () => {
    fetch("https://your-rag-app.com/api/show_intuition")
    .then(response => response.json())
    .then(data => alert("Intuition: " + data.message));
});

document.getElementById("show-solution").addEventListener("click", () => {
    fetch("https://your-rag-app.com/api/show_solution")
    .then(response => response.json())
    .then(data => alert("Solution: " + data.message));
});
