const raceAPI = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/races.php";

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    displaySeasons(); // Call the function to set up the seasons and hide the browse section
});

// Function to display seasons and hide the browse section
function displaySeasons() {
    // Hide the browse article initially
    const browseArticle = document.getElementById('browse');
    browseArticle.style.display = 'none'; // Hide the browse section

    // Populate the seasons select element with years from 2020 to 2023
    const seasonsSelect = document.querySelector('#seasons select');

    // Create a placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = ''; // No value for the placeholder
    placeholderOption.textContent = 'Select a season'; // Placeholder text
    placeholderOption.disabled = true; // Disable the placeholder option
    placeholderOption.selected = true; // Make it selected by default
    seasonsSelect.appendChild(placeholderOption); // Append the placeholder option

    const startYear = 2020;
    const endYear = 2023;

    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year; // Set the value of the option
        option.textContent = year; // Set the display text of the option
        seasonsSelect.appendChild(option); // Append the option to the select element
    }

    // Add event listener to switch to browse view when a season is selected
    seasonsSelect.addEventListener('change', (event) => {
        const selectedSeason = event.target.value;
        if (selectedSeason) {
            loadOrFetchRaces(selectedSeason); // Call the new function to load or fetch races
            switchToBrowseView(); // Call function to switch to browse view
        }
    });
}

// Function to load races from localStorage or fetch from API
function loadOrFetchRaces(season) {
    const storedData = localStorage.getItem(`races_${season}`); // Check localStorage for existing data
    const loadingSpinner = document.querySelector('.spinner-border'); // Select the loading spinner

    if (storedData) {
        const data = JSON.parse(storedData); // Parse the stored JSON data
        populateRacesTable(data, season); // Populate the table with the loaded data
    } else {
        loadingSpinner.style.display = 'block'; // Show the loading spinner
        fetchRacesForSeason(season); // Fetch data from the API if not in localStorage
    }
}

// Function to fetch races for the selected season
function fetchRacesForSeason(season) {
    const url = `${raceAPI}?season=${season}`; // Construct the API URL with the selected season
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON from the response
        })
        .then(data => {
            localStorage.setItem(`races_${season}`, JSON.stringify(data)); // Store the fetched data in localStorage
            populateRacesTable(data, season); // Call the function to populate the table with race data
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        })
        .finally(() => {
            const loadingSpinner = document.querySelector('.spinner-border'); // Select the loading spinner
            loadingSpinner.style.display = 'none'; // Hide the loading spinner after fetching
        });
}

// Function to populate the races table with data
function populateRacesTable(data, season) {
    const racesTable = document.querySelector('#races table'); // Select the races table
    const raceHeading = document.getElementById('raceHeading'); // Select the h3 element for the heading
    racesTable.innerHTML = ''; // Clear any existing rows

    // Set the heading text to indicate the selected season
    raceHeading.textContent = `Races for Season ${season}`; // Update the heading with the selected season

    // Create table headers
    const headerRow = document.createElement('tr');
    const roundHeader = document.createElement('th');
    roundHeader.textContent = 'Round';
    const circuitHeader = document.createElement('th');
    circuitHeader.textContent = 'Circuit Name';
    headerRow.appendChild(roundHeader);
    headerRow.appendChild(circuitHeader);
    racesTable.appendChild(headerRow); // Append headers to the table

    // Populate the table with race data
    data.forEach(race => {
        const row = document.createElement('tr'); // Create a new row for each race
        const roundCell = document.createElement('td');
        roundCell.textContent = race.round; // Set the round number
        const circuitCell = document.createElement('td');
        circuitCell.textContent = race.circuit.name; // Set the circuit name
        row.appendChild(roundCell); // Append round cell to the row
        row.appendChild(circuitCell); // Append circuit cell to the row
        racesTable.appendChild(row); // Append the row to the table
    });
}

// Function to switch to browse view
function switchToBrowseView() {
    const homeArticle = document.querySelector('#home');
    const browseArticle = document.querySelector('#browse');
    homeArticle.style.display = 'none'; // Hide the home section
    browseArticle.style.display = 'block'; // Show the browse section
}