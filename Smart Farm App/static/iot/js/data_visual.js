// Define base URL for the backend API
const API_BASE_URL = "http://127.0.0.1:5000"; // Replace with your backend URL

let dataChart = null; // Store Chart.js instance

/**
 * Fetch data from the server and update the display.
 * @param {string} parameter - The type of data to fetch (e.g., 'temperature', 'humidity').
 */
async function fetchData(parameter) {
  try {
    const response = await fetch(`${API_BASE_URL}/data_retrieval?parameter=${parameter}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`, // Optional JWT Token
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const serverData = await response.json();

    // Extract the specific parameter data
    const selectedData = serverData.data.find(item => item.parameter === parameter);

    if (selectedData) {
      updateDisplay(parameter, selectedData);
    } else {
      alert(`No data available for ${parameter}.`);
      updateDisplay(parameter, null); // Clear UI
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Failed to fetch data. Please try again later.");
  }
}

/**
 * Update the UI with fetched data.
 * @param {string} parameter - The parameter type (e.g., 'temperature').
 * @param {Object|null} selectedData - Data object for the parameter or null to clear UI.
 */
function updateDisplay(parameter, selectedData) {
  const currentStatsElement = document.getElementById("current-stats");
  const tableBody = document.getElementById("data-table-body");
  const alertMessageElement = document.getElementById("alert-message");

  if (!selectedData) {
    currentStatsElement.textContent = `No data available for ${parameter}.`;
    tableBody.innerHTML = "";
    alertMessageElement.textContent = "";
    if (dataChart) dataChart.destroy(); // Clear the chart if it exists
    return;
  }

  const threshold = 30; // Replace with the actual threshold value for alerts

  // Update the current stats display
  currentStatsElement.innerHTML = `
    Current ${parameter.charAt(0).toUpperCase() + parameter.slice(1)}: 
    ${selectedData.value} ${selectedData.unit}
  `;

  // Clear any existing alert message
  alertMessageElement.textContent = "";

  // Populate the data table (only latest data for now)
  tableBody.innerHTML = ""; // Clear existing data
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${new Date().toLocaleString()}</td>
    <td class="${selectedData.value > threshold ? "table-danger" : ""}">
      ${selectedData.value} ${selectedData.unit}
    </td>
  `;
  tableBody.appendChild(row);

  // Show alert if the value exceeds the threshold
  if (selectedData.value > threshold) {
    alertMessageElement.textContent = 
      `Warning: ${parameter.charAt(0).toUpperCase() + parameter.slice(1)} exceeded safe threshold!`;
  }

  // Update the chart
  updateChart(parameter, selectedData);
}

/**
 * Create or update the Chart.js chart.
 * @param {string} parameter - The parameter type (e.g., 'temperature').
 * @param {Object} selectedData - Data object for the parameter.
 */
function updateChart(parameter, selectedData) {
  const ctx = document.getElementById("dataChart").getContext("2d");

  if (dataChart) {
    dataChart.destroy(); // Destroy the previous chart instance
  }

  // Generate fake labels and data if historical data is unavailable
  const fakeLabels = ["10:00", "10:05", "10:10"]; // Example timestamps
  const fakeData = [25, 27, parseFloat(selectedData.value)]; // Example values

  const threshold = 30; // Replace with actual threshold

  dataChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: fakeLabels,
      datasets: [
        {
          label: `${parameter.charAt(0).toUpperCase() + parameter.slice(1)} (${selectedData.unit})`,
          data: fakeData,
          borderColor: "rgba(0, 123, 255, 1)",
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          fill: true,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        annotation: {
          annotations: [
            {
              type: "line",
              yMin: threshold,
              yMax: threshold,
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 2,
              label: {
                display: true,
                content: "Threshold",
                position: "end",
              },
            },
          ],
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: `${parameter.charAt(0).toUpperCase() + parameter.slice(1)} (${selectedData.unit})`,
          },
        },
      },
    },
  });
}

/**
 * Show data for a specific parameter by calling fetchData.
 * @param {string} parameter - The type of data to display (e.g., 'temperature', 'humidity').
 */
function showData(parameter) {
  fetchData(parameter);
}

// Functions for interactive controls
function adjustTemperature(delta) {
  alert("Adjusting temperature is a manual feature in this version.");
}

function toggleLight() {
  alert("Toggling light...");
}

function adjustFan() {
  alert("Adjusting fan settings...");
}

function waterPlant() {
  alert("Watering plant...");
}

// Hide notifications
function hideNotification() {
  document.getElementById("notification-count").style.display = "none";
}

// Initialize with temperature data
window.onload = function () {
  showData("temperature"); // Default fetch for temperature on page load
};
