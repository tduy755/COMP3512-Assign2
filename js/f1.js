const raceAPI = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/races.php";
const resultAPI =
  "https://www.randyconnolly.com/funwebdev/3rd/api/f1/results.php";
const qualifyingAPI =
  "https://www.randyconnolly.com/funwebdev/3rd/api/f1/qualifying.php";

let resultsButtonClicked = false;

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
  displaySeasons(); // Call the function to set up the seasons and hide the browse section
});

// Function to display seasons and hide the browse section
function displaySeasons() {
  // Hide the browse article initially
  const browseArticle = document.getElementById("browse");
  browseArticle.style.display = "none"; // Hide the browse section

  // Populate the seasons select element with years from 2020 to 2023
  const seasonsSelect = document.querySelector("#seasons select");
  const raceResultDialog = document.querySelector("#raceResultDialog");
  const closeDialogButton = document.querySelector("#closeDialog");

  // Create a placeholder option
  const placeholderOption = document.createElement("option");
  placeholderOption.value = ""; // No value for the placeholder
  placeholderOption.textContent = "Select a season"; // Placeholder text
  placeholderOption.disabled = true; // Disable the placeholder option
  placeholderOption.selected = true; // Make it selected by default
  seasonsSelect.appendChild(placeholderOption); // Append the placeholder option

  const startYear = 2020;
  const endYear = 2023;

  for (let year = startYear; year <= endYear; year++) {
    const option = document.createElement("option");
    option.value = year; // Set the value of the option
    option.textContent = year; // Set the display text of the option
    seasonsSelect.appendChild(option); // Append the option to the select element
  }

  // Add event listener to switch to browse view when a season is selected
  seasonsSelect.addEventListener("change", (event) => {
    const selectedSeason = event.target.value;
    if (selectedSeason) {
      loadOrFetchRaces(selectedSeason); // Call the new function to load or fetch races
      switchToBrowseView(); // Call function to switch to browse view

      // Show the dialog after switching to browse view
      setTimeout(() => {
        raceResultDialog.showModal(); // Show the dialog
      }, 10); // Delay to ensure the view has switched
    }
  });

  // Close the dialog when the button is clicked
  closeDialogButton.addEventListener("click", () => {
    raceResultDialog.close();
  });
}

// Function to load races from localStorage or fetch from API
function loadOrFetchRaces(season) {
  const storedData = localStorage.getItem(`races_${season}`); // Check localStorage for existing data
  const loadingSpinner = document.querySelector(".spinner-border"); // Select the loading spinner

  if (storedData) {
    const data = JSON.parse(storedData); // Parse the stored JSON data
    populateRacesTable(data, season); // Populate the table with the loaded data
  } else {
    loadingSpinner.style.display = "block"; // Show the loading spinner
    fetchRacesForSeason(season); // Fetch data from the API if not in localStorage
  }
}

// Function to fetch races for the selected season
function fetchRacesForSeason(season) {
  const url = `${raceAPI}?season=${season}`; // Construct the API URL with the selected season
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Parse the JSON from the response
    })
    .then((data) => {
      localStorage.setItem(`races_${season}`, JSON.stringify(data)); // Store the fetched data in localStorage
      populateRacesTable(data, season); // Call the function to populate the table with race data
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    })
    .finally(() => {
      const loadingSpinner = document.querySelector(".spinner-border"); // Select the loading spinner
      loadingSpinner.style.display = "none"; // Hide the loading spinner after fetching
    });
}

// Function to populate the races table with data
function populateRacesTable(data, season) {
  const racesTable = document.querySelector("#races table"); // Select the races table
  const raceHeading = document.querySelector("#raceHeading"); // Select the h3 element for the heading
  racesTable.innerHTML = ""; // Clear any existing rows

  // Set the heading text to indicate the selected season
  raceHeading.textContent = `${season} Races`; // Update the heading with the selected season

  // Create table headers
  const headerRow = document.createElement("tr");
  const roundHeader = document.createElement("th");
  roundHeader.textContent = "Round";
  const circuitHeader = document.createElement("th");
  circuitHeader.textContent = "Circuit Name";
  const resultHeader = document.createElement("th"); // New header for results
  resultHeader.textContent = "Results"; // Header text for results
  headerRow.appendChild(roundHeader);
  headerRow.appendChild(circuitHeader);
  headerRow.appendChild(resultHeader); // Append results header
  racesTable.appendChild(headerRow); // Append headers to the table

  // Populate the table with race data
  data.forEach((race) => {
    const row = document.createElement("tr"); // Create a new row for each race
    const roundCell = document.createElement("td");
    roundCell.textContent = race.round; // Set the round number
    const circuitCell = document.createElement("td");
    circuitCell.textContent = race.circuit.name; // Set the circuit name

    // Create a button for results
    const resultCell = document.createElement("td"); // New cell for the result button
    const resultButton = document.createElement("button"); // Create button element
    resultButton.textContent = "Results"; // Button text
    resultButton.onclick = () => {
      resultsButtonClicked = true; // Set to true when the button is clicked
      displayRaceResults(race); // Call the function to display results for the selected race
    };
    resultCell.appendChild(resultButton); // Append button to the result cell
    row.appendChild(roundCell); // Append round cell to the row
    row.appendChild(circuitCell); // Append circuit cell to the row
    row.appendChild(resultCell); // Append result cell to the row
    racesTable.appendChild(row); // Append the row to the table
  });
}

// Function to display race results
function displayRaceResults(race) {
  const raceInfoTable = document.querySelector("#raceInfo table tbody"); // Select tbody
  raceInfoTable.innerHTML = ""; // Clear existing content
  console.log(race);

  const raceRow = document.createElement("tr");

  // Create cells for each required detail
  const raceNameCell = document.createElement("td");
  raceNameCell.textContent = race.name; // Race Name
  const roundCell = document.createElement("td");
  roundCell.textContent = race.round; // Round Number
  const yearCell = document.createElement("td");
  yearCell.textContent = race.year; // Year
  const circuitNameCell = document.createElement("td");
  circuitNameCell.textContent = race.circuit.name; // Circuit Name
  const dateCell = document.createElement("td");
  dateCell.textContent = race.date; // Date
  const urlCell = document.createElement("td");
  const urlLink = document.createElement("a");
  urlLink.href = race.url; // Assuming race.url contains the URL
  urlLink.textContent = "Link"; // Link text
  urlLink.target = "_blank"; // Open in a new tab
  urlCell.appendChild(urlLink); // Append link to the URL cell

  // Append all cells to the row
  raceRow.appendChild(raceNameCell);
  raceRow.appendChild(roundCell);
  raceRow.appendChild(yearCell);
  raceRow.appendChild(circuitNameCell);
  raceRow.appendChild(dateCell);
  raceRow.appendChild(urlCell);

  // Append the row to the tbody
  raceInfoTable.appendChild(raceRow);
}

// Function to switch to browse view
function switchToBrowseView() {
  const homeArticle = document.querySelector("#home");
  const browseArticle = document.querySelector("#browse");
  homeArticle.style.display = "none"; // Hide the home section
  browseArticle.style.display = "block"; // Show the browse section

  console.log("Switched to browse view");
}

// Function to check if the button has been clicked
function checkResults() {
  if (!resultsButtonClicked) {
    alert("Please click the 'Results' button to view race data.");
  } else {
    // Proceed with displaying results or any other action
  }
}
