import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { updateIngredientStock } from './ingredientService';
import { updatePackagingStock } from './packagingService';

const COLLECTION_NAME = 'receitas';

export const createRecipe = async (recipeData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...recipeData,
      createdAt: new Date().toISOString()
    });
    
    return { id: docRef.id, ...recipeData };
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
};

export const getRecipes = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting recipes:', error);
    throw error;
  }
};

export const updateRecipe = async (id, recipeData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...recipeData,
      updatedAt: new Date().toISOString()
    });
    
    return { id, ...recipeData };
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

export const produceRecipe = async (recipe) => {
  try {
    // Update ingredient stocks
    for (const etapa of recipe.etapas) {
      for (const ingrediente of etapa.ingredientes) {
        await updateIngredientStock(ingrediente.idIngrediente, ingrediente.quantidadeUsada);
      }
    }
    
    // Update packaging stock if exists
    if (recipe.embalagem && recipe.embalagem.idEmbalagem) {
      await updatePackagingStock(recipe.embalagem.idEmbalagem, recipe.embalagem.quantidadeUsada);
    }
    
    return true;
  } catch (error) {
    console.error('Error producing recipe:', error);
    throw error;
  }
};
