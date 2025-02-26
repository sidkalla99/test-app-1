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
// Action Selection Handling
// =========================
document.getElementById("actionSelect").addEventListener("change", function () {
    const action = this.value;
    const createDropdown = document.getElementById("createDropdown");
    const modifyDropdown = document.getElementById("modifyDropdown");
    const entryTypeDropdown = document.getElementById("entryTypeDropdown");

    // Reset All Selections
    document.getElementById("tableSelectCreate").value = "";
    document.getElementById("tableSelectModify").value = "";
    document.getElementById("entryTypeSelect").value = "";
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("csvContainer").style.display = "none";

    createDropdown.style.display = "none";
    modifyDropdown.style.display = "none";
    entryTypeDropdown.style.display = "none";

    if (action === "create") {
        createDropdown.style.display = "block";
    } else if (action === "modify") {
        modifyDropdown.style.display = "block";
    }
});

// =========================
// Dropdown Change Handlers
// =========================
document.getElementById("tableSelectCreate").addEventListener("change", function () {
    resetEntryType();
    document.getElementById("entryTypeDropdown").style.display = this.value ? "block" : "none";
});
document.getElementById("tableSelectModify").addEventListener("change", function () {
    resetEntryType();
    document.getElementById("entryTypeDropdown").style.display = this.value ? "block" : "none";
});

// =========================
// Entry Type Selection
// =========================
document.getElementById("entryTypeSelect").addEventListener("change", function () {
    const entryType = this.value;
    const table = document.getElementById("tableSelectCreate").value || document.getElementById("tableSelectModify").value;

    // Hide both containers first
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("csvContainer").style.display = "none";

    if (entryType === "manual") {
        triggerForm(table);
        document.getElementById("formContainer").style.display = "block";
    } else if (entryType === "bulk") {
        document.getElementById("csvContainer").style.display = "block";
    }
});

// =========================
// Dynamic Form Generation
// =========================
function triggerForm(table) {
    const formFields = document.getElementById("formFields");
    formFields.innerHTML = "";

    const tableFields = {
        country: ["Country"],
        asset: ["Asset", "Creation Date", "Country"],
        technology: ["Technology"],
        business_unit: ["Business Unit"],
        legal_entity: ["Parent Company", "Legal Entity"],
        iso: ["ISO", "Country"],
        asset_description: ["Asset", "Description", "Version Date", "Location", "Technology", "Business Unit", "Legal Entity"],
        ownership: ["Asset", "Description", "Month Year", "Ownership (%)"],
        currency: ["Currency"],
        energy_market: ["Energy Market", "Country"],
    };

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
}

// =========================
// Handle Form Submission
// =========================
document.getElementById("dynamicForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const table = document.getElementById("tableSelectCreate").value || document.getElementById("tableSelectModify").value;
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
        alert(result.message || "Data uploaded successfully!");
        
        // Clear form after submission
        document.getElementById("dynamicForm").reset();
        document.getElementById("csvUpload").value = "";
    } catch (error) {
        console.error("Error submitting data:", error);
        alert("Error submitting data!");
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

// =========================
// Reset Functions
// =========================
function resetEntryType() {
    // Reset entry type dropdown
    document.getElementById("entryTypeSelect").value = "";
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("csvContainer").style.display = "none";
}
