import React, { useState } from "react";
import { View, Text, ScrollView, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as MailComposer from 'expo-mail-composer';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import Colors from "constants/Colors";

const PrivacyPolicyPage = () => {
  const [issueDescription, setIssueDescription] = useState('');
  const [images, setImages] = useState<string[]>([]); // Declare type as an array of strings

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // Function to handle image selection
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri; // Using assets array to access selected image
      setImages([...images, selectedImage]);
    }
  };

  const handleReportIssue = async () => {
    if (issueDescription.trim() === '' && images.length === 0) {
      Alert.alert('Error', 'Please provide a description of the issue or attach an image.');
      return;
    }
  
    try {
      const emailBody = issueDescription !== '' ? issueDescription + "\n\n" : '';
      await MailComposer.composeAsync({
        recipients: ['bridgelandapp@gmail.com'],
        subject: 'Reported Issue',
        body: emailBody,
        isHtml: false,
        attachments: images, // Attach images directly
      });
      Alert.alert('Success', 'Issue reported successfully.');
      setIssueDescription('');
      setImages([]);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while reporting the issue. Please try again later.');
      console.error(error);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          {/* Back Button */}
          <Link href="/(tabs)/calendar" style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color="white" />
          </Link>
          <Text style={styles.title}>Report an Issue</Text>

          {/* Issue Description Input */}
          <TextInput
            style={styles.input}
            placeholder="Describe the issue..."
            multiline
            numberOfLines={6}
            value={issueDescription}
            onChangeText={setIssueDescription}
          />

          
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeButton}>
                <Ionicons name="close-circle-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ))}
          {/* Image Upload */}
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>

          {/* Report Issue Button */}
          <TouchableOpacity style={styles.reportButton} onPress={handleReportIssue}>
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212",
  },
  title: {
    fontFamily: "mon-b",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 35,
    color: 'white',
  },
  input: {
    height: 200, // Initial height
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 10,
    fontFamily: "mon",
    marginLeft: 15,
    marginRight: 15,
    textAlignVertical: "top",
    color: 'white', // Text color
  },
  uploadButton: {
    backgroundColor: "white", // Custom color
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    borderColor: "black", // Add black border color
    borderWidth: 1, // Add border width
    marginHorizontal: 10,
  },
  uploadButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
    borderRadius: 10,
  },
  reportButton: {
    backgroundColor: "#2176ff",
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    top: 32,
    left: 16,
    zIndex: 1,
    position: 'absolute',
    color: 'white',
  },
  imageContainer: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1, // Ensure the remove button is above the image
  },
});


export default PrivacyPolicyPage;
