import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { useData } from '@/hooks/useData';
import { IngredientsList } from '@/components/ingredients/IngredientsList';
import { RecipesList } from '@/components/recipes/RecipesList';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Cake, Loader2 } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { ingredients, recipes, loading, addIngredient, deleteIngredient, addRecipe, deleteRecipe } = useData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl text-secondary font-heading">
                {activeTab === 'dashboard' && 'Painel de Controle'}
                {activeTab === 'ingredients' && 'Ingredientes'}
                {activeTab === 'recipes' && 'Minhas Receitas'}
                {activeTab === 'calculator' && 'Calculadora'}
              </h1>
              <p className="text-muted-foreground mt-1">Bem-vindo ao DocePreço!</p>
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Ingredientes</p>
                  <p className="text-4xl font-bold mt-2 text-secondary">{ingredients.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Receitas</p>
                  <p className="text-4xl font-bold mt-2 text-secondary">{recipes.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Margem Média</p>
                  <p className="text-4xl font-bold mt-2 text-secondary">
                    {recipes.length > 0 
                      ? `${Math.round(recipes.reduce((acc, r) => acc + r.profitPercentage, 0) / recipes.length)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
              
              <div className="bg-accent/20 p-8 rounded-3xl border border-border/50">
                <h3 className="text-xl mb-2">Dica do DocePreço</h3>
                <p className="text-muted-foreground">
                  {ingredients.length === 0 
                    ? "Comece cadastrando seus ingredientes básicos para poder montar suas receitas."
                    : recipes.length === 0
                    ? "Agora que você tem ingredientes, crie sua primeira receita para ver o lucro real!"
                    : "Mantenha seus preços de ingredientes atualizados para garantir que sua margem de lucro seja real."}
                </p>
              </div>
            </section>
          )}

          {activeTab === 'ingredients' && (
            <IngredientsList 
              ingredients={ingredients} 
              onAdd={addIngredient} 
              onDelete={deleteIngredient} 
            />
          )}

          {activeTab === 'recipes' && (
            <RecipesList 
              recipes={recipes}
              ingredients={ingredients}
              onAdd={addRecipe}
              onDelete={deleteRecipe}
            />
          )}

          {activeTab === 'calculator' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-muted-foreground py-12 text-center bg-white rounded-3xl border border-border">
                Em breve: Simulação instantânea de preços e conversão de medidas.
              </p>
            </section>
          )}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
