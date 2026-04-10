import { Cake, Calculator, Package, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'ingredients', label: 'Ingredientes', icon: Package },
    { id: 'recipes', label: 'Receitas', icon: Cake },
    { id: 'calculator', label: 'Calculadora', icon: Calculator },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:relative md:border-t-0 md:border-r md:w-64 md:h-screen p-4 z-50">
      <div className="flex md:flex-col justify-around md:justify-start gap-2 h-full">
        <div className="hidden md:flex items-center gap-2 px-4 py-6 mb-4">
          <Cake className="w-8 h-8 text-primary" />
          <span className="text-xl font-heading font-bold text-primary">DocePreço</span>
        </div>
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col md:flex-row items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs md:text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
