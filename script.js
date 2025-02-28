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
// Reset Functions
// =========================
function resetEntryType() {
    document.getElementById("entryTypeSelect").value = "";
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("csvContainer").style.display = "none";
}
