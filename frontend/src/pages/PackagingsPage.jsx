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
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  createPackaging,
  getPackagings,
  updatePackaging,
  deletePackaging,
} from '../services/packagingService';

const PackagingsPage = () => {
  const [packagings, setPackagings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    quantidadeComprada: '',
    precoTotal: '',
  });

  useEffect(() => {
    loadPackagings();
  }, []);

  const loadPackagings = async () => {
    try {
      setLoading(true);
      const data = await getPackagings();
      setPackagings(data);
    } catch (error) {
      toast.error('Erro ao carregar embalagens');
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

      if (editingPackaging) {
        await updatePackaging(editingPackaging.id, data);
        toast.success('Embalagem atualizada com sucesso!');
      } else {
        await createPackaging(data);
        toast.success('Embalagem cadastrada com sucesso!');
      }

      setDialogOpen(false);
      resetForm();
      loadPackagings();
    } catch (error) {
      toast.error('Erro ao salvar embalagem');
    }
  };

  const handleEdit = (packaging) => {
    setEditingPackaging(packaging);
    setFormData({
      nome: packaging.nome,
      quantidadeComprada: packaging.quantidadeComprada.toString(),
      precoTotal: packaging.precoTotal.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta embalagem?')) {
      try {
        await deletePackaging(id);
        toast.success('Embalagem excluída com sucesso!');
        loadPackagings();
      } catch (error) {
        toast.error('Erro ao excluir embalagem');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      quantidadeComprada: '',
      precoTotal: '',
    });
    setEditingPackaging(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Embalagens</h1>
          <p className="text-muted-foreground">
            Gerencie suas embalagens e controle de estoque
          </p>
        </div>
        <Button onClick={handleOpenDialog} variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          Nova Embalagem
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : packagings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma embalagem cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando suas primeiras embalagens
            </p>
            <Button onClick={handleOpenDialog} variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Embalagem
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packagings.map((packaging) => (
            <Card key={packaging.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{packaging.nome}</CardTitle>
                    <CardDescription>Embalagem</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(packaging)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(packaging.id)}
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
                    {packaging.quantidadeRestante} / {packaging.quantidadeComprada} unidades
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço Total:</span>
                  <span className="font-medium">
                    R$ {packaging.precoTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço por unidade:</span>
                  <span className="font-medium text-secondary">
                    R$ {packaging.precoPorUnidade.toFixed(2)}
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
              {editingPackaging ? 'Editar Embalagem' : 'Nova Embalagem'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da embalagem abaixo
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
                  placeholder="Ex: Caixa de Papel Rosa"
                  required
                />
              </div>

              <div>
                <Label htmlFor="quantidadeComprada">Quantidade</Label>
                <Input
                  id="quantidadeComprada"
                  type="number"
                  step="1"
                  value={formData.quantidadeComprada}
                  onChange={(e) =>
                    setFormData({ ...formData, quantidadeComprada: e.target.value })
                  }
                  placeholder="Ex: 50"
                  required
                />
              </div>

              <div>
                <Label htmlFor="precoTotal">Preço Total (R$)</Label>
                <Input
                  id="precoTotal"
                  type="number"
                  step="0.01"
                  value={formData.precoTotal}
                  onChange={(e) => setFormData({ ...formData, precoTotal: e.target.value })}
                  placeholder="Ex: 75.00"
                  required
                />
              </div>

              {formData.quantidadeComprada && formData.precoTotal && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Preço por unidade:</p>
                  <p className="text-lg font-bold text-secondary">
                    R${' '}
                    {(
                      parseFloat(formData.precoTotal) /
                      parseFloat(formData.quantidadeComprada)
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="secondary">
                {editingPackaging ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackagingsPage;
