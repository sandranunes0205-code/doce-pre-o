export type Unit = 'kg' | 'g' | 'l' | 'ml' | 'un' | 'pct';

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  price: number;
  quantityPerUnit: number; // e.g., 1 for 1kg, 500 for 500g
  createdAt: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number; // quantity used in the recipe (in the same unit as ingredient or converted)
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  laborTime: number; // in minutes
  laborRate: number; // hourly rate
  overheadPercentage: number; // e.g., 10 for 10%
  profitPercentage: number; // e.g., 30 for 30%
  yield: number; // number of portions
  createdAt: number;
}

export interface PricingResult {
  ingredientsCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  profitAmount: number;
  suggestedPrice: number;
  pricePerPortion: number;
}
