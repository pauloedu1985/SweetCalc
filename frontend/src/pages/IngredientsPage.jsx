import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  createIngredient,
  getIngredients,
  updateIngredient,
  deleteIngredient,
} from '../services/ingredientService';

const categorias = ['Farinha', 'Laticínio', 'Fruta', 'Cobertura', 'Outros'];
const unidades = ['g', 'ml', 'unidade'];

const IngredientsPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    unidade: '',
    quantidadeComprada: '',
    precoTotal: '',
    dataCompra: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const data = await getIngredients();
      setIngredients(data);
    } catch (error) {
      toast.error('Erro ao carregar ingredientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        quantidadeComprada: parseFloat(formData.quantidadeComprada),
        precoTotal: parseFloat(formData.precoTotal),
      };

      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, data);
        toast.success('Ingrediente atualizado com sucesso!');
      } else {
        await createIngredient(data);
        toast.success('Ingrediente cadastrado com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      loadIngredients();
    } catch (error) {
      toast.error('Erro ao salvar ingrediente');
    }
  };

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      nome: ingredient.nome,
      categoria: ingredient.categoria,
      unidade: ingredient.unidade,
      quantidadeComprada: ingredient.quantidadeComprada.toString(),
      precoTotal: ingredient.precoTotal.toString(),
      dataCompra: ingredient.dataCompra || new Date().toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este ingrediente?')) {
      try {
        await deleteIngredient(id);
        toast.success('Ingrediente excluído com sucesso!');
        loadIngredients();
      } catch (error) {
        toast.error('Erro ao excluir ingrediente');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: '',
      unidade: '',
      quantidadeComprada: '',
      precoTotal: '',
      dataCompra: new Date().toISOString().split('T')[0],
    });
    setEditingIngredient(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ingredientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus ingredientes e controle de estoque
          </p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ingrediente
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : ingredients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum ingrediente cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando seus primeiros ingredientes
            </p>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Ingrediente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ingredient) => (
            <Card key={ingredient.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{ingredient.nome}</CardTitle>
                    <CardDescription>{ingredient.categoria}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(ingredient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(ingredient.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span className="font-medium">
                    {ingredient.quantidadeRestante} / {ingredient.quantidadeComprada}{' '}
                    {ingredient.unidade}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço Total:</span>
                  <span className="font-medium">
                    R$ {ingredient.precoTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço por {ingredient.unidade}:</span>
                  <span className="font-medium text-primary">
                    R$ {ingredient.precoPorUnidade.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data de Compra:</span>
                  <span className="font-medium">
                    {new Date(ingredient.dataCompra).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do ingrediente abaixo
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Farinha de Trigo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantidadeComprada">Quantidade</Label>
                  <Input
                    id="quantidadeComprada"
                    type="number"
                    step="0.01"
                    value={formData.quantidadeComprada}
                    onChange={(e) =>
                      setFormData({ ...formData, quantidadeComprada: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unidade">Unidade</Label>
                  <Select
                    value={formData.unidade}
                    onValueChange={(value) => setFormData({ ...formData, unidade: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="precoTotal">Preço Total (R$)</Label>
                <Input
                  id="precoTotal"
                  type="number"
                  step="0.01"
                  value={formData.precoTotal}
                  onChange={(e) => setFormData({ ...formData, precoTotal: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dataCompra">Data da Compra</Label>
                <Input
                  id="dataCompra"
                  type="date"
                  value={formData.dataCompra}
                  onChange={(e) => setFormData({ ...formData, dataCompra: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingIngredient ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IngredientsPage;
