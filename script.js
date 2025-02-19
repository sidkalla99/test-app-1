document.getElementById("tableSelect").addEventListener("change", function () {
    const table = this.value;
    const formContainer = document.getElementById("formContainer");
    const formTitle = document.getElementById("formTitle");
    const formFields = document.getElementById("formFields");

    if (!table) {
        formContainer.style.display = "none";
        return;
    }

    formContainer.style.display = "block";
    formTitle.textContent = `Add Data to ${table.replace(/_/g, " ")}`;

    // Define form fields for each table
    const tableFields = {
        country: ["Id", "Country"],
        asset: ["Id", "Asset", "Creation Date", "Country"],
        technology: ["Id", "Technology"],
        business_unit: ["Id", "Business Unit"],
        legal_entity: ["Id", "Parent Company", "Legal Entity"],
        iso: ["Id", "ISO", "Country"],
        asset_description: ["Id", "Asset", "Description", "Version Date", "Location", "Technology", "Business Unit", "Legal Entity"],
        ownership: ["Id", "Asset", "Description", "Version Date", "Month Year", "Ownership (%)"],
        currency: ["Id", "Currency"],
        energy_market: ["Id", "Energy Market", "Country"],
    };

    // Clear previous fields
    formFields.innerHTML = "";

    if (tableFields[table]) {
        tableFields[table].forEach(field => {
            const fieldContainer = document.createElement("div");
            fieldContainer.classList.add("form-group");

            const label = document.createElement("label");
            label.textContent = field;
            label.setAttribute("for", field.toLowerCase().replace(/\s+/g, "_"));

            const input = document.createElement("input");
            input.type = "text";
            input.name = field.toLowerCase().replace(/\s+/g, "_");
            input.classList.add("form-control");

            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
            formFields.appendChild(fieldContainer);
        });
    }

    // Fetch and display data for the selected table
    fetchTableData(table);
});

// Handle Form Submission
document.getElementById("dynamicForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const table = document.getElementById("tableSelect").value;
    let payload = { table: table, data: [] }; // Ensure "data" is an array

    // Get CSV file
    const csvFile = document.getElementById("csvUpload").files[0];

    if (csvFile) {
        const csvData = await parseCSV(csvFile);
        if (csvData.length === 0) {
            alert("CSV file is empty or invalid.");
            return;
        }
        payload.data = csvData; // Set parsed CSV data
    } else {
        // If no CSV, get form inputs
        const inputs = this.querySelectorAll("input[type='text']");
        let jsonData = {};

        inputs.forEach(input => {
            if (input.value.trim() !== "") {
                jsonData[input.name] = input.value;
            }
        });

        if (Object.keys(jsonData).length === 0) {
            alert("Please either upload a CSV file or fill the form.");
            return;
        }

        payload.data = [jsonData]; // Convert form input to an array
    }

    try {
        const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error("Error submitting data:", error);
        alert("Error submitting data");
    }
});

// Parse CSV File into JSON
async function parseCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const text = event.target.result;
            const lines = text.split("\n").map(line => line.split(","));
            const headers = lines.shift().map(header => header.trim());

            const jsonData = lines.map(row => {
                let obj = {};
                row.forEach((value, index) => { obj[headers[index]] = value.trim(); });
                return obj;
            });
            resolve(jsonData);
        };
        reader.onerror = () => reject("Error reading CSV file");
        reader.readAsText(file);
    });
}

// Fetch and Display Data from CSV in S3
async function fetchTableData(tableName) {
    try {
        const response = await fetch(`https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datafetcher?table=${tableName}`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const csvText = await response.text(); // Fetch CSV as text
        const data = parseCSVText(csvText); // Convert CSV to JSON format

        console.log("Fetched Data:", data);
        displayTableData(data); // Display the parsed data in table format
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Convert CSV Text to JSON
function parseCSVText(csvText) {
    const lines = csvText.split("\n").filter(line => line.trim() !== "");
    const headers = lines.shift().split(",").map(header => header.trim());
    
    return lines.map(line => {
        const values = line.split(",").map(value => value.trim());
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        return obj;
    });
}

// Display Data in Table
function displayTableData(data) {
    const tableContainer = document.getElementById("tableContainer");
    tableContainer.innerHTML = ""; // Clear previous data

    if (data.length === 0) {
        tableContainer.innerHTML = "<p>No data available.</p>";
        return;
    }

    const table = document.createElement("table");
    table.classList.add("data-table");

    // Create table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    Object.keys(data[0]).forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");
    data.forEach(row => {
        const tr = document.createElement("tr");
        Object.values(row).forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    tableContainer.appendChild(table);
}

// Call function when table selection changes
document.getElementById("tableSelect").addEventListener("change", function () {
    const table = this.value;
    if (table) fetchTableData(table);
});
