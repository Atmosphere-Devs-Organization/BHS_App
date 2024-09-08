import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CourseCard = ({ course, semester }: { course: string, semester: string }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.courseTitle}>{course}</Text>
      {semester && <Text style={styles.semesterText}>Grade: {semester}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    color: "white",
    borderWidth: 1,
    borderColor : "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,

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
});

export default CourseCard;
