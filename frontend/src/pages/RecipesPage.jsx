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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, ChefHat, Play, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  createRecipe,
  getRecipes,
  deleteRecipe,
  produceRecipe,
} from '../services/recipeService';
import { getIngredients } from '../services/ingredientService';
import { getPackagings } from '../services/packagingService';

const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [packagings, setPackagings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    etapas: [{ nomeEtapa: 'Massa', ingredientes: [] }],
    embalagem: null,
    rendimento: '1',
    precoVenda: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recipesData, ingredientsData, packagingsData] = await Promise.all([
        getRecipes(),
        getIngredients(),
        getPackagings(),
      ]);
      setRecipes(recipesData);
      setIngredients(ingredientsData);
      setPackagings(packagingsData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const calculateRecipeCost = (recipe) => {
    let custoTotal = 0;

    // Calculate ingredients cost
    recipe.etapas.forEach((etapa) => {
      etapa.ingredientes.forEach((ing) => {
        custoTotal += ing.custoCalculado;
      });
    });

    // Add packaging cost
    if (recipe.embalagem && recipe.embalagem.custoCalculado) {
      custoTotal += recipe.embalagem.custoCalculado;
    }

    return custoTotal;
  };

  const addEtapa = () => {
    setFormData({
      ...formData,
      etapas: [...formData.etapas, { nomeEtapa: '', ingredientes: [] }],
    });
  };

  const removeEtapa = (index) => {
    const newEtapas = formData.etapas.filter((_, i) => i !== index);
    setFormData({ ...formData, etapas: newEtapas });
  };

  const updateEtapaNome = (index, nome) => {
    const newEtapas = [...formData.etapas];
    newEtapas[index].nomeEtapa = nome;
    setFormData({ ...formData, etapas: newEtapas });
  };

  const addIngredientToEtapa = (etapaIndex, ingredientId, quantidade) => {
    const ingredient = ingredients.find((i) => i.id === ingredientId);
    if (!ingredient) return;

    const custoCalculado = ingredient.precoPorUnidade * parseFloat(quantidade);
    
    const newEtapas = [...formData.etapas];
    const existingIndex = newEtapas[etapaIndex].ingredientes.findIndex(
      (i) => i.idIngrediente === ingredientId
    );

    if (existingIndex >= 0) {
      newEtapas[etapaIndex].ingredientes[existingIndex].quantidadeUsada =
        parseFloat(quantidade);
      newEtapas[etapaIndex].ingredientes[existingIndex].custoCalculado = custoCalculado;
    } else {
      newEtapas[etapaIndex].ingredientes.push({
        idIngrediente: ingredientId,
        nomeIngrediente: ingredient.nome,
        quantidadeUsada: parseFloat(quantidade),
        unidade: ingredient.unidade,
        custoCalculado,
      });
    }

    setFormData({ ...formData, etapas: newEtapas });
  };

  const removeIngredientFromEtapa = (etapaIndex, ingredientIndex) => {
    const newEtapas = [...formData.etapas];
    newEtapas[etapaIndex].ingredientes = newEtapas[etapaIndex].ingredientes.filter(
      (_, i) => i !== ingredientIndex
    );
    setFormData({ ...formData, etapas: newEtapas });
  };

  const addPackaging = (packagingId, quantidade) => {
    const packaging = packagings.find((p) => p.id === packagingId);
    if (!packaging) return;

    const custoCalculado = packaging.precoPorUnidade * parseFloat(quantidade);

    setFormData({
      ...formData,
      embalagem: {
        idEmbalagem: packagingId,
        nomeEmbalagem: packaging.nome,
        quantidadeUsada: parseFloat(quantidade),
        custoCalculado,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const custoTotal = calculateRecipeCost(formData);
      const rendimento = parseFloat(formData.rendimento);
      const custoPorUnidade = custoTotal / rendimento;
      const precoVenda = formData.precoVenda ? parseFloat(formData.precoVenda) : 0;
      const lucro = precoVenda ? (precoVenda - custoPorUnidade) * rendimento : 0;

      const recipeData = {
        ...formData,
        rendimento,
        precoVenda,
        custoTotal,
        custoPorUnidade,
        lucro,
      };

      await createRecipe(recipeData);
      toast.success('Receita criada com sucesso!');
      
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar receita');
    }
  };

  const handleProduceRecipe = async (recipe) => {
    if (
      window.confirm(
        `Deseja produzir esta receita? Isso irá deduzir os ingredientes e embalagens do estoque.`
      )
    ) {
      try {
        await produceRecipe(recipe);
        toast.success('Receita produzida! Estoque atualizado.');
        loadData();
      } catch (error) {
        toast.error('Erro ao produzir receita');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta receita?')) {
      try {
        await deleteRecipe(id);
        toast.success('Receita excluída com sucesso!');
        loadData();
      } catch (error) {
        toast.error('Erro ao excluir receita');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      etapas: [{ nomeEtapa: 'Massa', ingredientes: [] }],
      embalagem: null,
      rendimento: '1',
      precoVenda: '',
    });
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const viewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setViewDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Receitas</h1>
          <p className="text-muted-foreground">
            Crie receitas e calcule custos automaticamente
          </p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : recipes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma receita cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira receita
            </p>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Receita
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{recipe.nome}</CardTitle>
                    <CardDescription>
                      Rende {recipe.rendimento} {recipe.rendimento > 1 ? 'unidades' : 'unidade'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => viewRecipe(recipe)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(recipe.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo Total:</span>
                  <span className="font-medium">R$ {recipe.custoTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo/Unidade:</span>
                  <span className="font-medium text-primary">
                    R$ {recipe.custoPorUnidade.toFixed(2)}
                  </span>
                </div>
                {recipe.precoVenda > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Preço de Venda:</span>
                      <span className="font-medium">R$ {recipe.precoVenda.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lucro:</span>
                      <span className="font-medium text-green-600">
                        R$ {recipe.lucro.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => handleProduceRecipe(recipe)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Produzir Receita
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Recipe Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Receita</DialogTitle>
            <DialogDescription>
              Monte sua receita passo a passo e veja o custo em tempo real
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label htmlFor="nome">Nome da Receita</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Bolo de Chocolate"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rendimento">Rendimento (unidades)</Label>
                  <Input
                    id="rendimento"
                    type="number"
                    step="1"
                    min="1"
                    value={formData.rendimento}
                    onChange={(e) => setFormData({ ...formData, rendimento: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="precoVenda">Preço de Venda (R$) - Opcional</Label>
                  <Input
                    id="precoVenda"
                    type="number"
                    step="0.01"
                    value={formData.precoVenda}
                    onChange={(e) => setFormData({ ...formData, precoVenda: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Etapas */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Etapas da Receita</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addEtapa}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Etapa
                  </Button>
                </div>

                <Tabs defaultValue="0" className="w-full">
                  <TabsList className="w-full">
                    {formData.etapas.map((etapa, index) => (
                      <TabsTrigger key={index} value={index.toString()}>
                        {etapa.nomeEtapa || `Etapa ${index + 1}`}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {formData.etapas.map((etapa, etapaIndex) => (
                    <TabsContent key={etapaIndex} value={etapaIndex.toString()}>
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <Input
                              value={etapa.nomeEtapa}
                              onChange={(e) => updateEtapaNome(etapaIndex, e.target.value)}
                              placeholder="Nome da etapa (ex: Massa, Recheio)"
                              className="max-w-xs"
                            />
                            {formData.etapas.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEtapa(etapaIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <IngredientSelector
                            ingredients={ingredients}
                            onAdd={(ingredientId, quantidade) =>
                              addIngredientToEtapa(etapaIndex, ingredientId, quantidade)
                            }
                          />

                          {etapa.ingredientes.length > 0 && (
                            <div className="space-y-2">
                              <Label>Ingredientes Adicionados:</Label>
                              {etapa.ingredientes.map((ing, ingIndex) => (
                                <div
                                  key={ingIndex}
                                  className="flex justify-between items-center p-2 bg-muted rounded"
                                >
                                  <span className="text-sm">
                                    {ing.nomeIngrediente} - {ing.quantidadeUsada} {ing.unidade}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-primary">
                                      R$ {ing.custoCalculado.toFixed(2)}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        removeIngredientFromEtapa(etapaIndex, ingIndex)
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Embalagem */}
              <div>
                <Label>Embalagem (Opcional)</Label>
                <PackagingSelector
                  packagings={packagings}
                  selectedPackaging={formData.embalagem}
                  onAdd={(packagingId, quantidade) => addPackaging(packagingId, quantidade)}
                  onRemove={() => setFormData({ ...formData, embalagem: null })}
                />
              </div>

              {/* Custo Summary */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>Resumo de Custos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Custo Total:</span>
                    <span className="font-bold text-lg">
                      R$ {calculateRecipeCost(formData).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo por Unidade:</span>
                    <span className="font-bold text-lg text-primary">
                      R${' '}
                      {(
                        calculateRecipeCost(formData) / parseFloat(formData.rendimento || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                  {formData.precoVenda && parseFloat(formData.precoVenda) > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>Preço de Venda (unidade):</span>
                        <span className="font-bold">R$ {parseFloat(formData.precoVenda).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lucro Total Estimado:</span>
                        <span className="font-bold text-green-600">
                          R${' '}
                          {(
                            (parseFloat(formData.precoVenda) -
                              calculateRecipeCost(formData) /
                                parseFloat(formData.rendimento || 1)) *
                            parseFloat(formData.rendimento || 1)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Receita</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Recipe Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRecipe?.nome}</DialogTitle>
            <DialogDescription>
              Rende {selectedRecipe?.rendimento}{' '}
              {selectedRecipe?.rendimento > 1 ? 'unidades' : 'unidade'}
            </DialogDescription>
          </DialogHeader>
          {selectedRecipe && (
            <div className="space-y-4">
              {selectedRecipe.etapas.map((etapa, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{etapa.nomeEtapa}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {etapa.ingredientes.map((ing, ingIndex) => (
                      <div
                        key={ingIndex}
                        className="flex justify-between text-sm p-2 bg-muted rounded"
                      >
                        <span>
                          {ing.nomeIngrediente} - {ing.quantidadeUsada} {ing.unidade}
                        </span>
                        <span className="font-medium text-primary">
                          R$ {ing.custoCalculado.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {selectedRecipe.embalagem && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Embalagem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm p-2 bg-muted rounded">
                      <span>
                        {selectedRecipe.embalagem.nomeEmbalagem} -{' '}
                        {selectedRecipe.embalagem.quantidadeUsada} unidades
                      </span>
                      <span className="font-medium text-primary">
                        R$ {selectedRecipe.embalagem.custoCalculado.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-2">
                  <div className="flex justify-between">
                    <span>Custo Total:</span>
                    <span className="font-bold">R$ {selectedRecipe.custoTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo por Unidade:</span>
                    <span className="font-bold text-primary">
                      R$ {selectedRecipe.custoPorUnidade.toFixed(2)}
                    </span>
                  </div>
                  {selectedRecipe.precoVenda > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>Preço de Venda:</span>
                        <span className="font-bold">
                          R$ {selectedRecipe.precoVenda.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lucro Total:</span>
                        <span className="font-bold text-green-600">
                          R$ {selectedRecipe.lucro.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewDialogOpen(false);
                handleProduceRecipe(selectedRecipe);
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Produzir Receita
            </Button>
            <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper Components
const IngredientSelector = ({ ingredients, onAdd }) => {
  const [selectedId, setSelectedId] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const handleAdd = () => {
    if (selectedId && quantidade) {
      onAdd(selectedId, quantidade);
      setSelectedId('');
      setQuantidade('');
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um ingrediente" />
          </SelectTrigger>
          <SelectContent>
            {ingredients.map((ing) => (
              <SelectItem key={ing.id} value={ing.id}>
                {ing.nome} (R$ {ing.precoPorUnidade.toFixed(4)}/{ing.unidade}) - Estoque:{' '}
                {ing.quantidadeRestante}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input
        type="number"
        step="0.01"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
        placeholder="Qtd"
        className="w-24"
      />
      <Button type="button" onClick={handleAdd} disabled={!selectedId || !quantidade}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

const PackagingSelector = ({ packagings, selectedPackaging, onAdd, onRemove }) => {
  const [selectedId, setSelectedId] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const handleAdd = () => {
    if (selectedId && quantidade) {
      onAdd(selectedId, quantidade);
      setSelectedId('');
      setQuantidade('');
    }
  };

  if (selectedPackaging) {
    return (
      <div className="flex justify-between items-center p-2 bg-muted rounded">
        <span className="text-sm">
          {selectedPackaging.nomeEmbalagem} - {selectedPackaging.quantidadeUsada} unidades
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">
            R$ {selectedPackaging.custoCalculado.toFixed(2)}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma embalagem" />
          </SelectTrigger>
          <SelectContent>
            {packagings.map((pack) => (
              <SelectItem key={pack.id} value={pack.id}>
                {pack.nome} (R$ {pack.precoPorUnidade.toFixed(2)}/un) - Estoque:{' '}
                {pack.quantidadeRestante}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input
        type="number"
        step="1"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
        placeholder="Qtd"
        className="w-24"
      />
      <Button type="button" onClick={handleAdd} disabled={!selectedId || !quantidade}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default RecipesPage;
