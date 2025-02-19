document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("id").value = "ASSET-" + Math.floor(Math.random() * 10000);

    document.getElementById("assetForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        console.log("Form submitted!");  // Debugging log
        
        const formData = {
            id: document.getElementById("id").value,
            asset: document.getElementById("asset").value,
            description: document.getElementById("description").value,
            version_date: document.getElementById("version_date").value,
            location: document.getElementById("location").value,
            technology: document.getElementById("technology").value,
            business_unit: document.getElementById("business_unit").value,
            legal_entity: document.getElementById("legal_entity").value,
        };

        console.log("Form Data:", formData); // Debugging log

        try {
            const response = await fetch("https://9h29vyhchd.execute-api.eu-central-1.amazonaws.com/zelestra-etrm-raw-datauploader", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            console.log("API Response:", result); // Debugging log
            alert(result.message);
        } catch (error) {
            console.error("Error:", error);
            alert("Error submitting form");
        }
    });
});
