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

    console.log("Sending data:", formData); // Debug log

    try {
        const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        console.log("Response received:", response); // Debug log

        const result = await response.json();
        console.log("Response JSON:", result); // Debug log

        alert(result.message); // Show success or error message
    } catch (error) {
        console.error("Error during fetch:", error);
    }
});
