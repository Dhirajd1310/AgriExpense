let currentCrop = "";
const cropData = {};
let cropBudgets = {};
let chart;

const startApp = () => {
  document.getElementById("landing").style.display = "none";
  document.getElementById("app").style.display = "block";
};

// Go Back to Homepage
function goBack() {
  document.getElementById("app").style.display = "none";
  document.getElementById("landing").style.display = "block";
}

// Crop Management
const cropForm = document.getElementById("crop-form");
cropForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const cropName = document.getElementById("crop-name").value.trim();
  if (cropName && !cropData[cropName]) {
    cropData[cropName] = [];
    const btn = document.createElement("button");
    btn.textContent = cropName;
    btn.onclick = () => selectCrop(cropName);
    document.getElementById("crop-list").appendChild(btn);
    document.getElementById("crop-name").value = "";
  }
});

function selectCrop(name) {
  currentCrop = name;
  document.getElementById("tracker").style.display = "block";
  document.getElementById("expense-history").style.display = "block";
  document.getElementById("chart-section").style.display = "block";
  document.getElementById("current-crop").textContent = name;
  document.getElementById("crop-budget").style.display = "block";
  renderHistory();
  renderChart();
  updateBudget();
}

// Set Budget
const budgetForm = document.getElementById("budget-form");
budgetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const budget = parseFloat(document.getElementById("crop-budget-input").value);
  if (budget >= 0) {
    cropBudgets[currentCrop] = budget;
    updateBudget();
  }
});

function updateBudget() {
  const totalExpenses = cropData[currentCrop].reduce((sum, { amount }) => sum + amount, 0);
  const budget = cropBudgets[currentCrop];
  const progress = (totalExpenses / budget) * 100;
  
  document.getElementById("budget-fill").style.width = progress + "%";
  
  if (totalExpenses > budget) {
    document.getElementById("budget-status").textContent = "Budget Limit Exceeded!";
    document.getElementById("budget-status").classList.add("warning");
  } else {
    document.getElementById("budget-status").textContent = `Budget Left: ₹${(budget - totalExpenses).toFixed(2)}`;
    document.getElementById("budget-status").classList.remove("warning");
    document.getElementById("budget-status").classList.add("normal");
  }
}

// Add Expense
const expenseForm = document.getElementById("expense-form");
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  if (currentCrop && amount && date) {
    cropData[currentCrop].push({ category, amount, date });
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
    renderHistory();
    renderChart();
    updateBudget();
  }
});

// Render History
function renderHistory() {
  const list = document.getElementById("expense-list");
  list.innerHTML = "";
  cropData[currentCrop].forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.date} - ₹${entry.amount} (${entry.category})`;
    list.appendChild(item);
  });
}

// Render Chart
function renderChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const summary = {};
  cropData[currentCrop].forEach(({ category, amount }) => {
    summary[category] = (summary[category] || 0) + amount;
  });

  const labels = Object.keys(summary);
  const data = Object.values(summary);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#e67e22', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'],
      }]
    }
  });
}

// Export to CSV
document.getElementById("export-csv").addEventListener("click", () => {
  const expenses = cropData[currentCrop];
  let csv = "Date,Amount,Category\n";
  expenses.forEach((entry) => {
    csv += `${entry.date},${entry.amount},${entry.category}\n`;
  });

  const link = document.createElement("a");
  link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  link.download = `${currentCrop}_expenses.csv`;
  link.click();
});
