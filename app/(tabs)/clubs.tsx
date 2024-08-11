import {
  View,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { router, Stack, useFocusEffect } from "expo-router";
import ClubsHeader from "@/components/ClubsHeader";
import ClubList from "@/components/ClubList";
import clubData from "@/assets/data/clubs-data.json";
import * as SecureStore from "expo-secure-store";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import axios from "axios";
import { User, onAuthStateChanged } from "firebase/auth";
import AwesomeButton from "react-native-really-awesome-button";
import { Ionicons } from "@expo/vector-icons";
import Numbers from "@/constants/Numbers";

const Clubs = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchCredentials = async () => {
        const storedUsername = await SecureStore.getItemAsync(
          user?.uid + "HACusername"
        );
        const storedPassword = await SecureStore.getItemAsync(
          user?.uid + "HACpassword"
        );

        setUsername(storedUsername);
        setPassword(storedPassword);
      };

      fetchCredentials();

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [user?.uid])
  );

  const HAC_Link = "https://home-access.cfisd.net";

  const fetchStudentInfo = async (apiSection: string): Promise<any> => {
    try {
      const response = await axios.get(
        "https://home-access-center-ap-iv2-sooty.vercel.app/api/" +
          apiSection +
          "?link=" +
          HAC_Link +
          "/&user=" +
          username +
          "&pass=" +
          password
      );
      return response.data;
    } catch (error) {
      return undefined;
    }
  };

  const [hasAccess, setAccess] = useState<boolean>(false);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(true);

  useEffect(() => {
    if (username && password) {
      async function fetchAPI() {
        setLoadingInfo(true);
        let response = await fetchStudentInfo("info");
        setAccess(
          response
            ? response["school"].toLowerCase().includes("bridgeland")
            : false
        );
        setLoadingInfo(false);
      }

      fetchAPI();
    }
  }, [username, password]);

  const [category, setCategory] = useState("All");
  const items = useMemo(() => clubData as any, []);

  const onCategoryChanged = (category: string) => {
    setCategory(category);
  };
  return loadingInfo && user ? (
    <View style={{ backgroundColor: "#121212", height: "100%", width: "100%" }}>
      <ActivityIndicator
        size="large"
        color="#ff4d00"
        style={{ alignSelf: "center", marginTop: 300 }}
      />
    </View>
  ) : hasAccess && user ? (
    <View style={styles.BG_Color}>
      <View style={{ flex: 1, marginTop: 190 }}>
        <Stack.Screen
          options={{
            header: () => <ClubsHeader onCategoryChanged={onCategoryChanged} />,
          }}
        />
        <ClubList category={category} />
      </View>
    </View>
  ) : (
    <View style={{ backgroundColor: "#121212", height: "100%", width: "100%" }}>
      <Text
        style={{
          marginTop: 250,
          color: "#ff6600",
          textAlign: "center",
          fontSize: 30,
          fontWeight: "bold",
          paddingHorizontal: 15,
          paddingBottom: 75,
        }}
      >
        You must be signed into your BHS Home Access Center account to access
        clubs!
      </Text>
      <AwesomeButton
        style={styles.profile_button}
        backgroundColor={"#ff9100"}
        backgroundDarker={"#c26e00"}
        height={100}
        width={320}
        raiseLevel={20}
        onPressOut={() => router.push("(screens)/profile")}
      >
        <Ionicons
          name="person-circle-sharp"
          size={50}
          color="#422500"
          style={{ alignSelf: "center", marginRight: 15 }}
        />
        <Text style={styles.profile_text}>Profile</Text>
      </AwesomeButton>
    </View>
  );
};

const styles = StyleSheet.create({
  home_BG_Image: {
    flex: 1,
  },
  BG_Color: {
    flex: 1,
    backgroundColor: "#121212",
  },
  profile_button: {
    marginVertical: 25,
    alignContent: "center",
    alignSelf: "center",
  },
  profile_text: {
    fontSize: Numbers.loginTextFontSize,
    color: "#422500",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default Clubs;
