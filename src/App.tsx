import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { useData } from '@/hooks/useData';
import { IngredientsList } from '@/components/ingredients/IngredientsList';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Cake, LogIn, LogOut, Loader2 } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, ingredients, recipes, loading, addIngredient, deleteIngredient } = useData();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-xl">
              <Cake className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-heading font-bold text-secondary">DocePreço</h1>
            <p className="text-muted-foreground text-lg">
              A ferramenta definitiva para precificar suas criações na confeitaria.
            </p>
          </div>
          <Button onClick={handleLogin} size="lg" className="w-full gap-3 rounded-2xl py-6 text-lg shadow-lg">
            <LogIn className="w-6 h-6" />
            Entrar com Google
          </Button>
        </div>
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
              <p className="text-muted-foreground mt-1">Olá, {user.displayName}!</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
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
                  <p className="text-4xl font-bold mt-2 text-secondary">0%</p>
                </div>
              </div>
              
              <div className="bg-accent/20 p-8 rounded-3xl border border-border/50">
                <h3 className="text-xl mb-2">Dica do DocePreço</h3>
                <p className="text-muted-foreground">
                  Comece cadastrando seus ingredientes básicos para poder montar suas receitas e calcular o lucro real de cada doce.
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
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-muted-foreground py-12 text-center bg-white rounded-3xl border border-border">
                Em breve: Montagem de fichas técnicas e precificação detalhada.
              </p>
            </section>
          )}

          {activeTab === 'calculator' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-muted-foreground py-12 text-center bg-white rounded-3xl border border-border">
                Em breve: Simulação instantânea de preços.
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
