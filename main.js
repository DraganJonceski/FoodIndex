
// Food array
let foods = [];

const isGithubPages = location.hostname.endsWith("github.io");

// Modal elements
const modal = document.getElementById("foodModal");
const modalTitle = document.getElementById("modalTitle");
const modalCalories = document.getElementById("modalCalories");
const modalNutrients = document.getElementById("modalNutrients");
const modalClose = document.getElementById("modalClose");

// Results + search
const resultsDiv = document.getElementById("results");
/** @type {HTMLInputElement} */
const searchBar = document.getElementById("searchBar");

const STORAGE_KEY = "foodIndex_search";

// Keyword -> image map
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
    broccoli: "images/base/veggies.avif",
    chocolate: "images/base/chocolate.avif",
    //chocolate-bar: "images/base/bar.avif"
    tomato: "images/base/tomato.avif",
    soda: "images/base/soda.avif",
    pizza: "images/base/pizza.avif",
    hamburger: "images/base/hamburger.avif"
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

function formatValue(value, unit = "g") {
    if (value === undefined || value === null || value === "?") return "?";
    // simple rounding
    return `${Number(value.toFixed ? value.toFixed(2) : value)} ${unit}`;
}

function formatCaloriesShort(value){
    if(value ===undefined || value == null || value === "?") return "?"
    return Math.round(Number(value));
}

function formatMacroShort(value){
    if(value ===undefined || value == null || value === "?") return "?"
    return Number(value).toFixed(1);
}

function formatMacroDetailed(value, unit ="g") {
    if(value ===undefined || value == null || value === "?") return "?"
    return `${Number(value).toFixed(1)} ${unit}`;
}


// Modal open/close
function openFoodModal(food) {
    modalTitle.textContent = food.name;
    modalCalories.textContent = `${Number(food.caloriesPer100g || 0).toFixed(0)} kcal / 100g`;

    const n = food.nutrients || {};

    modalNutrients.innerHTML = `
      <p><strong>Protein:</strong> ${formatMacroDetailed(food.protein, "g")}</p>
      <p><strong>Carbs:</strong> ${formatMacroDetailed(food.carbs, "g")}</p>
      <p><strong>Fat:</strong> ${formatMacroDetailed(food.fat, "g")}</p>
      <hr>
      <p><strong>Fiber:</strong> ${formatValue(n.dietary_fiber, "g")}</p>
      <p><strong>Sugars:</strong> ${formatValue(n.total_sugars, "g")}</p>
      <p><strong>Sodium:</strong> ${formatValue(n.sodium, "mg")}</p>
      <p><strong>Calcium:</strong> ${formatValue(n.calcium, "mg")}</p>
      <p><strong>Iron:</strong> ${formatValue(n.iron, "mg")}</p>
      <p><strong>Vitamin C:</strong> ${formatValue(n.vitamin_c, "mg")}</p>
      `;

      modal.classList.remove("hidden");
      modalClose.focus(); // move focus to search
}

function closeFoodModal(){
    modal.classList.add("hidden");
    searchBar.focus(); //return focus to search
}

modalClose.addEventListener("click", closeFoodModal);
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeFoodModal(); // click outside closes
});

// Escape closes modal
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        closeFoodModal();
    }
})



// Render cards
function renderFoods(list, showEmptyMessage = false){
    resultsDiv.innerHTML = "";

    if(list.length === 0) {
      if(showEmptyMessage) {
        resultsDiv.innerHTML = "<p>No results.</p>";
      }
        return;
    }

    const fragment = document.createDocumentFragment();


    list.forEach(food => {
        const card = document.createElement("div");
        card.className = "food-card";
        //comented out from img src: food.imageURL ||
        card.innerHTML = `<img src="${pickImageForFood(food.name)}" 
        alt="${food.name}">
        <h3>${food.name}</h3>
        <p><strong>${formatCaloriesShort(food.caloriesPer100g,"")}</strong> kcal / 100g</p>
        <div class="nutrients">
            <p>Protein: ${formatMacroShort(food.protein)} g</p>
            <p>Carbs: ${formatMacroShort(food.carbs)} g</p>
            <p>Fat: ${formatMacroShort(food.fat)} g</p>
        </div>
        `;

        card.addEventListener("click", () => openFoodModal(food));

        fragment.appendChild(card);
    });
    resultsDiv.appendChild(fragment);
}
// Search logic
  function applySearch(text) {
    const q=text.toLowerCase().trim();

    if (q.length<2) {
        renderFoods([]);
        return;
    }

  // Exact match first
  const exact = foods.filter(f => f.name.toLowerCase() === q);
  if (exact.length) {
    renderFoods(exact.slice(0, 24));
    return;
  }

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

  renderFoods(ordered.slice(0, 24), true);
}

searchBar.addEventListener("input", () => {
  const text = searchBar.value;
  localStorage.setItem(STORAGE_KEY,text);
  // optional: quick "searching" state
  // resultsDiv.innerHTML = "<p>Searching...</p>"
  applySearch(text);
  });

  // Data loading
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
      if(jsonString && jsonString.trim() !=="")
        nutrients = JSON.parse(jsonString);
    } catch (err) {
        console.error("JSON parsing error for:", name, err);
        continue; // skip weird lines
    }

    parsedFoods.push({
        id,
        name,
        category: type,
        caloriesPer100g: nutrients.calories ?? "?",
        protein: nutrients.protein ?? "?",
        carbs: nutrients.carbohydrates ?? "?",
        fat: nutrients.total_fat ?? "?",
        nutrients // store full object
  //  imageName: "placeholder.avif"
    });
}

return parsedFoods;
}

// Initialize on page load
loadTSV().then(data => {
    foods = data;  // keep dataset in memory    
    console.log("Loaded foods:", foods.length);

    const last = localStorage.getItem(STORAGE_KEY) || "";
    if (last) {
        searchBar.value = last;
        applySearch(last);
    } else {
        renderFoods([]);
    }
}).catch(err => {
    console.error("Failed to load TSV", err);
    resultsDiv.innerHTML = "<p>Failed to load food data.</p>"
});