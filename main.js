
//1. Hardcoded Food array
const foods = [
     {
        name: "Banana",
        category: "Fruit",
        caloriesPer100g: 89,
        protein: 1.1,
        carbs: 23,
        fat: 0.3,
        imageName: "banana.avif" 
    },
    {
        name: "Apple",
        category: "Fruit",
        caloriesPer100g: 52,
        protein: 0.3,
        carbs: 14,
        fat: 0.2,
        imageName: "apple.avif"
    },
    { 
        name: "Bread",
        category: "Grain", 
        caloriesPer100g: 265,
        protein: 2,
        carbs: 13,
        fat: 1, 
        imageName: "bread.avif" },
    { 
        name: "Milk", 
        category: "Dairy", 
        caloriesPer100g: 42,
        protein: 8,
        carbs: 12,
        fat: 8, 
        imageName: "milk.avif" }
];
// 2. Render function
function renderFoods(list){
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    list.forEach(food => {
        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `<img src="images/${food.imageName}" alt="${food.name}"
        <h3>${food.name}<h3>
        <p><strong>${food.caloriesPer100g}</strong> kcal / 100g<p>

        <div class="nutrients">
            <p>Protein: ${food.protein} g</p>
            <p>Carbs: ${food.carbs} g</p>
            <p>Fat: ${food.fat} g</p>
        </div>
        `;

        resultsDiv.appendChild(card);
    });
}

// 3. call function on page load
renderFoods(foods);

// 4. search behavior
/** @type {HTMLInputElement} */
const searchBar = document.getElementById("searchBar");

searchBar.addEventListener("input", () => {
    const text = searchBar.value.toLowerCase();

    const filtered = foods.filter(food =>
        food.name.toLowerCase().includes(text)
    );
    
renderFoods(filtered);
});