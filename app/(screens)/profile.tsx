// Import statements
import React, { useEffect, useRef, useState } from "react";
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
  Alert,
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
import clubsData from "assets/data/clubs-data.json"; // Adjust the path as necessary
import * as SecureStore from "expo-secure-store";

const screenWidth = Dimensions.get("window").width;

// Main App component
const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  return user ? (
    <NormalProfile
      email={user.email}
      userName={user.displayName}
      userId={user.uid}
    />
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
          backgroundDarker={"orange"}
          height={Numbers.loginButtonHeight}
          width={Numbers.loginButtonWidth}
          raiseLevel={10}
          onPressOut={() => router.push("(modals)/login")}
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
  const [isEditingPassword, setIsEditingPass] = useState(false);
  const [username, setUsername] = useState(userName || "");
  const [sid, setSid] = useState("");
  const [HACpassword, setHACPass] = useState("");
  const [clubs, setClubs] = useState<string[]>([]);

  const usernameInputRef = useRef<TextInput>(null);
  const sidInputRef = useRef<TextInput>(null);
  const hacPasswordInputRef = useRef<TextInput>(null);
  const scrollReff = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.name || "");
          setClubs(userData.clubs || []);
          setSid(
            SecureStore.getItem(userId + "HACusername")
              ? String(SecureStore.getItem(userId + "HACusername"))
              : ""
          );
          setHACPass(
            SecureStore.getItem(userId + "HACpassword")
              ? String(SecureStore.getItem(userId + "HACpassword"))
              : ""
          );
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (isEditingName && !isEditingPassword && !isEditingSid) {
      usernameInputRef.current?.focus();
      scrollReff.current?.scrollToEnd({ animated: true });
    } else if (!isEditingName && !isEditingPassword && isEditingSid) {
      sidInputRef.current?.focus();
      scrollReff.current?.scrollToEnd({ animated: true });
    } else if (!isEditingName && isEditingPassword && !isEditingSid) {
      hacPasswordInputRef.current?.focus();
      scrollReff.current?.scrollToEnd({ animated: true });
    }
  }, [isEditingName, isEditingPassword, isEditingSid]);

  const updateUser = async (field: "name" | "HACusername" | "HACpassword") => {
    try {
      const userDoc = doc(FIREBASE_DB, "users", userId);

      if (field === "name") {
        await setDoc(userDoc, { name: username }, { merge: true });
        Alert.alert("Success", "Name updated");
      } else if (field === "HACusername") {
        await SecureStore.setItemAsync(userId + "HACusername", sid);
        Alert.alert("Success", "S-id updated");
      } else if (field === "HACpassword") {
        await SecureStore.setItemAsync(userId + "HACpassword", HACpassword);
        Alert.alert("Success", "HAC password updated");
      }
    } catch (error) {
      console.error("Error updating user information: ", error);
    }
  };

  const handlePress = (clubName: string) => {
    const matchedClub = clubsData.find((club) => club.name === clubName);

    if (matchedClub) {
      router.push(`/clubPage/${matchedClub.id}`);
    } else {
      console.log("No matching club found");
    }
  };

  return (
    <View style={styles.BG_Color}>
      <ScrollView ref={scrollReff}>
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
                ref={usernameInputRef}
              />
              <TouchableOpacity
                onPress={() => {
                  if (isEditingName) {
                    setIsEditingName(false);
                    updateUser("name");
                  } else {
                    setIsEditingPass(false);
                    setIsEditingSid(false);
                    setIsEditingName(true);
                  }
                }}
                style={styles.edit_button}
              >
                <Text style={styles.edit_button_text}>
                  {isEditingName ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>SID (include S):</Text>
              <TextInput
                style={styles.infoInput}
                placeholder="Enter your SID: (Include the S)"
                value={sid}
                onChangeText={setSid}
                editable={isEditingSid}
                ref={sidInputRef}
              />
              <TouchableOpacity
                onPress={() => {
                  if (isEditingSid) {
                    setIsEditingSid(false);
                    updateUser("HACusername");
                  } else {
                    setIsEditingPass(false);
                    setIsEditingName(false);
                    setIsEditingSid(true);
                  }
                }}
                style={styles.edit_button}
              >
                <Text style={styles.edit_button_text}>
                  {isEditingSid ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>HAC Password:</Text>
              <TextInput
                style={styles.infoInput}
                placeholder="Enter your HAC password"
                value={HACpassword}
                onChangeText={setHACPass}
                editable={isEditingPassword}
                secureTextEntry={true}
                ref={hacPasswordInputRef}
              />
              <TouchableOpacity
                onPress={() => {
                  if (isEditingPassword) {
                    setIsEditingPass(false);
                    updateUser("HACpassword");
                  } else {
                    setIsEditingSid(false);
                    setIsEditingName(false);
                    setIsEditingPass(true);
                  }
                }}
                style={styles.edit_button}
              >
                <Text style={styles.edit_button_text}>
                  {isEditingPassword ? "Save" : "Edit"}
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
                  backgroundDarker={"orange"}
                  height={screenWidth * 0.2}
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
              backgroundDarker={"orange"}
              height={screenWidth * 0.2}
              width={screenWidth * 0.8}
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
    backgroundColor: Colors.AmarBackground,
  },
  normal_profile_container: {
    flex: 1,
    backgroundColor: Colors.AmarBackground,
  },
  BG_Color: {
    flex: 1,
    backgroundColor: Colors.AmarBackground,
  },
  back_button: {
    marginVertical: 10,
    marginHorizontal: 15,
  },
  title: {
    marginTop: 30,
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
    color: "white",
    textAlign: "center",
  },
  login_button: {
    marginVertical: 25,
    alignContent: "center",
    alignSelf: "center",
  },
  login_text: {
    fontSize: Numbers.loginTextFontSize,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  infoContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  infoLabel: {
    color: "orange",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoText: {
    color: "white",
    fontSize: 16,
    marginVertical: 5,
  },
  infoInput: {
    color: "white",
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    marginVertical: 5,
  },
  edit_button: {
    marginTop: 10,
    backgroundColor: Colors.AmarButton,
    padding: 5,
    borderRadius: 5,
  },
  edit_button_text: {
    color: "orange",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "orange",
    margin: 20,
  },
  clubTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    margin: 20,
    alignSelf: "center",
  },
  clubContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  club_button: {
    marginVertical: 10,
  },
  club_button_text: {
    color: "orange",
    fontWeight: "bold",
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
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default App;
