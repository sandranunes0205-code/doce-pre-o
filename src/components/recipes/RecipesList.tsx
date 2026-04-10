import { useState } from 'react';
import { Plus, Trash2, Search, Utensils, Clock, DollarSign, Percent, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Ingredient, Recipe, RecipeIngredient } from '@/types';
import { calculateRecipePricing } from '@/lib/calculations';
import { toast } from 'sonner';

interface RecipesListProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onAdd: (recipe: Omit<Recipe, 'id' | 'uid' | 'createdAt'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function RecipesList({ recipes, ingredients, onAdd, onDelete }: RecipesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'uid' | 'createdAt'>>({
    name: '',
    ingredients: [],
    laborTime: 0,
    laborRate: 20,
    overheadPercentage: 10,
    profitPercentage: 30,
    yield: 1,
  });

  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState(0);

  const ingredientsMap = ingredients.reduce((acc, ing) => {
    acc[ing.id] = ing;
    return acc;
  }, {} as Record<string, Ingredient>);

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addIngredientToRecipe = () => {
    if (!selectedIngredientId || ingredientQuantity <= 0) {
      toast.error('Selecione um ingrediente e informe a quantidade.');
      return;
    }

    const existing = newRecipe.ingredients.find(ri => ri.ingredientId === selectedIngredientId);
    if (existing) {
      toast.error('Este ingrediente já foi adicionado.');
      return;
    }

    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, { ingredientId: selectedIngredientId, quantity: ingredientQuantity }]
    });
    setSelectedIngredientId('');
    setIngredientQuantity(0);
  };

  const removeIngredientFromRecipe = (id: string) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter(ri => ri.ingredientId !== id)
    });
  };

  const handleSaveRecipe = async () => {
    if (!newRecipe.name || newRecipe.ingredients.length === 0 || newRecipe.yield <= 0) {
      toast.error('Preencha os campos obrigatórios (Nome, Ingredientes e Rendimento).');
      return;
    }

    try {
      await onAdd(newRecipe);
      setIsAddOpen(false);
      setNewRecipe({
        name: '',
        ingredients: [],
        laborTime: 0,
        laborRate: 20,
        overheadPercentage: 10,
        profitPercentage: 30,
        yield: 1,
      });
      toast.success('Receita salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar receita.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar receitas..."
            className="pl-10 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl gap-2 w-full md:w-auto">
                <Plus className="w-4 h-4" />
                Nova Receita
              </Button>
            }
          />
          <DialogContent className="rounded-3xl sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Criar Nova Receita</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipe-name">Nome da Receita</Label>
                  <Input
                    id="recipe-name"
                    placeholder="Ex: Bolo de Chocolate Belga"
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                  />
                </div>

                <div className="space-y-4 p-4 bg-accent/20 rounded-2xl border border-border/50">
                  <h4 className="font-medium flex items-center gap-2">
                    <Utensils className="w-4 h-4" /> Ingredientes da Receita
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-1">
                      <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ingrediente" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map(ing => (
                            <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 md:col-span-2">
                      <Input
                        type="number"
                        placeholder="Qtd"
                        value={ingredientQuantity || ''}
                        onChange={(e) => setIngredientQuantity(Number(e.target.value))}
                      />
                      <Button type="button" variant="secondary" onClick={addIngredientToRecipe}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {newRecipe.ingredients.map(ri => {
                      const ing = ingredientsMap[ri.ingredientId];
                      return (
                        <div key={ri.ingredientId} className="flex justify-between items-center bg-white p-2 rounded-lg text-sm border border-border">
                          <span>{ing?.name} ({ri.quantity}{ing?.unit})</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeIngredientFromRecipe(ri.ingredientId)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Clock className="w-3 h-3" /> Tempo Mão de Obra (min)</Label>
                    <Input
                      type="number"
                      value={newRecipe.laborTime}
                      onChange={(e) => setNewRecipe({ ...newRecipe, laborTime: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><DollarSign className="w-3 h-3" /> Valor Hora (R$)</Label>
                    <Input
                      type="number"
                      value={newRecipe.laborRate}
                      onChange={(e) => setNewRecipe({ ...newRecipe, laborRate: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Percent className="w-3 h-3" /> Custos Fixos %</Label>
                    <Input
                      type="number"
                      value={newRecipe.overheadPercentage}
                      onChange={(e) => setNewRecipe({ ...newRecipe, overheadPercentage: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Percent className="w-3 h-3" /> Lucro %</Label>
                    <Input
                      type="number"
                      value={newRecipe.profitPercentage}
                      onChange={(e) => setNewRecipe({ ...newRecipe, profitPercentage: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Scale className="w-3 h-3" /> Rendimento (un)</Label>
                    <Input
                      type="number"
                      value={newRecipe.yield}
                      onChange={(e) => setNewRecipe({ ...newRecipe, yield: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="pt-4 border-t mt-4">
              <Button onClick={handleSaveRecipe} className="w-full rounded-xl">Salvar Receita e Calcular</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecipes.map((recipe) => {
          const pricing = calculateRecipePricing(recipe, ingredientsMap);
          return (
            <Card key={recipe.id} className="rounded-3xl border-border shadow-sm overflow-hidden border-2 hover:border-primary/30 transition-all">
              <CardHeader className="bg-accent/10 border-b border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-heading text-secondary">{recipe.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Rendimento: {recipe.yield} porções</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(recipe.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">Custo Ingredientes</p>
                    <p className="font-semibold">R$ {pricing.ingredientsCost.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-muted-foreground uppercase">Mão de Obra</p>
                    <p className="font-semibold">R$ {pricing.laborCost.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-dashed border-border flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Preço Sugerido (Total)</p>
                    <p className="text-2xl font-bold text-primary">R$ {pricing.suggestedPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase">Por Porção</p>
                    <p className="text-lg font-bold text-secondary">R$ {pricing.pricePerPortion.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 text-[10px] text-muted-foreground flex justify-between">
                <span>Lucro: R$ {pricing.profitAmount.toFixed(2)} ({recipe.profitPercentage}%)</span>
                <span>Custos Fixos: R$ {pricing.overheadCost.toFixed(2)}</span>
              </CardFooter>
            </Card>
          );
        })}

        {filteredRecipes.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-border">
            <Utensils className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
            <h3 className="text-lg font-medium text-muted-foreground">Nenhuma receita cadastrada</h3>
            <p className="text-sm text-muted-foreground mt-1">Clique em "Nova Receita" para começar a precificar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
