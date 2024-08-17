import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Club } from "@/interfaces/club";
import { Link } from "expo-router";
import Colors from "@/constants/Colors";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { doc, getDocs, collection, setDoc } from "firebase/firestore";
import { useClubContext } from "@/components/ClubContext"; // Import the custom hook

interface Props {
  category: string;
}

const ClubList = ({ category }: Props) => {
  const listRef = useRef<FlatList>(null);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const { clubsCache, setClubsCache } = useClubContext(); // Use context

  useEffect(() => {
    const fetchAndCacheClubs = async () => {
      try {
        const clubsCollectionRef = collection(FIREBASE_DB, "clubs");
        const clubsSnapshot = await getDocs(clubsCollectionRef);

        const clubsArray: Club[] = [];

        clubsSnapshot.forEach((docSnap) => {
          const clubData = docSnap.data() as Partial<Club>; // Partial to handle missing fields
          const clubWithDefaults: Club = {
            name: clubData.name || "",
            imageURL: clubData.imageURL || "",
            id: clubData.id ?? 0,
            longDescription: clubData.longDescription || "",
            sponsorEmail: clubData.sponsorEmail || "",
            categories: clubData.categories || [],
            dateDates: clubData.dateDates || [],
            dateNames: clubData.dateNames || [],
            pastEventDescriptions: clubData.pastEventDescriptions || [],
            pastEventNames: clubData.pastEventNames || [],
            pastEventURLs: clubData.pastEventURLs || [],
          };

          // Add the club data with defaults to the array
          clubsArray.push(clubWithDefaults);
        });

        // Store the cached clubs array in the admin collection
        const adminCacheRef = doc(FIREBASE_DB, "admin", "CachedClubs");
        await setDoc(adminCacheRef, { clubs: clubsArray });

        // Cache the clubs data in the context
        setClubsCache(clubsArray);

        // Filter clubs by category
        const filtered = clubsArray.filter((club) =>
          club.categories.includes(category)
        );
        setFilteredClubs(filtered);
      } catch (error) {
        // Handle error
        console.error("Error fetching or caching clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCacheClubs();
  }, [category, setClubsCache]);

  const renderRow: ListRenderItem<Club> = ({ item }) => (
    <Link
      href={`/clubPage/${item.name}`}
      asChild
      style={{
        marginHorizontal: 25,
        marginVertical: 10,
      }}
    >
      <TouchableOpacity>
        <View style={styles.club}>
          <ImageBackground
            source={{ uri: item.imageURL }}
            style={styles.image}
            resizeMode="cover"
            imageStyle={{ borderRadius: 15 }}
          >
            <Text style={styles.nameText}>{item.name}</Text>
          </ImageBackground>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={{ marginBottom: 100 }}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#ff4d00"
          style={{ alignSelf: "center", marginTop: 100 }}
        />
      ) : (
        <FlatList
          data={filteredClubs}
          ref={listRef}
          renderItem={renderRow}
          keyExtractor={(item) => item.name} // Ensure each item has a unique key
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  club: {},
  image: {
    alignSelf: "center",
    width: "100%",
    borderWidth: 5,
    borderRadius: 20,
    borderColor: "orange",
    backgroundColor: "white",
    justifyContent: "center",
    flex: 1,
    flexDirection: "column",
  },
  nameText: {
    fontSize: 25,
    fontWeight: "bold",
    color: Colors.clubListName,
    textAlign: "center",
    alignSelf: "center",
    marginBottom: 80,
    marginTop: 10,
    marginHorizontal: 10,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    elevation: 10,
    padding: 6,
  },
});

export default ClubList;
