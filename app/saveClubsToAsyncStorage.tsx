import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from "@/FirebaseConfig"; // Adjust based on your configuration

const saveClubsToAsyncStorage = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const userId = user.uid;
    const storedClubs = await AsyncStorage.getItem('userClubs');

    if (!storedClubs) {
      // Fetch clubs from Firestore
      const clubsCollectionRef = collection(FIREBASE_DB, 'users', userId, 'clubs');
      const clubsSnapshot = await getDocs(clubsCollectionRef);
      const clubs = clubsSnapshot.docs.map(doc => doc.data());

      // Store clubs in AsyncStorage
      await AsyncStorage.setItem('userClubs', JSON.stringify(clubs));
    }
  }
};

export default saveClubsToAsyncStorage;
