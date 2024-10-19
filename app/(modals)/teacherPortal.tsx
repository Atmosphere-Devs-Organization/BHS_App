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
import TeacherClubList from "@/components/teacherClubList";
import clubData from "@/assets/data/clubs-data.json";
import Numbers from "@/constants/Numbers";


const teacherPortal = () => {
  
    return (
    <View style={styles.BG_Color}>
      <View style={{ flex: 1, marginTop: 190 }}>
        <TeacherClubList/>
      </View>
    </View>
  ) 
}
const styles = StyleSheet.create({
  
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

export default teacherPortal;
