import Colors from "@/constants/Colors";
import Numbers from "@/constants/Numbers";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, StyleSheet, Text } from "react-native";
import AwesomeButton from "react-native-really-awesome-button";

const HACNeededScreen = ({
  paddingTop,
  hacDown,
}: {
  paddingTop: number;
  hacDown: boolean;
}) => {
  return (
    <View
      style={{
        backgroundColor: "#121212",
        height: "100%",
        width: "100%",
        paddingTop: paddingTop,
      }}
    >
      <Text
        style={{
          marginTop: 100,
          color: Colors.primary,
          textAlign: "center",
          fontSize: 30,
          fontWeight: "bold",
          paddingHorizontal: 15,
          paddingBottom: 75,
        }}
      >
        {hacDown
          ? "HAC is not working right now. We cannot verify your login."
          : "Check your home access account login\nAlso make sure you aren't on school wifi"}
      </Text>
      {!hacDown && (
        <AwesomeButton
          style={styles.profile_button}
          backgroundColor={Colors.primary}
          backgroundDarker={"#0787e6"}
          height={100}
          width={320}
          raiseLevel={20}
          onPressOut={() => router.replace("/(tabs)/home")}
        >
          <Ionicons
            name="person-circle-sharp"
            size={50}
            color="white"
            style={{ alignSelf: "center", marginRight: 15 }}
          />
          <Text style={styles.profile_text}>Profile</Text>
        </AwesomeButton>
      )}
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
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default HACNeededScreen;
