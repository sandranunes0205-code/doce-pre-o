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
import { db, auth } from '@/lib/firebase';
import { Ingredient, Recipe } from '@/types';
import { handleFirestoreError, OperationType } from '@/lib/error-handler';

export function useData() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        setIngredients([]);
        setRecipes([]);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const qIngredients = query(
      collection(db, 'ingredients'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubIngredients = onSnapshot(qIngredients, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
      setIngredients(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ingredients');
    });

    const qRecipes = query(
      collection(db, 'recipes'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubRecipes = onSnapshot(qRecipes, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      setRecipes(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'recipes');
    });

    return () => {
      unsubIngredients();
      unsubRecipes();
    };
  }, [user]);

  const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'ingredients'), {
        ...ingredient,
        uid: user.uid,
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
    if (!user) return;
    try {
      await addDoc(collection(db, 'recipes'), {
        ...recipe,
        uid: user.uid,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'recipes');
    }
  };

  return {
    user,
    ingredients,
    recipes,
    loading,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addRecipe
  };
}
