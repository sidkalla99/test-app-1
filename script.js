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
        country_list: ["Id", "Country"],
        asset_list: ["Id", "Asset", "Creation Date", "Country"],
        technology_list: ["Id", "Technology"],
        business_unit_list: ["Id", "Business Unit"],
        legal_entity_list: ["Id", "Parent Company", "Legal Entity"],
        iso_list: ["Id", "ISO", "Country"],
        asset_description: ["Id", "Asset", "Description", "Version Date", "Location", "Technology", "Business Unit", "Legal Entity"],
        ownership_monthly_vector: ["Id", "Asset", "Description", "Version Date", "Month Year", "Ownership (%)"],
        currency_list: ["Id", "Currency"],
        energy_market_list: ["Id", "Energy Market", "Country"],
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
    let jsonData = { table: table };

    // Check if CSV is uploaded
    const csvFile = document.getElementById("csvUpload").files[0];
    if (csvFile) {
        jsonData.csvData = await parseCSV(csvFile); // ✅ Parse CSV and attach JSON data
    } else {
        // Collect form inputs if not using CSV
        const inputs = this.querySelectorAll("input[type='text']");
        jsonData.formData = {};
        inputs.forEach(input => { jsonData.formData[input.name] = input.value; });
    }

    try {
        const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"  // ✅ Required for API to accept JSON
            },
            body: JSON.stringify(jsonData)  // ✅ Convert to JSON before sending
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
