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

const COLLECTION_NAME = 'embalagens';

export const createPackaging = async (packagingData) => {
  try {
    const precoPorUnidade = packagingData.precoTotal / packagingData.quantidadeComprada;
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...packagingData,
      precoPorUnidade,
      quantidadeRestante: packagingData.quantidadeComprada,
      createdAt: new Date().toISOString()
    });
    
    return { id: docRef.id, ...packagingData, precoPorUnidade };
  } catch (error) {
    console.error('Error creating packaging:', error);
    throw error;
  }
};

export const getPackagings = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting packagings:', error);
    throw error;
  }
};

export const updatePackaging = async (id, packagingData) => {
  try {
    const precoPorUnidade = packagingData.precoTotal / packagingData.quantidadeComprada;
    
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...packagingData,
      precoPorUnidade,
      updatedAt: new Date().toISOString()
    });
    
    return { id, ...packagingData, precoPorUnidade };
  } catch (error) {
    console.error('Error updating packaging:', error);
    throw error;
  }
};

export const deletePackaging = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting packaging:', error);
    throw error;
  }
};

export const updatePackagingStock = async (id, quantidadeUsada) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const packagingDoc = await getDocs(query(collection(db, COLLECTION_NAME)));
    const packaging = packagingDoc.docs.find(d => d.id === id)?.data();
    
    if (packaging) {
      const novaQuantidade = packaging.quantidadeRestante - quantidadeUsada;
      await updateDoc(docRef, {
        quantidadeRestante: novaQuantidade,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating packaging stock:', error);
    throw error;
  }
};
