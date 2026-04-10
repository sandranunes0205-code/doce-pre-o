import { Ingredient, Recipe, RecipeIngredient, PricingResult } from '@/types';

export function calculateIngredientCost(ingredient: Ingredient, quantityUsed: number): number {
  // price / quantityPerUnit * quantityUsed
  return (ingredient.price / ingredient.quantityPerUnit) * quantityUsed;
}

export function calculateRecipePricing(
  recipe: Recipe,
  ingredientsMap: Record<string, Ingredient>
): PricingResult {
  const ingredientsCost = recipe.ingredients.reduce((total, ri) => {
    const ingredient = ingredientsMap[ri.ingredientId];
    if (!ingredient) return total;
    return total + calculateIngredientCost(ingredient, ri.quantity);
  }, 0);

  const laborCost = (recipe.laborRate / 60) * recipe.laborTime;
  const subtotal = ingredientsCost + laborCost;
  
  const overheadCost = subtotal * (recipe.overheadPercentage / 100);
  const totalCost = subtotal + overheadCost;
  
  const profitAmount = totalCost * (recipe.profitPercentage / 100);
  const suggestedPrice = totalCost + profitAmount;
  
  const pricePerPortion = suggestedPrice / (recipe.yield || 1);

  return {
    ingredientsCost,
    laborCost,
    overheadCost,
    totalCost,
    profitAmount,
    suggestedPrice,
    pricePerPortion
  };
}

export const UNIT_LABELS: Record<string, string> = {
  kg: 'Quilograma (kg)',
  g: 'Grama (g)',
  l: 'Litro (l)',
  ml: 'Mililitro (ml)',
  un: 'Unidade (un)',
  pct: 'Pacote (pct)'
};
