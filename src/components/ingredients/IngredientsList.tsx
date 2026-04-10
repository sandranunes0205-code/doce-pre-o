import { useState } from 'react';
import { Plus, Trash2, Edit2, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Ingredient, Unit } from '@/types';
import { UNIT_LABELS } from '@/lib/calculations';
import { toast } from 'sonner';

interface IngredientsListProps {
  ingredients: Ingredient[];
  onAdd: (ingredient: Omit<Ingredient, 'id' | 'uid' | 'createdAt'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function IngredientsList({ ingredients, onAdd, onDelete }: IngredientsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    unit: 'kg' as Unit,
    price: 0,
    quantityPerUnit: 1,
  });

  const filteredIngredients = ingredients.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!newIngredient.name || newIngredient.price <= 0 || newIngredient.quantityPerUnit <= 0) {
      toast.error('Por favor, preencha todos os campos corretamente.');
      return;
    }

    try {
      await onAdd(newIngredient);
      setIsAddOpen(false);
      setNewIngredient({ name: '', unit: 'kg', price: 0, quantityPerUnit: 1 });
      toast.success('Ingrediente adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar ingrediente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ingredientes..."
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
                Novo Ingrediente
              </Button>
            }
          />
          <DialogContent className="rounded-3xl sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Adicionar Ingrediente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Ingrediente</Label>
                <Input
                  id="name"
                  placeholder="Ex: Farinha de Trigo"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unidade de Compra</Label>
                  <Select 
                    value={newIngredient.unit} 
                    onValueChange={(v) => setNewIngredient({ ...newIngredient, unit: v as Unit })}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UNIT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Qtd. na Embalagem</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newIngredient.quantityPerUnit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantityPerUnit: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Preço de Compra (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newIngredient.price}
                  onChange={(e) => setNewIngredient({ ...newIngredient, price: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} className="w-full rounded-xl">Salvar Ingrediente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIngredients.map((ingredient) => (
          <Card key={ingredient.id} className="rounded-2xl border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-heading font-semibold">{ingredient.name}</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(ingredient.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground">Preço por {ingredient.unit}</p>
                  <p className="text-xl font-bold text-secondary">
                    R$ {(ingredient.price / ingredient.quantityPerUnit).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Embalagem: {ingredient.quantityPerUnit}{ingredient.unit}</p>
                  <p className="text-xs text-muted-foreground">Total: R$ {ingredient.price.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredIngredients.length === 0 && (
          <div className="col-span-full py-12 text-center bg-accent/30 rounded-3xl border-2 border-dashed border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">Nenhum ingrediente encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
