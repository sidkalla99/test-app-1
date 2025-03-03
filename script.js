// =========================
// Date and Time Display
// =========================
function updateDateTime() {
    const now = new Date();
    // GMT Time (Greenwich Mean Time)
    const gmtTime = now.toLocaleString('en-GB', {
        timeZone: 'Etc/GMT',
        hour12: false
    });
    // Display GMT time
    document.getElementById('dateTime').innerText = `GMT: ${gmtTime}`;
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
// Country Dropdown Cache
// =========================
let countryDropdownValues = [];

// Fetch once and store for reuse
async function fetchCountryValues() {
    try {
        const response = await fetch(`https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader?table=country`, {
            method: "GET"
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        countryDropdownValues = result.data || [];
        console.log("Fetched Country Values:", countryDropdownValues);
    } catch (error) {
        console.error("Error fetching country dropdown values:", error);
    }
}

// Call this once when the page loads
fetchCountryValues();

// =========================
// Dynamic Form Generation
// =========================
async function triggerForm(table) {
    const formFields = document.getElementById("formFields");
    formFields.innerHTML = "";

    const tableFields = {
        country: ["Id", "Country"],
        asset: ["Id", "Asset", "Creation Date", "Country"],
        technology: ["Id", "Technology"],
        business_unit: ["Id", "Business Unit"],
        legal_entity: ["Id", "Parent Company", "Legal Entity"],
        iso: ["Id", "ISO", "Country"],
        asset_description: ["Id", "Asset", "Description", "Version Date", "Location", "Technology", "Business Unit", "Legal Entity"],
        ownership: ["Id", "Asset", "Description", "Month Year", "Ownership (%)"],
        currency: ["Id", "Currency"],
        energy_market: ["Id", "Energy Market", "Country"],
    };

    if (tableFields[table]) {
        for (let field of tableFields[table]) {
            const fieldContainer = document.createElement("div");
            fieldContainer.classList.add("form-group");

            const label = document.createElement("label");
            label.textContent = field;
            label.setAttribute("for", field.toLowerCase().replace(/\s+/g, "_"));

            // Only create Country dropdown for specified tables
            if (field === "Country" && ["asset", "iso", "energy_market"].includes(table)) {
                const select = document.createElement("select");
                select.name = field.toLowerCase().replace(/\s+/g, "_");
                select.classList.add("form-control");

                // Populate dropdown options from cached values
                select.innerHTML = `<option value="">-- Select ${field} --</option>`;
                countryDropdownValues.forEach(value => {
                    select.innerHTML += `<option value="${value}">${value}</option>`;
                });

                fieldContainer.appendChild(label);
                fieldContainer.appendChild(select);
            } else {
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
    
    const table = document.getElementById("tableSelectCreate").value || document.getElementById("tableSelectModify").value;

    // Get form inputs
    const inputs = this.querySelectorAll("input[type='text']");
    let formData = {};

    inputs.forEach(input => {
        if (input.value.trim() !== "") {
            formData[input.name] = input.value;
        }
    });

    console.log("Original Form Data:", formData);

    // Field Mapping for Payload
    const fieldMapping = {
        country: { id: "id", country: "country" },
        asset: { id: "id", asset: "asset", creation_date: "creation_date", country: "country" },
        iso: { id: "id", iso: "iso", country: "country" },
        asset_description: {
            id: "id",
            asset: "asset",
            description: "description",
            version_date: "version_date",
            location: "location",
            technology: "technology",
            business_unit: "business_unit",
            legal_entity: "legal_entity"
        },
        technology: { id: "id", technology: "technology" },
        business_unit: { id: "id", business_unit: "business_unit" },
        legal_entity: { id: "id", legal_entity: "legal_entity" },
        ownership: { id: "id", ownership: "ownership" },
        currency: { id: "id", currency: "currency" },
        energy_market: { id: "id", energy_market: "energy_market" }
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

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Server Response:", result);
        alert("Data submitted successfully!");
    } catch (error) {
        console.error("Server Error:", error);
        alert("Failed to submit data. Check console for more details.");
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

// =========================
// Event Listener for Modify -> Asset Description -> Manual
// =========================
document.getElementById("tableSelectModify").addEventListener("change", function () {
    if (this.value === "asset_description" && document.getElementById("entryTypeSelect").value === "manual") {
        fetchAssetDescriptionData();
    }
});

// =========================
// Reset Functions
// =========================
function resetEntryType() {
    document.getElementById("entryTypeSelect").value = "";
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("csvContainer").style.display = "none";
}
