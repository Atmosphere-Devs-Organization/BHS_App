import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import Numbers from "@/constants/Numbers";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "react-native/Libraries/NewAppScreen";
import {
  Course,
  Grade,
  refreshGradeData,
  getCourses,
  HACBroken,
} from "@/globalVars/gradesVariables";

const gradesCalculating = () => {
  const { className } = useLocalSearchParams();
  const [courses, setCourses] = useState<Course[] | null>(null);

  async function setCoursesAsync() {
    if (!courses) {
      setCourses(await getCourses());
    }
  }

  let intervalId: NodeJS.Timeout = setInterval(() => {
    setCoursesAsync();
  }, 10);

  useEffect(() => {
    if (courses) {
      clearInterval(intervalId);
    }
  }, [courses]);

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
        <Text>{courses ? courses.toLocaleString() : "null"}</Text>
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
