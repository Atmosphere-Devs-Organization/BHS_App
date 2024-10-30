import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import { useRouter, useLocalSearchParams  } from "expo-router";
  import { doc, getDoc, updateDoc } from "firebase/firestore";
  import { FIREBASE_DB, FIREBASE_AUTH } from "@/FirebaseConfig";
  import { Club } from "@/interfaces/club";
import Colors from "@/constants/Colors";
  
  const ClubEdit = () => {
    const [clubData, setClubData] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatedFields, setUpdatedFields] = useState<Partial<Club>>({});
    const { name } = useLocalSearchParams (); // Get club name from the URL
    const router = useRouter();
  
    useEffect(() => {
      const fetchClubData = async () => {
        setLoading(true);
        try {
          const clubRef = doc(FIREBASE_DB, "clubs", name as string);
          const clubSnap = await getDoc(clubRef);
  
          if (clubSnap.exists()) {
            setClubData(clubSnap.data() as Club);
          } else {
            Alert.alert("Club not found");
          }
        } catch (error) {
          Alert.alert("Error fetching club data");
        } finally {
          setLoading(false);
        }
      };
  
      fetchClubData();
    }, [name]);
  
    const handleUpdate = async () => {
      if (!clubData) return;
  
      try {
        const user = FIREBASE_AUTH.currentUser;
  
        if (user?.email !== clubData.sponsorEmail) {
          Alert.alert("Unauthorized", "You are not allowed to edit this club");
          return;
        }
  
        const clubRef = doc(FIREBASE_DB, "clubs", name as string);
        
        // Only update fields that were changed
        await updateDoc(clubRef, {
          ...updatedFields,
        });
  
        Alert.alert("Success", "Club information updated successfully!");
        router.push("/teacherPortal"); // Navigate back to the portal
      } catch (error) {
        Alert.alert("Error", "Failed to update club");
      }
    };
  
    const handleInputChange = (field: keyof Club, value: string | string[]) => {
      setUpdatedFields((prev) => ({ ...prev, [field]: value }));
    };
  
    if (loading) {
      return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />;
    }
  
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Club Name</Text>
        <TextInput
          style={styles.input}
          value={updatedFields.name || clubData?.name || ""}
          onChangeText={(text) => handleInputChange("name", text)}
        />
  
        <Text style={styles.label}>Sponsor Email</Text>
        <TextInput
          style={styles.input}
          value={updatedFields.sponsorEmail || clubData?.sponsorEmail || ""}
          onChangeText={(text) => handleInputChange("sponsorEmail", text)}
          editable={false} // Prevent sponsorEmail editing
        />
  
        <Text style={styles.label}>Past Event Descriptions</Text>
        <TextInput
          style={styles.input}
          value={updatedFields.pastEventDescriptions || clubData?.pastEventDescriptions.join(", ") || ""}
          onChangeText={(text) => handleInputChange("pastEventDescriptions", text.split(", "))}
          multiline
        />
  
        <Text style={styles.label}>Past Event Names</Text>
        <TextInput
          style={styles.input}
          value={updatedFields.pastEventNames || clubData?.pastEventNames.join(", ") || ""}
          onChangeText={(text) => handleInputChange("pastEventNames", text.split(", "))}
          multiline
        />
  
        <Text style={styles.label}>Past Event URLs</Text>
        <TextInput
          style={styles.input}
          value={updatedFields.pastEventURLs || clubData?.pastEventURLs.join(", ") || ""}
          onChangeText={(text) => handleInputChange("pastEventURLs", text.split(", "))}
          multiline
        />
  
        <Button title="Save Changes" onPress={handleUpdate} />
      </ScrollView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    label: {
      fontSize: 18,
      fontWeight: "bold",
      marginVertical: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 10,
      borderRadius: 5,
      marginBottom: 20,
    },
  });
  
  export default ClubEdit;
  