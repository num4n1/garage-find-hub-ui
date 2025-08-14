import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { stableShuffleById } from "@/lib/sessionShuffle";

export const fetchGaragesByService = async (service: string, seed: number) => {
  try {
    const ref = collection(db, service);
    const snapshot = await getDocs(ref);

    const garages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{ id: string; [key: string]: any }>;

    return stableShuffleById(garages, seed);
  } catch (error) {
    console.error("Error fetching garages:", error);
    return [];
  }
};
