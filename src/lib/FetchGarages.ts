import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";

export const fetchGaragesByService = async (serviceName: string) => {
  const querySnapshot = await getDocs(collection(db, serviceName));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
};
