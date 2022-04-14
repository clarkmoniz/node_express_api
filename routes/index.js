const fs = require('fs');
const data = require('../data.json');

const RECIPE_STORE = loadRecipes();

function loadRecipes() {
    return data.recipes.reduce((recipes, recipe) => {
        recipes[recipe.name] = recipe;
        return recipes;
    }, {});
}

function saveRecipes(recipeStore) {
    try {

        const data = { recipes: Object.values(recipeStore) };
        fs.writeFileSync('./data.json', JSON.stringify(data, null, 2))

    } catch {

        return false;
    }

    return true;
}

function getAllRecipeNames(recipeStore) {
    return Object.keys(recipeStore);
}

function getRecipe(recipeStore, name) {
    return recipeStore[name];
}

function upsertRecipe(recipeStore, recipe) {
    recipeStore[recipe.name] = recipe;
    return saveRecipes(recipeStore);
}

module.exports = (app) => {
    /**
     * GET /recipes 
     * Returns a list of recipe names
     */
    app.get('/recipes', (req, res) => {
        const recipeNames = getAllRecipeNames(RECIPE_STORE);
        res.status(200).json({ recipeNames });
    });


    /**
     * GET /recipes/details/:recipeName
     * Returns the ingredients and number of steps for a given recipe
     */
    app.get("/recipes/details/:recipeName", (req, res) => {
        const { recipeName } = req.params;
        const recipe = getRecipe(RECIPE_STORE, recipeName);

        if (recipe) {
            const { ingredients, instructions } = recipe;

            res.status(200).json({ 
                details: {
                    ingredients, 
                    numSteps: instructions.length
                }
            });
        } else {
            res.status(200).json({});
        }
    });


    /**
     * POST /recipes
     * Creates a new recipe if it does not exist already, otherwise throws an error
     */
    app.post('/recipes', (req, res) => {
        const recipeName = req.body.name;
        const recipe = getRecipe(RECIPE_STORE, recipeName);

        if (recipe) {
           res.status(400).json({ error: "Recipe already exists" });
           return;
        }
        console.log("hello")
        if (upsertRecipe(RECIPE_STORE, req.body)) {
            console.log("hello2")
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    });


    /**
     * PUT /recipes
     * Updates a recipe if it exists, otherwise throws an error
     */
    app.put('/recipes', (req, res) => {
        const recipeName = req.body.name;
        const recipe = getRecipe(RECIPE_STORE, recipeName);

        if (!recipe) {
            res.status(400).json({ error: "Recipe does not exist" });
            return;
        }

        if (upsertRecipe(RECIPE_STORE, req.body)) {
            res.sendStatus(204);
        } else {
            res.sendStatus(400);
        }
    });
}