
//1. Hardcoded Food array
const foods = [
    { name: "Banana", category: "Fruit", caloriesPer100g: 89, imageName: "banana.png" },
    { name: "Apple", category: "Fruit", caloriesPer100g: 52, imageName: "apple.png" },
    { name: "Bread", category: "Grain", caloriesPer100g: 265, imageName: "bread.png" },
    { name: "Milk", category: "Dairy", caloriesPer100g: 42, imageName: "milk.png" }
];
// 2. Render function
function renderFoods(list){
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    list.forEach(food => {
        const row = document.createElement("p");
        row.textContent = `${food.name} - ${food.caloriesPer100g} kcal /100g`;
        resultsDiv.appendChild(row);

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