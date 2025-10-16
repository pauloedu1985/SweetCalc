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

const COLLECTION_NAME = 'ingredientes';

export const createIngredient = async (ingredientData) => {
  try {
    const precoPorUnidade = ingredientData.precoTotal / ingredientData.quantidadeComprada;
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...ingredientData,
      precoPorUnidade,
      quantidadeRestante: ingredientData.quantidadeComprada,
      createdAt: new Date().toISOString()
    });
    
    return { id: docRef.id, ...ingredientData, precoPorUnidade };
  } catch (error) {
    console.error('Error creating ingredient:', error);
    throw error;
  }
};

export const getIngredients = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting ingredients:', error);
    throw error;
  }
};

export const updateIngredient = async (id, ingredientData) => {
  try {
    const precoPorUnidade = ingredientData.precoTotal / ingredientData.quantidadeComprada;
    
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...ingredientData,
      precoPorUnidade,
      updatedAt: new Date().toISOString()
    });
    
    return { id, ...ingredientData, precoPorUnidade };
  } catch (error) {
    console.error('Error updating ingredient:', error);
    throw error;
  }
};

export const deleteIngredient = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    throw error;
  }
};

export const updateIngredientStock = async (id, quantidadeUsada) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const ingredientDoc = await getDocs(query(collection(db, COLLECTION_NAME)));
    const ingredient = ingredientDoc.docs.find(d => d.id === id)?.data();
    
    if (ingredient) {
      const novaQuantidade = ingredient.quantidadeRestante - quantidadeUsada;
      await updateDoc(docRef, {
        quantidadeRestante: novaQuantidade,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating ingredient stock:', error);
    throw error;
  }
};
