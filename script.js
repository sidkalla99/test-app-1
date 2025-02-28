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
        for (let field of tableFields[table]) {
            const fieldContainer = document.createElement("div");
            fieldContainer.classList.add("form-group");

            const label = document.createElement("label");
            label.textContent = field;
            label.setAttribute("for", field.toLowerCase().replace(/\s+/g, "_"));

            // Country Dropdown for Specific Tables
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
            } else if (["Location", "Technology", "Business Unit", "Legal Entity"].includes(field)) {
                // Other dropdowns (No API call)
                const select = document.createElement("select");
                select.name = field.toLowerCase().replace(/\s+/g, "_");
                select.classList.add("form-control");
                select.innerHTML = `<option value="">-- Select ${field} --</option>`;
                fieldContainer.appendChild(label);
                fieldContainer.appendChild(select);
            } else {
                // Default to text input
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
// Reset Functions
// =========================
function resetEntryType() {
    // Reset entry type dropdown
    document.getElementById("entryTypeSelect").value = "";
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("csvContainer").style.display = "none";
}
