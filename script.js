// =========================
// Date and Time Display
// =========================
function updateDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString('en-GB', {
        hour12: false
    }) + " IST";
    document.getElementById('dateTime').innerText = dateTimeString;
}

setInterval(updateDateTime, 1000);  // Update every second
updateDateTime();  // Initial call

// =========================
// Dynamic Form Handling
// =========================
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

// =========================
// Handle Form Submission
// =========================
document.getElementById("dynamicForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const table = document.getElementById("tableSelect").value;
    let payload = { table: table, data: [] };

    // Get CSV file
    const csvFile = document.getElementById("csvUpload").files[0];

    if (csvFile) {
        const csvData = await parseCSV(csvFile);
        if (csvData.length === 0) {
            alert("CSV file is empty or invalid.");
            return;
        }
        payload.data = csvData;
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

        payload.data = [jsonData];
    }

    try {
        const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const result = await response.json();

        // Show success message in the warning box
        const warningBox = document.getElementById("warningBox");
        warningBox.textContent = result.message || "Data uploaded successfully!";
        warningBox.style.color = "green";
        warningBox.style.display = "block";

        // Automatically hide after 5 seconds
        setTimeout(() => {
            warningBox.style.display = "none";
        }, 5000);

        // Clear form inputs after submission
        document.getElementById("dynamicForm").reset();
        document.getElementById("csvUpload").value = "";
    } catch (error) {
        console.error("Error submitting data:", error);

        // Show error message in the warning box
        const warningBox = document.getElementById("warningBox");
        warningBox.textContent = "Error submitting data!";
        warningBox.style.color = "red";
        warningBox.style.display = "block";

        // Automatically hide after 5 seconds
        setTimeout(() => {
            warningBox.style.display = "none";
        }, 5000);
    }
});

// =========================
// Parse CSV File into JSON
// =========================
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
