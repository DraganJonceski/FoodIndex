
// Food array
let foods = [];

const isGithubPages = location.hostname.endsWith("github.io");

const imageByKeyword = {
    apple: "images/base/apple.avif",
    banana: "images/base/banana.avif",
    bread: "images/base/bread.avif",
    rice: "images/base/rice.avif",
    chicken: "images/base/chicken.avif",
    milk: "images/base/milk.avif",
    egg: "images/base/egg.avif",
    yogurt: "images/base/yogurt.avif",
    cookie: "images/base/cookie.avif",
    pasta: "images/base/pasta.avif",
    fish: "images/base/fish.avif",
    nut: "images/base/nuts.avif",
    almond: "images/base/nuts.avif",
    peanut: "images/base/nuts.avif",
    vegetable: "images/base/veggies.avif",
    carrot: "images/base/veggies.avif",
    broccoli: "images/base/veggies.avif"
    
}

function pickImageForFood(name) {
    const lower = name.toLowerCase();

    for (const [key, url] of Object.entries(imageByKeyword)) {
        if (lower.includes(key)) {
            return url;
        }
    }

    return "images/placeholder.avif";
}



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
        <img src="${food.imageURL || pickImageForFood(food.name)}" 
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
    const url = isGithubPages
    ? "data/opennutrition_foods_small.tsv"
    : "data/opennutrition_foods.tsv"; // local full dataset

    const response = await fetch(url);
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
        .split(' ')              // split into words
        .slice(0, 3)            //take first 3 words
        .join(' ')
        .trim();
}

//image loading
async function fetchImageForFood(name) {
    const search = generateSearchTerm(name);
    const url = `https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(search)}&search_simple=1&page_size=50`;

    console.log("Searching OpenFFoodFacts for:", search);

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

        // Normalize strings for comparison
        const target = name.toLowerCase().replace(/,.*/, "").replace(/\(.*?\)/g,"").trim();

        const productWithImage = data.products.find(p=>
            p.image_front_url || p.image_url || p.image_medium_url || p.image_small_url
        );

        if(!productWithImage) return null;

        const urlImage =
          productWithImage.image_front_url ||
          productWithImage.image_medium_url ||
          productWithImage.image_url ||
          productWithImage.image_small_url ||
          null;   


        console.log("Chosen image for", name, "->", urlImage);
        return urlImage;
        } catch (err) {
        console.warn("Image fetch failed for:", name, err);
        return null;
    }
}



// search behavior
/** @type {HTMLInputElement} */
const searchBar = document.getElementById("searchBar");

searchBar.addEventListener("input", () => {
  const text = searchBar.value.toLowerCase().trim();

  if (text.length < 2) {
    renderFoods([]); // show nothing
    return;
  }

  const q = text;

  // 1) Exact name match -> show only that food which is searched
  const exact = foods.filter(f => f.name.toLowerCase() === q);
  if (exact.length) {
    renderFoods(exact.slice(0, 24));
    return;
  }

  // 2) Otherwise, rank results: startsWith > wordMatch > contains
  const startsWith = [];
  const wordMatch = [];
  const contains = [];

  for (const food of foods) {
    const name = food.name.toLowerCase();
    const words = name.split(/\s+/);

    if (name.startsWith(q)) {
      startsWith.push(food);
    } else if (words.includes(q)) {
      wordMatch.push(food);
    } else if (name.includes(q)) {
      contains.push(food);
    }
  }

  const ordered = [...startsWith, ...wordMatch, ...contains];

  // 3) Limit to first 24
  renderFoods(ordered.slice(0, 24));
});
