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
  import { Link, router } from "expo-router";
  import Colors from "@/constants/Colors";
  import { FIREBASE_DB, FIREBASE_AUTH } from "@/FirebaseConfig";
  import { doc, getDoc } from "firebase/firestore";
  import { useClubContext } from "@/components/ClubContext"; // Import the custom hook
  import { onAuthStateChanged } from "firebase/auth"; // Firebase Auth
  
  const TeacherClubList = () => {
    const listRef = useRef<FlatList>(null);
    const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const { clubsCache, setClubsCache } = useClubContext(); // Use context
    const [userName, setUserName] = useState<string | null>(null); // Store user's Firebase name
    const [userEmail, setUserEmail] = useState<string | null>(null); // Store user's email
    const testEmail = "misty.miller@cfisd.net";


    useEffect(() => {
      // Get current Firebase user information
      const fetchUserNameAndEmail = async () => {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          setUserEmail(user.email); // Set user's email
          const userDocRef = doc(FIREBASE_DB, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          const userData = userSnap.data();
          setUserName(userData?.name || null); // Set the userName state
        }
      };
  
      fetchUserNameAndEmail();
    }, []);
  
    useEffect(() => {
      console.log('here"');
      const fetchClubs = async () => {
        if (!testEmail) {
          setLoading(false); // Exit if userName is not set yet
          return;
        }
  
        if (clubsCache.length > 0) {
          // Use cached data if available
          const filtered = clubsCache.filter(
            (club) => club.sponsorEmail.toLowerCase() === testEmail.toLowerCase() // Filter clubs by sponsor
          );
          console.log(filtered);
          setFilteredClubs(filtered);
          setLoading(false);
          return;
        }
  
        try {
          // Fetch cached clubs data from Firestore
          const adminCacheRef = doc(FIREBASE_DB, "admin", "CachedClubs");
          const adminCacheSnap = await getDoc(adminCacheRef);
          const cachedClubsData = adminCacheSnap.data()?.clubs || [];
  
          if (cachedClubsData.length === 0) {
            setLoading(false);
            return;
          }
  
          // Cache the fetched clubs data in the context
          setClubsCache(cachedClubsData);
          // Filter clubs by sponsor
          const filtered = cachedClubsData.filter(
            (club: Club) => club.sponsorEmail === userName // Filter by sponsor
          );
          setFilteredClubs(filtered);
        } catch (error) {
          // Handle error
        } finally {
          setLoading(false);
        }
      };
  
      fetchClubs();
    }, [userName, clubsCache, setClubsCache]);
    
    const handleEdit = (clubName: string) => {
      router.push({ pathname: './clubEdit.tsx', query: { name: clubName } });
    };

    const renderRow: ListRenderItem<Club> = ({ item }) => (
      <View style={styles.clubContainer}>
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
        <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEdit(item.name)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      </View>
    );
  
    return (
      <View style={{ marginBottom: 100 }}>
        <Text style={styles.welcomeText}>Welcome, {userEmail}</Text>
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
    welcomeText: {
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 20,
      textAlign: "center",
      color: 'orange',
    },
    clubContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 25,
      marginVertical: 10,
    },
    club: {
      flex: 1,
    },
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
    editButton: {
      backgroundColor: "#ff4d00",
      padding: 10,
      borderRadius: 10,
    },
    editButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
      textAlign: "center",
    },
  });
  
  export default TeacherClubList;
  