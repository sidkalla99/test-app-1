document.addEventListener("DOMContentLoaded", function () {
    const tableSelector = document.getElementById("tableSelector");
    const formContainer = document.getElementById("formContainer");
    const formTitle = document.getElementById("formTitle");
    const formFields = document.getElementById("formFields");
    const form = document.getElementById("dynamicForm");

    // Define table fields
    const tableFields = {
        country_list: ["Id", "Country"],
        asset_list: ["Id", "Asset", "Creation_date", "Country"],
        technology_list: ["Id", "Technology"],
        business_unit_list: ["Id", "Business_Unit"],
        legal_entity_list: ["Id", "Parent_Company", "Legal_Entity"],
        iso_list: ["Id", "ISO", "Country"],
        asset_description: ["Id", "Asset", "Description", "Version_date", "Location", "Technology", "Business_Unit", "Legal_Entity"],
        ownership_monthly_vector: ["Id", "Asset", "Description", "Version_date", "Month_Year", "Ownership(%)"],
        currency_list: ["Id", "Currency"],
        energy_market_list: ["Id", "Energy_Market", "Energy_Node", "Energy_Currency", "Energy_Units", "Month_Year", "Energy_P50", "Energy_P90"]
    };

    // Handle table selection
    tableSelector.addEventListener("change", function () {
        const selectedTable = tableSelector.value;

        if (!selectedTable) {
            formContainer.style.display = "none";
            return;
        }

        // Update form title
        formTitle.textContent = `Enter Data for ${selectedTable.replace("_", " ").toUpperCase()}`;
        formFields.innerHTML = ""; // Clear previous form fields

        // Generate form fields dynamically
        tableFields[selectedTable].forEach(field => {
            const label = document.createElement("label");
            label.textContent = field;
            const input = document.createElement("input");
            input.type = field.toLowerCase().includes("date") ? "date" : "text";
            input.name = field;
            input.required = true;
            formFields.appendChild(label);
            formFields.appendChild(input);
        });

        // Show form
        formContainer.style.display = "block";
    });

    // Handle form submission
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = {};
        new FormData(form).forEach((value, key) => {
            formData[key] = value;
        });

        console.log("Submitting Data:", formData); // Debugging log

        try {
            const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            console.log("API Response:", result);
            alert(result.message);
        } catch (error) {
            console.error("Error:", error);
            alert("Error submitting form");
        }
    });
});
