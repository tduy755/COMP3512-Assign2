const raceAPI = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/races.php";
const resultAPI =
  "https://www.randyconnolly.com/funwebdev/3rd/api/f1/results.php";
const qualifyingAPI =
  "https://www.randyconnolly.com/funwebdev/3rd/api/f1/qualifying.php";

let resultsButtonClicked = false;

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
  displaySeasons(); // Call the function to set up the seasons and hide the browse section

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
        }, 300); // Delay to ensure the view has switched
      }
    });

    // Close the dialog when the button is clicked
    closeDialogButton.addEventListener("click", () => {
      raceResultDialog.close();
    });
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

  function fetchQualifyingForRace(season, raceId) {
    const storedData = localStorage.getItem(`qualifying_${season}`);
    const loadingSpinner = document.querySelector("#qualifyingSpinner"); // Select the qualifying spinner

    // Show the loading spinner if data is not in local storage
    if (!storedData) {
      loadingSpinner.style.display = "block"; // Show the spinner

      const url = `${qualifyingAPI}?season=${season}`; // Construct the API URL
      console.log("Fetching qualifying data for season:", season);

      return fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json(); // Parse the JSON from the response
        })
        .then((data) => {
          if (!data || data.length === 0) {
            console.warn("No qualifying data available for season", season);
            return;
          }

          // Store the entire season's qualifying data in local storage
          localStorage.setItem(`qualifying_${season}`, JSON.stringify(data));

          // Filter qualifying data for the specific race
          const qualifyingForRace = data.filter(
            (qualifying) => qualifying.race.id === raceId
          );

          if (qualifyingForRace.length === 0) {
            console.warn("No qualifying data found for race ID:", raceId);
          } else {
            displayQualifyingTable(qualifyingForRace); // Display the filtered data
          }
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        })
        .finally(() => {
          loadingSpinner.style.display = "none"; // Hide the loading spinner when done
        });
    } else {
      // If data is found in local storage, parse and display it
      const data = JSON.parse(storedData);

      // Filter the stored data for the specific race
      const qualifyingForRace = data.filter(
        (qualifying) => qualifying.race.id === raceId
      );

      displayQualifyingTable(qualifyingForRace); // Display cached data
    }
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
        displayRaceInfo(race); // Call the function to display results for the selected race

        // Fetch and display qualifying data for this specific race
        const season = race.year; // Assuming `race.year` contains the season
        const raceId = race.id; // Use the unique race ID to filter qualifying data
        fetchQualifyingForRace(season, raceId);
      };
      resultCell.appendChild(resultButton); // Append button to the result cell
      row.appendChild(roundCell); // Append round cell to the row
      row.appendChild(circuitCell); // Append circuit cell to the row
      row.appendChild(resultCell); // Append result cell to the row
      racesTable.appendChild(row); // Append the row to the table
    });
  }

  // Function to display race results
  function displayRaceInfo(race) {
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

  function displayQualifyingTable(qualifying) {
    const table = document.querySelector("#qualifying table");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    // Store the original data for reference
    tbody.dataset.originalData = JSON.stringify(qualifying);

    // Add click event listeners to table headers
    thead.querySelectorAll("th").forEach((th) => {
      th.addEventListener("click", () => {
        const column = th.getAttribute("data-column"); // Get the column identifier from data-column attribute
        sortTable(column); // Call sortTable with the correct column identifier
      });
    });

    // Render the initial table
    renderQualifyingTable(qualifying);
  }

  function renderQualifyingTable(data) {
    const tbody = document.querySelector("#qualifying table tbody");
    const closeBtnDriver = document.querySelector("#closeDriverDialog");
    tbody.innerHTML = "";

    data.forEach((q) => {
      const row = document.createElement("tr");

      const position = document.createElement("td");
      position.textContent = q.position;

      // Create hyperlink for driver name
      const driverName = document.createElement("td");
      const driverLink = document.createElement("a");
      driverLink.textContent = `${q.driver.forename} ${q.driver.surname}`;
      driverLink.href = "#"; // Prevent default link behavior
      driverLink.onclick = () => {
        // Open driver dialog
        document.querySelector("#driver").showModal();
      };
      closeBtnDriver.onclick = () => {
        document.querySelector("#driver").close();
      };
      driverName.appendChild(driverLink); // Append link to the driver cell

      // Create hyperlink for constructor
      const constructor = document.createElement("td");
      const constructorLink = document.createElement("a");
      constructorLink.textContent = q.constructor.name;
      constructorLink.href = "#"; // Prevent default link behavior
      constructorLink.onclick = () => {
        // Open constructor dialog
        document.querySelector("#constructor").showModal();
      };
      constructor.appendChild(constructorLink); // Append link to the constructor cell

      const q1 = document.createElement("td");
      q1.textContent = q.q1;

      const q2 = document.createElement("td");
      q2.textContent = q.q2;

      const q3 = document.createElement("td");
      q3.textContent = q.q3;

      row.appendChild(position);
      row.appendChild(driverName);
      row.appendChild(constructor);
      row.appendChild(q1);
      row.appendChild(q2);
      row.appendChild(q3);

      tbody.appendChild(row);
    });
  }

  function sortTable(column) {
    const tbody = document.querySelector("#qualifying table tbody");
    const originalData = JSON.parse(tbody.dataset.originalData);
    const sortOrder = tbody.dataset.sortOrder === "asc" ? "desc" : "asc"; // Toggle sort order

    const sortedData = originalData.slice().sort((a, b) => {
      let valueA, valueB;

      switch (column) {
        case "position":
          valueA = parseInt(a.position);
          valueB = parseInt(b.position);
          break;
        case "name":
          valueA = `${a.driver.forename} ${a.driver.surname}`;
          valueB = `${b.driver.forename} ${b.driver.surname}`;
          break;
        case "constructor":
          valueA = a.constructor.name;
          valueB = b.constructor.name;
          break;
        case "q1":
          valueA = a.q1;
          valueB = b.q1;
          break;
        case "q2":
          valueA = a.q2;
          valueB = b.q2;
          break;
        case "q3":
          valueA = a.q3;
          valueB = b.q3;
          break;
        default:
          return 0;
      }

      return sortOrder === "asc"
        ? valueA < valueB
          ? -1
          : 1
        : valueA > valueB
        ? -1
        : 1;
    });

    tbody.dataset.sortOrder = sortOrder; // Update the sort order

    // Update the sort icons
    updateSortIcons(column, sortOrder);

    renderQualifyingTable(sortedData);
  }

  function updateSortIcons(column, sortOrder) {
    const headers = document.querySelectorAll("#qualifying table th");
    headers.forEach((header) => {
      const icon = header.querySelector(".sort-icon");
      if (header.dataset.column === column) {
        icon.textContent = sortOrder === "asc" ? "↑" : "↓"; // Update icon based on sort order
        icon.setAttribute("data-sort", sortOrder); // Update data-sort attribute
      } else {
        icon.textContent = "↑"; // Reset other icons to default
        icon.setAttribute("data-sort", "asc");
      }
    });
  }

  // Function to switch to browse view
  function switchToBrowseView() {
    const homeArticle = document.querySelector("#home");
    const browseArticle = document.querySelector("#browse");
    homeArticle.style.display = "none"; // Hide the home section
    browseArticle.style.display = "block"; // Show the browse section
    console.log("Switched to browse view");
  }
});
