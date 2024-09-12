import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React from "react";
import { useLocalSearchParams, router } from "expo-router";
import Numbers from "@/constants/Numbers";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "react-native/Libraries/NewAppScreen";

const gradesCalculating = () => {
  const { name } = useLocalSearchParams();
  return (
    <SafeAreaView>
      <View style={{ flexDirection: "row", marginTop: 5 }}>
        <TouchableOpacity onPress={router.back} style={styles.back_button}>
          <Ionicons
            name="arrow-back-sharp"
            size={Numbers.backButtonSize}
            color={Colors.backButton}
          />
        </TouchableOpacity>
        <Text>{name}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  back_button: {
    marginVertical: 0,
    marginHorizontal: 15,
  },
});

export default gradesCalculating;
