document.getElementById("tableSelect").addEventListener("change", function () {
    const table = this.value;
    const formContainer = document.getElementById("formContainer");
    const formTitle = document.getElementById("formTitle");
    const formFields = document.getElementById("formFields");
    const csvUploadSection = document.getElementById("csvUploadSection");

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

    // Ensure CSV upload is visible
    csvUploadSection.style.display = "block";
});

// Handle Form Submission
document.getElementById("dynamicForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const table = document.getElementById("tableSelect").value;
    const formData = new FormData();
    formData.append("table", table);

    // Get CSV file
    const csvFile = document.getElementById("csvUpload").files[0];

    if (csvFile) {
        const csvData = await parseCSV(csvFile);
        formData.append("csvData", JSON.stringify(csvData));
    } else {
        // If no CSV, get form inputs
        const inputs = this.querySelectorAll("input[type='text']");
        let jsonData = {};
        let isFormEmpty = true;

        inputs.forEach(input => {
            if (input.value.trim() !== "") {
                jsonData[input.name] = input.value;
                isFormEmpty = false;
            }
        });

        if (isFormEmpty) {
            alert("Please either upload a CSV file or fill the form.");
            return;
        }

        formData.append("formData", JSON.stringify(jsonData));
    }

    try {
        const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
            method: "POST",
            body: formData
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
