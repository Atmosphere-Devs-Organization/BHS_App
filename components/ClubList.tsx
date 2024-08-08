import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Club } from "@/interfaces/club";
import { Link } from "expo-router";
import Colors from "@/constants/Colors";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface Props {
  category: string;
}

const ClubList = ({ category }: Props) => {
  const listRef = useRef<FlatList>(null);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const clubsCacheRef = useRef<Club[]>([]); // Cache for clubs data

  useEffect(() => {
    const fetchClubs = async () => {
      if (clubsCacheRef.current.length > 0) {
        // Use cached data if available
        console.log("Using cached clubs data...");
        const filtered = clubsCacheRef.current.filter((club) =>
          club.categories.includes(category)
        );
        console.log("Filtered clubs from cache:", filtered);
        setFilteredClubs(filtered);
        setLoading(false);
        return;
      }

      console.log("Fetching clubs...");
      try {
        // Fetch the array of club document names
        const clubListRef = doc(FIREBASE_DB, 'admin', 'Club_list');
        const clubListSnap = await getDoc(clubListRef);
        const clubNames = clubListSnap.data()?.club_arr || [];
        console.log("Club names fetched:", clubNames);

        // Fetch each club document based on the names in the array
        const clubsData: Club[] = [];
        for (const name of clubNames) {
          const clubRef = doc(FIREBASE_DB, 'clubs', name);
          const clubSnap = await getDoc(clubRef);
          if (clubSnap.exists()) {
            const club = clubSnap.data() as Club;
            clubsData.push(club);
          }
        }

        // Cache the fetched clubs data
        clubsCacheRef.current = clubsData;

        // Filter clubs by category
        const filtered = clubsData.filter((club) =>
          club.categories.includes(category)
        );
        console.log("Filtered clubs:", filtered);
        setFilteredClubs(filtered);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [category]);

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
        <Text>Loading...</Text>
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
    textShadowOffset: { width: -2, height: -2 },
    textShadowRadius: 10,
    elevation: 5,
    padding: 6,
  },
});

export default ClubList;
