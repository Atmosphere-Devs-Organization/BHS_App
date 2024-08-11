import Numbers from "@/constants/Numbers";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, StyleSheet, Text } from "react-native";
import AwesomeButton from "react-native-really-awesome-button";

const HACNeededScreen = () => {
  return (
    <View style={{ backgroundColor: "#121212", height: "100%", width: "100%" }}>
      <Text
        style={{
          marginTop: 100,
          color: "#ff6600",
          textAlign: "center",
          fontSize: 30,
          fontWeight: "bold",
          paddingHorizontal: 15,
          paddingBottom: 75,
        }}
      >
        You must be signed into your BHS Home Access Center account to access
        the map!
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

export default HACNeededScreen;
