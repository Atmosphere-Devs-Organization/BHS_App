import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from "@/constants/Colors";

const CourseCard = ({ course, semester }: { course: string, semester: string }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.courseName}>{course}</Text>
      {semester && 
          
      <Text style={styles.courseGrade}>{semester}</Text>
}
    </View>
  );


  /*
      <TouchableOpacity
      style={styles.courseItem}
      onPress={() => setSelectedCourse(item)}
    >
      <Text style={styles.courseName}>{item.name}</Text>
      <Text style={styles.courseGrade}>

  */
};

const styles = StyleSheet.create({
  card: {
    color: "white",
    borderWidth: 1,
    borderColor : "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.transcriptBubblesBG,
    


  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  semesterText: {
    fontSize: 14,
    color: 'white',

  },
  courseItem: {
    backgroundColor: Colors.transcriptBubblesBG,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    height: 100,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  courseGrade: {
    fontSize: 24,
    color: Colors.tabActiveTint,
    fontWeight: "bold",
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    alignSelf: "flex-end",
    width: 100,
    textAlign: "center",
    textAlignVertical: "center",
    alignItems : "center",

  },

});

export default CourseCard;
