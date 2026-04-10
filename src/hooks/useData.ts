import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Ingredient, Recipe } from '@/types';
import { handleFirestoreError, OperationType } from '@/lib/error-handler';

const PUBLIC_USER_ID = 'default-user';

export function useData() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const qIngredients = query(
      collection(db, 'ingredients'),
      where('uid', '==', PUBLIC_USER_ID),
      orderBy('createdAt', 'desc')
    );

    const unsubIngredients = onSnapshot(qIngredients, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
      setIngredients(data);
      setLoading(false);
    }, (error) => {
      console.error('Ingredients onSnapshot error:', error);
      setLoading(false);
      // We don't throw here to avoid hanging the app in a loading state
      // but we log it so it can be diagnosed
    });

    const qRecipes = query(
      collection(db, 'recipes'),
      where('uid', '==', PUBLIC_USER_ID),
      orderBy('createdAt', 'desc')
    );

    const unsubRecipes = onSnapshot(qRecipes, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      setRecipes(data);
    }, (error) => {
      console.error('Recipes onSnapshot error:', error);
    });

    return () => {
      unsubIngredients();
      unsubRecipes();
    };
  }, []);

  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'uid' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'ingredients'), {
        ...ingredient,
        uid: PUBLIC_USER_ID,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ingredients');
    }
  };

  const updateIngredient = async (id: string, ingredient: Partial<Ingredient>) => {
    try {
      const { id: _, ...data } = ingredient as any;
      await updateDoc(doc(db, 'ingredients', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `ingredients/${id}`);
    }
  };

  const deleteIngredient = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ingredients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ingredients/${id}`);
    }
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'uid' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'recipes'), {
        ...recipe,
        uid: PUBLIC_USER_ID,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'recipes');
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recipes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `recipes/${id}`);
    }
  };

  return {
    ingredients,
    recipes,
    loading,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addRecipe,
    deleteRecipe
  };
}
