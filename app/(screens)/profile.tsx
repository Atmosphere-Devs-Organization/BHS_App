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
  Pressable,
  Alert,
} from "react-native";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { User, onAuthStateChanged } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Numbers from "@/constants/Numbers";
import Colors from "@/constants/Colors";
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

  const saveUserData = async () => {
    try {
      await SecureStore.setItemAsync("HACusername", sid);
      await SecureStore.setItemAsync("HACpassword", HACpassword);
      Alert.alert("Success", "HAC Information saved");
    } catch (error) {
      Alert.alert("Error", "Failed to save HAC Information");
    }
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
                  onPress={saveUserData}
                  style={styles.save_button}
                >
                  <Text style={styles.save_button_text}>Save</Text>
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
  infoContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  infoLabel: {
    color: "#2176ff",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    marginVertical: 5,
  },
  save_button: {
    marginTop: 10,
    backgroundColor: "orange",
    padding: 5,
    borderRadius: 5,
  },
  save_button_text: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    margin: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    paddingHorizontal: 0,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  cardContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 20,
  },
});

export default App;
