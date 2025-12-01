
// Food array
let foods = [];

// Render function
function renderFoods(list){
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if(list.length === 0) {
        resultsDiv.innerHTML = "<p>No results.</p>";
        return;
    }

    const fragment = document.createDocumentFragment();


    list.forEach(food => {
        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `
        <img src="${food.imageURL || 'images/placeholder.avif'}" 
        alt="${food.name}">
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
loadTSV().then(async data => {
    foods = data;  // keep dataset in memory

    // Fetch images for foods
    for( const food of foods) {
        food.imageURL= await fetchImageForFood(food.name);
        console.log(food.imageURL);
    }

    console.log("Loaded foods:", foods.length);
    renderFoods([]) // start empty
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

//helper imageSearch
function generateSearchTerm(foodName) {
    return foodName
        .toLowerCase()
        .replace(/,.*/, "")       //remove everything after comma
        .replace(/\(.*?\)/g, "")  //remove parentheses
        .split(" ")              // split into words
        .slice(0, 2)            //take first 2 words
        .join(" ")
        .trim();
}

//image loading
async function fetchImageForFood(name) {

    const search = generateSearchTerm(name);
    
    const url = `https://world.openfoodfacts.org/api/v2/search?categories_tags_en=${encodeURIComponent(search)}&page_size=10`;
    
    console.log("Searching OFF for:", search);


    try{
        const res = await fetch(url, {
            headers: {
                "User-Agent": "FoodIndex/1.0 (jonceski032@gmail.com)"
            }
         });

         if(!res.ok) {
            console.warn(`Image search failed: ${res.status} ${res.statusText}`);
            return null;
         }

        const data = await res.json();

        if((!data.products || data.products.length === 0)) {
            return null;
        }

        const p = data.products[0];
        console.log('OFF product for', search, p.product_name, p.image_front_url);

        return (
         p.image_medium_url ||
         p.image_front_url ||
         p.image_url ||
         p.image_small_url ||
         null   
        ); 

            
        } catch (err) {
        console.warn("Image fetch failed for:", name);
    }
    
    return null;
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