import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  Alert,
  ListRenderItem,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Numbers from "@/constants/Numbers";
import Colors from "@/constants/Colors";
import AwesomeButton from "react-native-really-awesome-button";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import clubsData from "assets/data/clubs-data.json"; // Adjust the path as necessary
import * as SecureStore from "expo-secure-store";

const screenWidth = Dimensions.get("window").width;

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
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
          backgroundColor={"#2176ff"}
          backgroundDarker={"orange"}
          height={Numbers.loginButtonHeight}
          width={Numbers.loginButtonWidth}
          raiseLevel={0}
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
  const [isEditingHAC, setIsEditingHAC] = useState(false);

  const [username, setUsername] = useState(userName || "");
  const [sid, setSid] = useState("");
  const [HACpassword, setHACPassword] = useState("");
  const [clubs, setClubs] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const usernameInputRef = useRef<TextInput>(null);
  const sidInputRef = useRef<TextInput>(null);
  const hacPasswordInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.name || "");
          const clubsCollection = collection(FIREBASE_DB, "clubs");
          const querySnapshot = await getDocs(clubsCollection);
          const existingClubs = querySnapshot.docs.map((doc) => doc.id);

          const allClubs = userData.clubs || [];

          // Filter user's clubs to only include those that exist in Firestore
          const validClubs = allClubs.filter((club: string) =>
            existingClubs.includes(club)
          );
          setClubs(validClubs);
          setSid(
            (await SecureStore.getItemAsync(userId + "HACusername")) || ""
          );
          setHACPassword(
            (await SecureStore.getItemAsync(userId + "HACpassword")) || ""
          );
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (isEditingName && !isEditingHAC) {
      usernameInputRef.current?.focus();
      scrollRef.current?.scrollTo({ x: 0, y: 280, animated: true });
    } else if (!isEditingName && isEditingHAC) {
      sidInputRef.current?.focus();
      scrollRef.current?.scrollTo({ x: 0, y: 280, animated: true });
    }
  }, [isEditingName, isEditingHAC]);

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
    //const matchedClub = clubsData.find((club) => club.name === clubName);
    Alert.alert(
      "Confirm Action",
      "Are you sure you want to go to " + clubName + "?",
      [
        {
          text: "Stay",
          onPress: () => console.log("Action cancelled"),
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => router.replace(`/clubPage/${clubName}`),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.BG_Color}>
      <SafeAreaView>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.normal_profile_container}>
              <View style={{ flexDirection: "row", marginTop: 5 }}>
                <TouchableOpacity
                  onPress={router.back}
                  style={styles.back_button}
                >
                  <Ionicons
                    name="arrow-back-sharp"
                    size={Numbers.backButtonSize}
                    color={Colors.backButton}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.title}>Profile</Text>

              <View style={styles.cardContainer}>
                <Text style={styles.sectionTitle}>User Information</Text>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoText}>{email}</Text>
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <TextInput
                    style={styles.infoInput}
                    placeholder="Enter your name"
                    placeholderTextColor={"darkGrey"}
                    value={username}
                    onChangeText={setUsername}
                    editable={isEditingName}
                    ref={usernameInputRef}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (isEditingName) {
                      setIsEditingName(false);
                      updateUser("name");
                    } else {
                      if (isEditingHAC) {
                        updateUser("HACusername");
                        updateUser("HACpassword");
                      }
                      setIsEditingHAC(false);
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

              <View style={styles.cardContainer}>
                <Text style={styles.sectionTitle}>HAC Information</Text>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoLabel}>SID (include S)</Text>
                  <TextInput
                    style={styles.infoInput}
                    placeholder="Enter your SID: (Include the S)"
                    placeholderTextColor={"grey"}
                    value={sid}
                    onChangeText={setSid}
                    editable={isEditingHAC}
                    ref={sidInputRef}
                  />
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.infoLabel}>HAC Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.infoInput}
                      placeholder="Enter your HAC password"
                      placeholderTextColor={"darkGrey"}
                      value={HACpassword}
                      onChangeText={setHACPassword}
                      secureTextEntry={!showPassword}
                      editable={isEditingHAC}
                      ref={hacPasswordInputRef}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Entypo
                        name={showPassword ? "eye" : "eye-with-line"}
                        size={20}
                        color="white"
                      />
                    </Pressable>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (isEditingHAC) {
                      setIsEditingHAC(false);
                      updateUser("HACusername");
                      updateUser("HACpassword");
                    } else {
                      if (isEditingName) {
                        updateUser("name");
                      }
                      setIsEditingName(false);
                      setIsEditingHAC(true);
                    }
                  }}
                  style={styles.edit_button}
                >
                  <Text style={styles.edit_button_text}>
                    {isEditingHAC ? "Save" : "Edit"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.clubTitle}>Your Clubs</Text>

              <View style={styles.clubContainer}>
                {clubs.map((club, index) => (
                  <AwesomeButton
                    key={index}
                    style={styles.club_button}
                    backgroundColor={"#1E1E1E"}
                    backgroundDarker={"orange"}
                    height={screenWidth * 0.2}
                    width={screenWidth - 40 - 20}
                    raiseLevel={0}
                    onPress={() => handlePress(club)}
                  >
                    <Text style={styles.club_button_text} numberOfLines={2}>
                      {club}
                    </Text>
                  </AwesomeButton>
                ))}
              </View>

              <AwesomeButton
                style={styles.logout_button}
                backgroundColor={"#2176ff"}
                height={screenWidth * 0.2}
                width={screenWidth * 0.8}
                raiseLevel={0}
                onPressOut={() =>
                  Alert.alert(
                    "Confirm Logout",
                    "Are you sure you want to log out?",
                    [
                      {
                        text: "Cancel",
                        onPress: () => console.log("Logout cancelled"),
                        style: "cancel",
                      },
                      {
                        text: "Log Out",
                        onPress: () => FIREBASE_AUTH.signOut(),
                        style: "destructive",
                      },
                    ],
                    { cancelable: true }
                  )
                }
              >
                <Entypo
                  name="log-out"
                  size={17}
                  color={"white"}
                  style={{ alignSelf: "center", marginRight: 15 }}
                />
                <Text style={styles.logout_text}>Logout</Text>
              </AwesomeButton>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  logged_out_profile_container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  normal_profile_container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  BG_Color: {
    flex: 1,
    backgroundColor: "#121212",
  },
  back_button: {
    marginVertical: 0,
    marginHorizontal: 15,
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: "5%",
    marginHorizontal: "17%",
    color: "#ffffff",
    textAlign: "center",
  },
  need_signin_text: {
    alignSelf: "center",
    marginTop: 100,
    marginHorizontal: 20,
    marginBottom: 20,
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
    color: "#2176ff",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoText: {
    color: "white",
    fontSize: 16,
    marginVertical: 5,
  },
  infoInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    marginVertical: 5,
  },
  edit_button: {
    marginTop: 10,
    backgroundColor: "orange",
    padding: 5,
    borderRadius: 5,
  },
  edit_button_text: {
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    margin: 10,
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
    justifyContent: "center",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  club_button: {
    marginVertical: 10,
  },
  club_button_text: {
    color: "#FF8500",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  logout_button: {
    marginVertical: 40,
    alignContent: "center",
    alignSelf: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    paddingHorizontal: 0, // Align with the input field
  },
  eyeIcon: {
    marginLeft: 10,
  },
  logout_text: {
    fontSize: 25,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  cardContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
  },
  cardLabel: {
    color: "#2176ff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardInput: {
    color: "black",
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
});

export default App;
