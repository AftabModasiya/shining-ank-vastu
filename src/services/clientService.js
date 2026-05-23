import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION_NAME = "clients";

export const saveClient = async (clientData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...clientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving client:", error);
    return { success: false, error: error.message };
  }
};

// Check if a client with the same name AND date of birth already exists
export const checkDuplicateClient = async (name, dob) => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const normalizedName = name.trim().toLowerCase();
    let duplicate = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const existingName = (data.name || "").trim().toLowerCase();
      if (existingName === normalizedName && data.dob === dob) {
        duplicate = { id: doc.id, ...data };
      }
    });
    return { success: true, duplicate };
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return { success: false, duplicate: null };
  }
};



export const getAllClients = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const clients = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: clients };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { success: false, error: error.message };
  }
};

export const updateClient = async (clientId, updatedData) => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    await updateDoc(clientRef, {
      ...updatedData,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating client:", error);
    return { success: false, error: error.message };
  }
};

export const deleteClient = async (clientId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, clientId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting client:", error);
    return { success: false, error: error.message };
  }
};
