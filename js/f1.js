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
            switchToBrowseView(); // Call function to switch to browse view
        }
    });
}

// Function to switch to browse view
function switchToBrowseView() {
    const homeArticle = document.getElementById('home');
    const browseArticle = document.getElementById('browse');

    homeArticle.style.display = 'none'; // Hide the home section
    browseArticle.style.display = 'block'; // Show the browse section
}