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
import { getAccessStatus } from "@/globalVars/gradesVariables";

const Clubs = () => {
  const [HACBroken, setHACBroken] = useState<boolean>(false);

  const [hasAccess, setAccess] = useState<boolean>(false);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(true);

  async function setCoursesAsync() {
    if (!hasAccess) {
      setAccess(await getAccessStatus());
    }
  }

  let intervalId: NodeJS.Timeout = setInterval(() => {
    setCoursesAsync();
  }, 10);

  useEffect(() => {
    if (hasAccess) {
      setLoadingInfo(false);
      clearInterval(intervalId);
    }
  }, [hasAccess]);

  const [category, setCategory] = useState("All");
  const items = useMemo(() => clubData as any, []);

  const onCategoryChanged = (category: string) => {
    setCategory(category);
  };
  return loadingInfo ? (
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
      <Text
        style={{
          color: "#ff4d00",
          alignSelf: "center",
          textAlign: "center",
          fontSize: 16,
          marginTop: 20,
          fontWeight: "bold",
        }}
      >
        {
          "Make sure you are not on school wifi\nMake sure your HAC info is correct"
        }
      </Text>
    </View>
  ) : hasAccess ? (
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
