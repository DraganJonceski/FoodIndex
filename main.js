
// Food array
let foods = [];

// Render function
function renderFoods(list){
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if(list.length === 0) {
        resultsDiv.innerHTML = "<p>No results.<p>";
        return;
    }

    const fragment = document.createDocumentFragment();


    list.forEach(food => {
        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `<img src="images/${food.imageName}" alt="${food.name}">
        <h3>${food.name}</h3>
        <p><strong>${food.caloriesPer100g}</strong> kcal / 100g</p>

        <div class="nutrients">
            <p>Protein: ${food.protein} g</p>
            <p>Carbs: ${food.carbs} g</p>
            <p>Fat: ${food.fat} g</p>
        </div>
        `;

        fragment.appendChild(card);
    });
    resultsDiv.appendChild(fragment);
}

// call function on page load
loadTSV().then(data => {
    foods = data;  // keep dataset in memory
    console.log("Dataset loaded:", foods.length, "foods");
    // DO NOT render here
});

// dataset function
async function loadTSV(){
    const response = await fetch("data/opennutrition_foods.tsv");
    const text = await response.text();

    const lines = text.split("\n").filter(line => line.trim() !== "");
    const parsedFoods = [];

for (const line of lines) {
    const parts = line.split("\t");

    const id = parts[0];
    const name = parts[1];
    const description = parts[3];
    const type = parts[4];
    const jsonString = parts[7]; // nutrition_100g column

    let nutrients ={}
    try {
        nutrients = JSON.parse(jsonString);
    } catch (err) {
        console.error("JSON parsing error for:", name, err);
        continue; // skip weird lines
    }

    parsedFoods.push({
        id,
        name,
        category: type,
        caloriesPer100g: nutrients.calories || "?",
        protein: nutrients.protein || "?",
        carbs: nutrients.carbohydrates || "?",
        fat: nutrients.total_fat || "?",
  //  imageName: "placeholder.avif"
    });
}

return parsedFoods;
}



//. search behavior
/** @type {HTMLInputElement} */
const searchBar = document.getElementById("searchBar");

searchBar.addEventListener("input", () => {
    const text = searchBar.value.toLowerCase();

    if(text.length < 2) {
        renderFoods([]); //show nothing
        return;
    }

    const filtered = foods.filter(food =>
        food.name.toLowerCase().includes(text)
    );
    
        //limit to first 20 results
renderFoods(filtered.slice(0,20));
});