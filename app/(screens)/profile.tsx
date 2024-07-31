// Import statements
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Numbers from "@/constants/Numbers";
import Colors from "@/constants/Colors";
import AwesomeButton from "react-native-really-awesome-button";
import { doc, getDoc, setDoc } from "firebase/firestore";
import clubsData from 'assets/data/clubs-data.json'; // Adjust the path as necessary

const screenWidth = Dimensions.get('window').width;

// Main App component
const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return user ? (
    <NormalProfile email={user.email} userName={user.displayName} userId={user.uid} />
  ) : (
    <LoggedOutProfile />
  );
};

// Logged out profile component
const LoggedOutProfile = () => {
  return (
    <View style={styles.BG_Color}>
      <SafeAreaView style={styles.logged_out_profile_container}>
        <TouchableOpacity onPress={router.back} style={styles.back_button}>
          <Ionicons
            name="arrow-back-sharp"
            size={Numbers.backButtonSize}
            color={Colors.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.need_signin_text}>
          You need to be signed in to access your profile
        </Text>
        <AwesomeButton
          style={styles.login_button}
          backgroundColor={Colors.AmarButton}
          backgroundDarker={'orange'}
          height={Numbers.loginButtonHeight}
          width={Numbers.loginButtonWidth}
          raiseLevel={10}
          onPressOut={() => router.push("(modals)/temp")}
        >
          <Entypo
            name="login"
            size={Numbers.loginIconSize}
            color={Colors.loginIcon}
            style={{ alignSelf: "center", marginRight: 15 }}
          />
          <Text style={styles.login_text}>Login</Text>
        </AwesomeButton>
      </SafeAreaView>
    </View>
  );
};

// Normal profile component
const NormalProfile = ({
  email,
  userName,
  userId,
}: {
  email: string | null;
  userName: string | null;
  userId: string;
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingSid, setIsEditingSid] = useState(false);
  const [username, setUsername] = useState(userName || "");
  const [sid, setSid] = useState("");
  const [clubs, setClubs] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.name || "");
          setSid(userData.sid || "");
          setClubs(userData.clubs || []);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const updateUser = async (field: "name" | "HACusername") => {
    try {
      const userDoc = doc(FIREBASE_DB, "users", userId);

      if (field === "name") {
        await setDoc(userDoc, { name: username }, { merge: true });
      } else if (field === "HACusername") {
        await setDoc(userDoc, { HACusername: sid }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating user information: ", error);
    }
  };

  const handlePress = (clubName: string) => {
    const matchedClub = clubsData.find((club) => club.name === clubName);

    if (matchedClub) {
      router.push(`/clubPage/${matchedClub.id}`)
    } else {
      console.log('No matching club found');
    }
  };

  return (
    <View style={styles.BG_Color}>
      <ScrollView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.normal_profile_container}>
            <TouchableOpacity onPress={router.back} style={styles.back_button}>
              <Ionicons
                name="arrow-back-sharp"
                size={Numbers.backButtonSize}
                color={Colors.backButton}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>

            <Text style={styles.sectionTitle}>User Information</Text>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoText}>{email}</Text>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Name:</Text>
              <TextInput
                style={styles.infoInput}
                placeholder="Enter your name"
                value={username}
                onChangeText={setUsername}
                editable={isEditingName}
              />
              <TouchableOpacity
                onPress={() => {
                  setIsEditingName((prev) => !prev);
                  if (isEditingName) updateUser("name");
                }}
                style={styles.edit_button}
              >
                <Text style={styles.edit_button_text}>
                  {isEditingName ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>SID:</Text>
              <TextInput
                style={styles.infoInput}
                placeholder="Enter your SID"
                value={sid}
                onChangeText={setSid}
                editable={isEditingSid}
              />
              <TouchableOpacity
                onPress={() => {
                  setIsEditingSid((prev) => !prev);
                  if (isEditingSid) updateUser("HACusername");
                }}
                style={styles.edit_button}
              >
                <Text style={styles.edit_button_text}>
                  {isEditingSid ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.clubTitle}>Your Clubs</Text>

            <View style={styles.clubContainer}>
              {clubs.map((club, index) => (
                <AwesomeButton
                  key={index}
                  style={styles.club_button}
                  backgroundColor={Colors.AmarButton}
                  backgroundDarker={'orange'}
                  height={screenWidth * .2}
                  width={(screenWidth - 40 - 20) / 3}
                  raiseLevel={10}
                  onPressOut={() => handlePress(club)}
                >
                  <Text style={styles.club_button_text}>{club}</Text>
                </AwesomeButton>
              ))}
            </View>

            <AwesomeButton
              style={styles.logout_button}
              backgroundColor={Colors.AmarButton}
              backgroundDarker={'orange'}
              height={screenWidth * .2}
              width={screenWidth * .8}
              raiseLevel={10}
              onPressOut={() => FIREBASE_AUTH.signOut()}
            >
              <Entypo
                name="log-out"
                size={17}
                color={Colors.clubName}
                style={{ alignSelf: "center", marginRight: 15 }}
              />
              <Text style={styles.logout_text}>Logout</Text>
            </AwesomeButton>

          </SafeAreaView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  logged_out_profile_container: { 
    flex: 1, 
    backgroundColor: Colors.AmarBackground 
  },
  normal_profile_container: { 
    flex: 1, 
    backgroundColor: Colors.AmarBackground 
  },
  BG_Color: {
    flex: 1,
    backgroundColor: Colors.AmarBackground,
  },
  back_button: { 
    marginVertical: 10, 
    marginHorizontal: 15 
  },
  title: {
    marginVertical: 30, 
    fontWeight: "bold",
    fontSize: Numbers.titleFontSize,
    alignSelf: "center",
    transform: [{ translateY: -55 }],
    color: Colors.profileTitle,
  },
  need_signin_text: {
    alignSelf: "center",
    marginTop: 100,
    marginHorizontal: 10,
    fontWeight: "bold",
    fontSize: Numbers.needSignInFontSize,
    color: Colors.needSignIn,
    textAlign: "center",
  },
  login_button: {
    marginVertical: 25,
    alignContent: "center",
    alignSelf: "center",
  },
  login_text: {

    fontSize: Numbers.loginTextFontSize,
    color: 'white',
    textAlign: "center",
    fontWeight: "bold",
  },
  infoContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  infoLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    marginVertical: 5,
  },
  infoInput: {
    color: 'white',
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginVertical: 5,
  },
  edit_button: {
    marginTop: 10,
    backgroundColor: Colors.AmarButton,
    padding: 5,
    borderRadius: 5,
  },
  edit_button_text: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    margin: 20,
  },
  clubTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    margin: 20,
  },
  clubContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  club_button: {
    marginVertical: 10,
  },
  club_button_text: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: "center",


  },
  logout_button: {
    marginVertical: 25,
    alignContent: "center",
    alignSelf: "center",
  },
  logout_text: {
    fontSize: 17,
    color: 'white',
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default App;
