import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig"; // Update with your Firebase config import
import Colors from "@/constants/Colors";

const screenWidth = Dimensions.get("window").width;

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const announcementsDocRef = doc(FIREBASE_DB, "admin", "announcements");
        const announcementsDocSnap = await getDoc(announcementsDocRef);
        if (announcementsDocSnap.exists()) {
          const data = announcementsDocSnap.data();
          const announcementsArr = data?.announcementsArr || [];
          setAnnouncements(announcementsArr.reverse()); // Reverse the array
        } else {
        }
      } catch (error) {}
    };

    fetchAnnouncements();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {announcements.length > 0 ? (
        announcements.map((announcement, index) => (
          <View key={index} style={styles.announcementBox}>
            <Text style={styles.announcementText}>{announcement}</Text>
          </View>
        ))
      ) : (
        <Text>No announcements available.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  announcementBox: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: screenWidth * 0.9, // Adjust width as needed
    alignSelf: "center",
  },
  announcementText: {
    color: "white",
    fontSize: 16,
  },
});

export default Announcements;
