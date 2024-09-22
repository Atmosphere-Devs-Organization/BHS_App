import React, { useState, useEffect, useRef } from "react";
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Linking,
  TouchableWithoutFeedback,
  Alert,
  TextInput,
  Pressable,
  ImageBackground,
  SafeAreaView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Entypo, MaterialIcons } from "@expo/vector-icons"; // Import MaterialIcons
import { buttons, Button } from "@/components/ButtonData"; // Your button data
import * as SecureStore from "expo-secure-store";
import {
  refreshBridgelandStudent,
  refreshGradeData,
} from "@/globalVars/gradesVariables";
import bannerImage from "assets/images/banner.png";
import axios from "axios";
import * as Application from "expo-application";
import LinearGradient from "react-native-linear-gradient";

const screenWidth = Dimensions.get("window").width;

const categories = ["All", "Students", "Parents"];

const Home: React.FC = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isScrolling, setIsScrolling] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);
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

  const filterButtons = (): Button[] => {
    if (selectedCategory === "All") {
      return buttons;
    } else {
      return buttons.filter((button) =>
        button.categories.includes(selectedCategory)
      );
    }
  };

  const handlePressIn = (buttonTitle: string) => {
    if (!isScrolling) {
      setPressedButton(buttonTitle);
    }
  };

  const handlePressOut = (buttonTitle: string, url: string) => {
    if (!isScrolling) {
      setTimeout(() => {
        if (pressedButton === buttonTitle) {
          Linking.openURL(url);
        }
        setPressedButton(null);
      }, 500);
    }
  };

  return (
    <View style={styles.home_BG_Color}>
      <StatusBar hidden={true} />
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <ImageBackground
            source={bannerImage}
            style={styles.image}
            resizeMode="contain" // Resize mode set to 'contain'
            imageStyle={{ borderRadius: 15 }}
          ></ImageBackground>
        </View>
      </SafeAreaView>
      <TouchableWithoutFeedback onPressIn={() => setIsScrolling(true)}>
        <ScrollView style={{ marginTop: 150 }}>
          <View style={styles.welcomeContainer}></View>
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

            <TouchableOpacity onPress={saveUserData} style={styles.save_button}>
              <Text style={styles.save_button_text}>Save</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.resourcesTitle}>Resources</Text>

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            persistentScrollbar={true}
            style={styles.horizontalScrollView}
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            scrollEventThrottle={16}
          >
            {filterButtons().map((button: Button) => (
              <View key={button.title} style={styles.buttonWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    if (!isScrolling) {
                      Linking.openURL(button.link);
                    }
                  }}
                  style={[
                    styles.button,
                    pressedButton === button.title && styles.buttonPressed,
                  ]}
                >
                  <MaterialIcons
                    name={button.icon} // This will now use MaterialIcons
                    size={50}
                    color="white"
                    style={styles.buttonIcon}
                  />
                </TouchableOpacity>
                <Text style={styles.buttonText}>{button.title}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.reportButtonContainer}>
            <TouchableOpacity
              onPress={() => router.push("/(modals)/report")}
              style={styles.reportButton}
            >
              <Text style={styles.reportButtonText}>Report an Issue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  home_BG_Color: {
    flex: 1,
    backgroundColor: "#121212",
    paddingBottom: "30%",
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 45,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#333333",
  },
  tabButtonActive: {
    backgroundColor: "#007BFF",
  },
  tabButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  horizontalScrollView: {
    width: "95%",
    marginRight: 20,
    marginLeft: 10,
    paddingVertical: 10,
  },
  buttonWrapper: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: "#1E1E1E", // Gray square
    borderRadius: 20,
    width: 90, // Bigger square button
    height: 90, // Make it a square
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginBottom: 5, // Space between icon and text
  },
  buttonText: {
    color: "#FFFFFF",
    width: 90,
    fontSize: 15, // Same font size as before
    fontWeight: "bold",
    marginTop: 5, // Space between square and text
    textAlign: "center",
  },
  buttonPressed: {
    backgroundColor: "#0056b3", // Highlight the button when pressed
  },
  reportButtonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  reportButton: {
    backgroundColor: "#FF4136",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  reportButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
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
  image: {
    marginTop: 20,
    height: 140,
    alignSelf: "center",
    width: "100%",
    justifyContent: "center",
    flex: 1,
    flexDirection: "column",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  resourcesTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginVertical: 15, // Adjust spacing as needed
  },
});

export default Home;
