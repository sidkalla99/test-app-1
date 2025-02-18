document.getElementById("assetForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent page refresh

    const formData = {
        asset: document.getElementById("asset").value,
        description: document.getElementById("description").value,
        version_date: document.getElementById("version_date").value,
        location: document.getElementById("location").value,
        technology: document.getElementById("technology").value,
        business_unit: document.getElementById("business_unit").value,
        legal_entity: document.getElementById("legal_entity").value,
    };

    const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    const result = await response.json();
    alert(result.message); // Show success or error message
});

