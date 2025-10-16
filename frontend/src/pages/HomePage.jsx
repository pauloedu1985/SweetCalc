import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, ChefHat, Plus } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold text-foreground">
          Bem-vindo ao SweetCalc
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Seu sistema completo de controle de custos para confeitaria artesanal.
          Gerencie ingredientes, embalagens e calcule o custo real das suas receitas.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <CardTitle>Ingredientes</CardTitle>
            </div>
            <CardDescription>
              Cadastre seus ingredientes com preços e quantidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/ingredients">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Gerenciar Ingredientes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-secondary" />
              <CardTitle>Embalagens</CardTitle>
            </div>
            <CardDescription>
              Controle suas embalagens e custos de empacotamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/packagings">
              <Button className="w-full" variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Gerenciar Embalagens
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-accent" />
              <CardTitle>Receitas</CardTitle>
            </div>
            <CardDescription>
              Crie receitas e calcule custos automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/recipes">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Criar Receitas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Como Funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                <h3 className="font-semibold">Cadastre</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Adicione seus ingredientes e embalagens com preços e quantidades compradas.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                <h3 className="font-semibold">Monte Receitas</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Crie suas receitas selecionando ingredientes e definindo quantidades.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                <h3 className="font-semibold">Calcule Custos</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Veja automaticamente o custo total e por unidade de cada receita.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
