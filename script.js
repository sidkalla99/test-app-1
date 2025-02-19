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
        country_list: ["Country"],
        asset_list: ["Asset", "Creation Date", "Country"],
        technology_list: ["Technology"],
        business_unit_list: ["Business Unit"],
        legal_entity_list: ["Parent Company", "Legal Entity"],
        iso_list: ["ISO", "Country"],
        asset_description: ["Asset", "Description", "Version Date", "Location", "Technology", "Business Unit", "Legal Entity"],
        ownership_monthly_vector: ["Asset", "Description", "Version Date", "Month Year", "Ownership (%)"],
        currency_list: ["Currency"],
        energy_market_list: ["ISO", "Energy Market", "Energy Node", "Energy Currency", "Energy Units", "Month Year", "Energy P50", "Energy P90"],
    };

    // Generate form fields dynamically
    formFields.innerHTML = "";
    tableFields[table].forEach(field => {
        const label = document.createElement("label");
        label.textContent = field;
        const input = document.createElement("input");
        input.type = "text";
        input.name = field.toLowerCase().replace(/\s+/g, "_");
        input.required = true;
        formFields.appendChild(label);
        formFields.appendChild(input);
    });
});

// Handle Form Submission
document.getElementById("dynamicForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const table = document.getElementById("tableSelect").value;
    const formData = new FormData();
    formData.append("table", table);

    // Check if CSV is uploaded
    const csvFile = document.getElementById("csvUpload").files[0];
    if (csvFile) {
        const csvData = await parseCSV(csvFile);
        formData.append("csvData", JSON.stringify(csvData));  // Send CSV data as JSON
    } else {
        // Collect form inputs if not using CSV
        const inputs = this.querySelectorAll("input[type='text']");
        const jsonData = {};
        inputs.forEach(input => { jsonData[input.name] = input.value; });
        formData.append("formData", JSON.stringify(jsonData));
    }

    try {
        const response = await fetch("https://your-api-gateway-url", {
            method: "POST",
            body: formData
        });
        const result = await response.json();
        alert(result.message);
    } catch (error) {
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
