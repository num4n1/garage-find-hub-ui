import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

function shuffleArray<T>(array: T[]): T[] {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
}

export const fetchGaragesByService = async (service: string) => {
  try {
    const ref = collection(db, service);
    const snapshot = await getDocs(ref);

    const garages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return shuffleArray(garages);
  } catch (error) {
    console.error("Error fetching garages:", error);
    return [];
  }
};
