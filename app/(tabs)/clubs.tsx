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
import HACNeededScreen from "@/components/HACNeededScreen";

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

  let specCharsMap = new Map<string | undefined, string>();
  specCharsMap.set(" ", "%20");
  specCharsMap.set("#", "%23");
  specCharsMap.set("&", "%26");
  specCharsMap.set("/", "%2F");
  specCharsMap.set("?", "%3F");
  specCharsMap.set("!", "%21");
  specCharsMap.set("$", "%24");
  specCharsMap.set("@", "%40");

  const [HACBroken, setHACBroken] = useState<boolean>(false);

  const fetchStudentInfo = async (apiSection: string): Promise<any> => {
    let tempPassword = "";
    for (let i = 0; i < (password ? password.length : 0); i++) {
      tempPassword += specCharsMap.has(password?.substring(i, i + 1))
        ? specCharsMap.get(password?.substring(i, i + 1))
        : password?.substring(i, i + 1);
    }

    const apiLink =
      "https://home-access-center-ap-iv2-sooty.vercel.app/api/" +
      apiSection +
      "?link=" +
      HAC_Link +
      "/&user=" +
      username +
      "&pass=" +
      tempPassword;

    try {
      const response = await axios.get(apiLink);
      setHACBroken(false);
      return response.data;
    } catch (error) {
      setHACBroken(error == "AxiosError: Request failed with status code 500");
      return undefined;
    }
  };

  const [hasAccess, setAccess] = useState<boolean>(false);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);

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
      <Stack.Screen
        options={{
          header: () => <ClubsHeader onCategoryChanged={onCategoryChanged} />,
        }}
      />
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
    <View>
      <Stack.Screen
        options={{
          header: () => <ClubsHeader onCategoryChanged={onCategoryChanged} />,
        }}
      />
      <HACNeededScreen paddingTop={200} hacDown={HACBroken} />
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
