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
// Form Submission (POST Request)
// =========================
async function submitForm(event) {
    event.preventDefault(); // Prevents default form submission

    const table = document.getElementById("tableSelectCreate").value || document.getElementById("tableSelectModify").value;

    // Prepare payload
    const formData = {};
    const inputs = document.querySelectorAll("#formFields input, #formFields select");
    inputs.forEach(input => {
        formData[input.name] = input.value;
    });

    console.log("Payload:", formData);

    try {
        const response = await fetch(`https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader?table=${table}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            alert("Data submitted successfully!");
            console.log("Success:", result);
        } else {
            console.error("Server Error:", response.status, response.statusText);
            alert("Failed to submit data. Please check the console for details.");
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("Network error occurred. Please try again.");
    }
}

// Attach event listener for form submission
document.getElementById("formContainer").addEventListener("submit", submitForm);

// =========================
// Reset Functions
// =========================
function resetEntryType() {
    document.getElementById("entryTypeSelect").value = "";
    document.getElementById("formContainer").style.display = "none";
    document.getElementById("csvContainer").style.display = "none";
}
