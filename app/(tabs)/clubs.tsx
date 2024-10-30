import {
  View,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Stack } from "expo-router";
import ClubsHeader from "@/components/ClubsHeader";
import ClubList from "@/components/ClubList";
import clubData from "@/assets/data/clubs-data.json";
import Numbers from "@/constants/Numbers";
import {
  getAccessStatus,
  getBHSStudentLoadingStatus,
} from "@/globalVars/gradesVariables";
import HACNeededScreen_BHS from "@/components/HACNeededScreen_BHS";
import Colors from "@/constants/Colors";

const Clubs = () => {
  const [HACBroken, setHACBroken] = useState<boolean>(false);

  const [hasAccess, setAccess] = useState<boolean>(false);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);

  async function setCoursesAsync() {
    if (!hasAccess) {
      setAccess(await getAccessStatus());
      setLoadingInfo(await getBHSStudentLoadingStatus());
    }
  }

  let intervalId: NodeJS.Timeout = setInterval(() => {
    setCoursesAsync();
  }, 10);

  useEffect(() => {
    if (hasAccess) {
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
          color: Colors.primary,
          alignSelf: "center",
          textAlign: "center",
          fontSize: 16,
          marginTop: 20,
          fontWeight: "bold",
        }}
      >
        {
          "Make sure your HAC info is correct"
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
      <HACNeededScreen_BHS paddingTop={200} hacDown={HACBroken} />
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
