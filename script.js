// =========================
// UTC Date and Time Display
// =========================
function updateDateTime() {
    const now = new Date();

    // Format UTC time in 24-hour format (YYYY-MM-DD HH:MM:SS)
    const utcTime = now.toISOString().replace("T", " ").substring(0, 19);

    // Display UTC time
    document.getElementById('dateTime').innerText = `UTC: ${utcTime}`;
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
    document.getElementById("uploadModeSelect").value = "";
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
document.getElementById("uploadModeSelect").addEventListener("change", function () {
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
// Dropdown Data Caches
// =========================
let countryDropdownValues = [];
let isoDropdownValues = [];

// Fetch Country Values
async function fetchCountryValues() {
    try {
        const response = await fetch(`https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader?table=country`, {
            method: "GET"
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        // Update dropdown values with 'id - country' format
        countryDropdownValues = result.data.map(entry => ({
            value: entry.id, 
            text: `${entry.id} - ${entry.country}`
        })) || [];
        console.log("Fetched Country Values:", countryDropdownValues);

    } catch (error) {
        console.error("Error fetching country dropdown values:", error);
    }
}

// Fetch ISO Values
async function fetchISOValues() {
    try {
        const response = await fetch(`https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader?table=iso`, {
            method: "GET"
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        isoDropdownValues = result.data.map(entry => ({
            value: entry.id, 
            text: `${entry.id} - ${entry.iso}`
        })) || [];
        console.log("Fetched ISO Values:", isoDropdownValues);
    } catch (error) {
        console.error("Error fetching ISO dropdown values:", error);
    }
}

// Call these once when the page loads
fetchCountryValues();
fetchISOValues();

// =========================
// Dynamic Form Generation
// =========================
async function triggerForm(table) {
    const formFields = document.getElementById("formFields");
    formFields.innerHTML = "";

    const tableFields = {
        country: ["Country", "Country Code"],
        asset: ["Asset", "Creation Date", "Country"],
        technology: ["Technology"],
        business_unit: ["Business Unit"],
        legal_entity: ["Parent Company", "Legal Entity", "ZEL Code"],
        iso: ["ISO", "Country", "ISO Code"],
        asset_description: ["Asset", "Description", "Version Date", "Location", "Technology", "Business Unit", "Legal Entity"],
        ownership: ["Asset", "Description", "Start Date", "End Date", "Ownership (%)"],
        currency: ["Currency", "Currency Code"],
        energy_node: ["Energy Node", "Country", "ISO"],
    };

    if (tableFields[table]) {
        for (let field of tableFields[table]) {
            const fieldContainer = document.createElement("div");
            fieldContainer.classList.add("form-group");

            const label = document.createElement("label");
            label.textContent = field;
            label.setAttribute("for", field.toLowerCase().replace(/\s+/g, "_"));

            // Only create Country dropdown for specified tables
            if (field === "Country" && ["asset", "iso", "energy_node"].includes(table)) {
                const select = document.createElement("select");
                select.name = field.toLowerCase().replace(/\s+/g, "_");
                select.classList.add("form-control");

		// Populate dropdown options from cached values
    		select.innerHTML = `<option value="">-- Select ${field} --</option>`;
    		countryDropdownValues.forEach(({ value, text }) => {
        	select.innerHTML += `<option value="${value}">${text}</option>`;
    		});


                fieldContainer.appendChild(label);
                fieldContainer.appendChild(select);
            }
            // Only create Country dropdown for specified tables
            else if (field === "ISO" && ["energy_node"].includes(table)) {
                const select = document.createElement("select");
                select.name = field.toLowerCase().replace(/\s+/g, "_");
                select.classList.add("form-control");

                // Populate dropdown options from cached values
                select.innerHTML = `<option value="">-- Select ${field} --</option>`;
    		isoDropdownValues.forEach(({ value, text }) => {
        	select.innerHTML += `<option value="${value}">${text}</option>`;
    		});
                fieldContainer.appendChild(label);
                fieldContainer.appendChild(select);
            }
            else if (["Creation Date", "Start Date", "End Date"].includes(field)) {  // Fixed from "elseif" to "else if"
                const input = document.createElement("input"); // Added "const" to define input
                input.type = "date";
                input.name = field.toLowerCase().replace(/\s+/g, "_"); // Ensure name is set
                input.classList.add("form-control");
            
                fieldContainer.appendChild(label);
                fieldContainer.appendChild(input);
            }
            else {
                // All other fields as text inputs
                const input = document.createElement("input");
                input.type = "text";
                input.name = field.toLowerCase().replace(/\s+/g, "_");
                input.classList.add("form-control");

                fieldContainer.appendChild(label);
                fieldContainer.appendChild(input);
            }
            formFields.appendChild(fieldContainer);
        }
    }
}

// =========================
// Handle Form Submission (Dynamic Payload)
// =========================

document.getElementById("dynamicForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get the upload mode selection dynamically
    const modeSelect = document.querySelector("#uploadModeSelect"); 
    const mode = modeSelect ? modeSelect.value : "manual"; // Default to manual

    console.log("Selected Mode:", mode); // Debugging check

    if (mode === "bulk") {
        console.log("Bulk upload detected. Skipping alert.");
        return; // Stop execution for bulk uploads
    }
    const table = document.getElementById("tableSelectCreate").value || document.getElementById("tableSelectModify").value;

    // Get form inputs
    const inputs = this.querySelectorAll(".form-control");
    let formData = {};

    inputs.forEach(input => {
        let fieldName = input.name;
        
        // If the input is a select dropdown for country or iso, store only the ID
        if (fieldName === "country" || fieldName === "iso") {
            formData[fieldName] = input.value;  // Stores only the ID
        } else if (input.value.trim() !== "") {
            formData[fieldName] = input.value;
        }
    });

    console.log("Original Form Data:", formData);

    // Field Mapping for Payload
    const fieldMapping = {
        country: {country: "country", country_code: "country_code"},
        asset: { asset: "asset", creation_date: "creation_date", country: "country_id" },
        iso: { iso: "iso", country: "country_id", iso_code: "iso_code"},
        asset_description: {
            asset: "asset",
            description: "description",
            version_date: "version_date",
            location: "location",
            technology: "technology",
            business_unit: "business_unit",
            legal_entity: "legal_entity"
        },
        technology: { technology: "technology" },
        business_unit: { business_unit: "business_unit" },
        legal_entity: { parent_company: "parent_company", legal_entity: "legal_entity", zel_code: "zel_code" },
        ownership: { asset_id: "asset_id", description: "description", ownership: "ownership", start_date: "start_date", end_date: "end_date" },
        currency: { currency: "currency", currency_code: "currency_code"},
        energy_node: { energy_node: "energy_node", country: "country_id", iso: "iso_id" }
    };

    let transformedData = {};
    Object.keys(fieldMapping[table]).forEach(key => {
        const mappedKey = fieldMapping[table][key];
        if (formData[key]) {
            transformedData[mappedKey] = formData[key];
        }
    });

    const payload = {
        table: table,
        insert_method: "manual",
        data: [transformedData]
    };

    console.log("Transformed Payload:", JSON.stringify(payload));

    try {
        const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    
        let result;
        try {
            result = await response.json(); // Attempt to parse JSON response
        } catch (jsonError) {
            console.error("Failed to parse response JSON:", jsonError);
            throw new Error(`HTTP error! Status: ${response.status} (Invalid JSON response)`);
        }
    
        if (!response.ok) {
            throw new Error(result?.error || `HTTP error! Status: ${response.status}`);
        }
    
        console.log("Server Response:", result);
        alert("Data submitted successfully!");
    } catch (error) {
        console.error("Server Error:", error);
    
        // Show actual API error message in the alert box
        alert(`Failed to submit data. ${error.message}`);
    }
});

// =========================
// Global Variable to Store Asset Description Data
// =========================
let assetDescriptionData = [];

// =========================
// Fetch Asset Description Data
// =========================
async function fetchAssetDescriptionData() {
    try {
        const response = await fetch(`https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader?table=asset_description`, {
            method: "GET"
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        assetDescriptionData = result.data || [];
        console.log("Fetched Asset Description Data:", assetDescriptionData);

        populateAssetDropdown();
    } catch (error) {
        console.error("Error fetching asset description data:", error);
    }
}

// =========================
// Populate Asset Dropdown
// =========================
function populateAssetDropdown() {
    const formFields = document.getElementById("formFields");
    formFields.innerHTML = ""; // Clear previous fields

    const assetContainer = document.createElement("div");
    assetContainer.classList.add("form-group");

    const label = document.createElement("label");
    label.textContent = "Asset";
    label.setAttribute("for", "asset");

    const select = document.createElement("select");
    select.name = "asset";
    select.classList.add("form-control");
    select.innerHTML = `<option value="">-- Select Asset --</option>`;

    const uniqueAssets = [...new Set(assetDescriptionData.map(item => item.Asset))];
    uniqueAssets.forEach(asset => {
        select.innerHTML += `<option value="${asset}">${asset}</option>`;
    });

    select.addEventListener("change", function () {
        populateFieldsForSelectedAsset(this.value);
    });

    assetContainer.appendChild(label);
    assetContainer.appendChild(select);
    formFields.appendChild(assetContainer);
}

// =========================
// Populate Fields for Selected Asset
// =========================
function populateFieldsForSelectedAsset(selectedAsset) {
    const formFields = document.getElementById("formFields");
    
    // Remove previous fields except the Asset dropdown
    Array.from(formFields.children).forEach(child => {
        if (!child.querySelector("select[name='asset']")) {
            child.remove();
        }
    });

    if (!selectedAsset) return;

    // Get the row corresponding to the selected asset
    const selectedRow = assetDescriptionData.find(item => item.Asset === selectedAsset);

    // Field List for Asset Description Table
    const fieldList = ["Description", "Version Date", "Location", "Technology", "Business Unit", "Legal Entity"];

    fieldList.forEach(field => {
        const fieldContainer = document.createElement("div");
        fieldContainer.classList.add("form-group");

        const label = document.createElement("label");
        label.textContent = field;
        label.setAttribute("for", field.toLowerCase().replace(/\s+/g, "_"));

        const select = document.createElement("select");
        select.name = field.toLowerCase().replace(/\s+/g, "_");
        select.classList.add("form-control");
        
        select.innerHTML = `<option value="">-- Select ${field} --</option>`;

        // Populate dropdown with all unique values for that field
        const uniqueValues = [...new Set(assetDescriptionData.map(item => item[field]))];
        uniqueValues.forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            if (selectedRow[field] === value) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        fieldContainer.appendChild(label);
        fieldContainer.appendChild(select);
        formFields.appendChild(fieldContainer);
    });
}

// =========================
// Duplicacy check and data appending for country table
// =========================
async function uploadData() {
    const data = {
        table: "country",
        data: {
            country: document.getElementById("countryInput").value.trim()
        }
    };

    try {
        const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // Display message in warning box
        const warningBox = document.getElementById("warningBox");
        
        if (response.ok) {
            warningBox.innerText = result.message;
            warningBox.style.color = "green";
            warningBox.style.display = "block";
        } else {
            warningBox.innerText = result.message;
            warningBox.style.color = "red";
            warningBox.style.display = "block";
        }
    } catch (error) {
        console.error("Error uploading data:", error);
        alert("An error occurred. Please try again later.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const dynamicForm = document.getElementById("dynamicForm");

    if (!dynamicForm) {
        console.error('Form "dynamicForm" not found in the DOM');
        return;
    }

    dynamicForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the default form submission

        const fileInput = document.getElementById("csvUpload");
        const file = fileInput.files[0];

        // Check if file is selected and is of the correct type (CSV)
        if (!file) {
            document.getElementById("csvUploadStatus").textContent = "Please select a CSV file to upload.";
            return;
        }

        if (file.type !== "text/csv") {
            document.getElementById("csvUploadStatus").textContent = "Please upload a valid CSV file.";
            return;
        }

        const reader = new FileReader();

        reader.onload = async function () {
            const csvData = reader.result;
            const jsonData = csvToJson(csvData);

            // Check if CSV data is valid and contains rows
            if (jsonData && jsonData.length > 0) {
                document.getElementById("csvUploadStatus").textContent = "Processing your CSV data.";
                await handleCSVData(jsonData); // Handle the data directly here
            } else {
                document.getElementById("csvUploadStatus").textContent = "No valid data found in CSV.";
            }
        };

        reader.readAsText(file); // Read the file as text and trigger the onload function
    });
});

// Function to convert CSV to JSON
function csvToJson(csv) {
    const lines = csv.split("\n");
    const result = [];
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(",");

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentLine[j].trim();
        }
        result.push(obj);
    }
    return result;
}

// Function to handle the CSV data and send to API
async function handleCSVData(data) {
    const table = "technology"; // Change this dynamically based on your needs
    const fieldMapping = {
        country: { country: "country", country_code: "country_code" },
        asset: { asset: "asset", creation_date: "creation_date", country: "country_id" },
        iso: { iso: "iso", country: "country_id", iso_code: "iso_code" },
        asset_description: {
            asset: "asset",
            description: "description",
            version_date: "version_date",
            location: "location",
            technology: "technology",
            business_unit: "business_unit",
            legal_entity: "legal_entity"
        },
        technology: { technology: "technology" },
        business_unit: { business_unit: "business_unit" },
        legal_entity: { legal_entity: "legal_entity", zel_code: "zel_code" },
        ownership: { asset_id: "asset_id", description: "description", ownership: "ownership", start_date: "start_date", end_date: "end_date" },
        currency: { currency: "currency", currency_code: "currency_code" },
        energy_node: { energy_node: "energy_node", country: "country_id", iso: "iso_id" }
    };

    // Don't show the warning box for bulk uploads
    const warningBox = document.getElementById("warningBox");
    warningBox.style.display = "none"; // Hide warning box during bulk upload

    // Check if field mapping exists for the table
    if (!fieldMapping[table]) {
        console.error(`Error: No field mapping found for table: ${table}`);
        document.getElementById("csvUploadStatus").textContent = `No field mapping found for table: ${table}`;
        return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Iterate over the CSV rows
    for (const rowData of data) {
        let transformedData = {};

        // Map CSV data to field mapping
        Object.keys(fieldMapping[table]).forEach(key => {
            const mappedKey = fieldMapping[table][key];

            // Check if the key exists in the rowData (CSV row)
            if (rowData[key]) {
                transformedData[mappedKey] = rowData[key];
            }
        });

        // Check if transformedData has any valid keys (to avoid sending empty data)
        if (Object.keys(transformedData).length === 0) {
            console.log("Skipping empty row:", rowData);
            continue; // Skip the row if it contains no valid data
        }

        // Prepare payload for the API
        const payload = {
            table: table,
            insert_method: "bulk", // or "manual" depending on your use case
            data: [transformedData]
        };

        console.log("Transformed Payload for CSV Row:", JSON.stringify(payload));

        // Send the transformed data to the API
        try {
            const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) {
                console.log("Error uploading CSV data:", result?.error);
                errorCount++;
                continue; // Skip further processing for this row if there was an error
            }

            console.log("Server Response for CSV Row:", result);
            successCount++;
        } catch (error) {
            console.error("Error uploading CSV data:", error);
            errorCount++;
        }
    }

    // Skip the warning box and display a status in the upload section
    if (successCount > 0) {
        document.getElementById("csvUploadStatus").textContent = `${successCount} rows uploaded successfully.`;
    }
    if (errorCount > 0) {
        document.getElementById("csvUploadStatus").textContent += ` ${errorCount} errors occurred during upload.`;
    }
}

// =========================
// Event Listener for Modify -> Asset Description -> Manual
// =========================
document.getElementById("tableSelectModify").addEventListener("change", function () {
    if (this.value === "asset_description" && document.getElementById("uploadModeSelect").value === "manual") {
        fetchAssetDescriptionData();
    }
});

// =========================
// Reset Functions
// =========================
function resetEntryType() {
    document.getElementById("uploadModeSelect").value = "";
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("csvContainer").style.display = "none";
}
