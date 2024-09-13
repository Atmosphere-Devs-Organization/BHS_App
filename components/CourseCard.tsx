import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Course {
  courseName: string;
  sem1Grade: string;
  sem2Grade: string;
}

interface CourseBlockProps {
  courses: Course[];
}

const CourseBlock: React.FC<CourseBlockProps> = ({ courses }) => {
  return (
    <View style={styles.block}>
      <Text style={styles.semesterTitle}>Transcript</Text>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Course</Text>
        <Text style={styles.headerText}>SEM1</Text>
        <Text style={styles.headerText}>SEM2</Text>
      </View>
      {courses.map((course, index) => (
        <View key={index} style={styles.courseRow}>
          <Text style={styles.courseText}>{course.courseName}</Text>
          <Text style={styles.courseText}>{course.sem1Grade}</Text>
          <Text style={styles.courseText}>{course.sem2Grade}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    width: '103%',
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: "white",
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    color: "white",
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    width: '30%', // Adjust width as needed to align columns
    textAlign: 'center',
    color: "white",
  },
  courseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    color: "white",
  },
  courseText: {
    fontSize: 16,
    width: '30%', // Adjust width as needed to align columns
    textAlign: 'center',
    color: "white",
  },
});

export default CourseBlock;
