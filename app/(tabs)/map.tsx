import {
  View,
  Text,
  Button,
  ImageBackground,
  StatusBar,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";

const Map = () => {
  const [user, setUser] = useState<User | null>(null);
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [image1, setImage1] = useState<number | null>(null);
  const [image2, setImage2] = useState<number | null>(null);

  const handleInputChange1 = (input: string) => {
    setText1(input);
  };

  const handleInputChange2 = (input: string) => {
    setText2(input);
  };

  const handleSubmit = () => {
    const regex = /^\d{4}$/; // Regex to check if input is a 4-digit number
    const validNumbers = [2000,2000 , 1111, 1112, 1113]; // List of valid 4-digit numbers

  if (!regex.test(text1) || !regex.test(text2)) {
    setError("Both inputs must be 4-digit numbers.");
    setImage1(null);
    setImage2(null);
  } else if ((!validNumbers.includes(Number(text1)) || !validNumbers.includes(Number(text2)))) {
    setError("Both inputs must be valid numbers from the list.");
    setImage1(null);
    setImage2(null);
  } else {
      setError(null);
      const firstDigit1 = parseInt(text1[0]);
      const firstDigit2 = parseInt(text2[0]);

      setImage1(firstDigit1);
      setImage2(firstDigit2);
    }
  };

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });
  }, []);

  const getImageSource = (digit: number | null) => {
    switch (digit) {
      case 1:
        return { uri: "https://i.ibb.co/6s18YCw/floor1A.png" };
      case 2:
        return require("@/assets/images/floor2.png");
      case 3:
        return require("@/assets/images/floor3.png");
      case 4:
        return require("@/assets/images/floor4.png");
      default:
        return null;
    }
  };
    
 

  return (
    <ImageBackground
      source={require("@/assets/images/GenericBG.png")}
      resizeMode="cover"
      style={styles.home_BG_Image}
    >
      <ScrollView>
        <Text style={styles.title}>School Map</Text>        
        <Text style={styles.title}>Find Your Room!</Text>
        <Text style={styles.subtitle}>For cafeteria, type 5000 </Text>        
        <Text style={styles.subtitle}>If your room number starts with PB, you are in the portables. Access them from courtyard(5001) </Text>        
        <Text style={styles.subtitle}>For councilor pod, type </Text>        
        <Text style={styles.subtitle}>For AP pod, type </Text>        


        <TextInput
          style={{ width: '75%', marginTop: '10%', height: 40, borderColor: 'gray', borderWidth: 1, alignSelf: 'center', padding: 10 }}
          onChangeText={handleInputChange1}
          value={text1}
          keyboardType="numeric"
          maxLength={4}
          placeholder="Enter first 4-digit number"
        />
        <TextInput
          style={{ width: '75%', marginTop: '10%', height: 40, borderColor: 'gray', borderWidth: 1, alignSelf: 'center', padding: 10 }}
          onChangeText={handleInputChange2}
          value={text2}
          keyboardType="numeric"
          maxLength={4}
          placeholder="Enter second 4-digit number"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          title="Submit"
          onPress={handleSubmit}
        />

        {image1 !== null && (
          <Image
            source={getImageSource(image1)}
            style={styles.image}
            resizeMode="contain"
            
          />
        )}
        {image2 !== null && (
          <Image

            source={getImageSource(image2)}
            style={styles.image}
            resizeMode="contain"
            onError={(error) => console.log("Image load error:", error)}
          />
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  home_BG_Image: {
    flex: 1,
    justifyContent: "center",
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  image: {
    width: '92%', // Set width to 90% of the screen width
    height: undefined, // Allow the height to adjust to maintain aspect ratio
    aspectRatio: 1, // Ensure the image maintains its original aspect ratio
    marginTop: 5, // Check this value
    marginBottom: 5, // If present, check this too
    alignSelf: 'center',
    borderColor: 'gray',
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    justifyContent: 'flex-start', 
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 30, 
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
});

export default Map;
