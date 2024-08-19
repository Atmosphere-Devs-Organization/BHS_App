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
import { FIREBASE_AUTH } from "@/FirebaseConfig";
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

  return <NormalProfile />;
};

const NormalProfile = () => {
  const [isEditingHAC, setIsEditingHAC] = useState(false);

  const [sid, setSid] = useState("");
  const [HACpassword, setHACPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const sidInputRef = useRef<TextInput>(null);
  const hacPasswordInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setSid((await SecureStore.getItemAsync("HACusername")) || "");
      setHACPassword((await SecureStore.getItemAsync("HACpassword")) || "");
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (isEditingHAC) {
      sidInputRef.current?.focus();
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [isEditingHAC]);

  const updateUser = async (field: "HACusername" | "HACpassword") => {
    try {
      if (field === "HACusername") {
        await SecureStore.setItemAsync("HACusername", sid);
        Alert.alert("Success", "S-id updated");
      } else if (field === "HACpassword") {
        await SecureStore.setItemAsync("HACpassword", HACpassword);
        Alert.alert("Success", "HAC password updated");
      }
    } catch (error) {}
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
                      placeholderTextColor={"grey"}
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
    marginBottom: "25%",
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
    marginTop: 40,
    alignContent: "center",
    alignSelf: "center",
    marginBottom: 120,
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
