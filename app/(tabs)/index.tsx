import React, { useEffect, useState, useRef } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  Animated
} from 'react-native';
import AwesomeButton from 'react-native-really-awesome-button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import Colors from '@/constants/Colors';
import Numbers from '@/constants/Numbers';
import Carousel from 'react-native-reanimated-carousel';
import * as MailComposer from 'expo-mail-composer';
import * as ImagePicker from 'expo-image-picker';
import { buttons, Button } from '@/components/ButtonData'; // Import the button data

const screenWidth = Dimensions.get('window').width;

const images = [
  require('@/assets/images/Bridgeland(1).png'),
  require('@/assets/images/Bridgeland(2).png'),
  require('@/assets/images/Bridgeland(4).png'),
];

const categories = ["All", "Students", "Parents"];

const Home: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [reportImages, setReportImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const scrollY = useRef(new Animated.Value(0)).current;
  const [isButtonVisible, setIsButtonVisible] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        router.push('(modals)/login');
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setIsButtonVisible(value < 100);
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setReportImages([...reportImages, selectedImage]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setReportImages(reportImages.filter((_, index) => index !== indexToRemove));
  };

  const handleReportIssue = async () => {
    if (issueDescription.trim() === '' && reportImages.length === 0) {
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
        attachments: reportImages,
      });
      Alert.alert('Success', 'Issue reported successfully.');
    } catch (error) {
      Alert.alert('Error', 'An error occurred while reporting the issue. Please try again later.');
      console.error(error);
    }
  };

  const filterButtons = (): Button[] => {
    if (selectedCategory === "All") {
      return buttons;
    } else {
      return buttons.filter(button => button.categories.includes(selectedCategory));
    }
  };

  return (
    <View style={[styles.home_BG_Color, { backgroundColor: Colors.overallBackground }]}>
      <StatusBar
        animated={true}
        barStyle={'dark-content'}
        showHideTransition={'fade'}
        hidden={false}
      />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollViewContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <Animated.View style={[
          styles.profileButtonContainer,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 100], // Change to match when the button should start hiding
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          }
        ]}>
          {isButtonVisible && (
            <TouchableOpacity
              onPress={() => router.push('(screens)/profile')}
              style={styles.profileButton}
            >
              <Ionicons
                name="person-circle-sharp"
                size={Numbers.profileButtonSize}
                color={Colors.profileButton}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to the BHS app</Text>
        </View>

        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={screenWidth * 0.9} // Adjusted width
            height={180} // Adjusted height
            autoPlay={true}
            autoPlayInterval={8000}
            data={images}
            scrollAnimationDuration={1000}
            renderItem={({ item }: { item: any }) => (
              <Image source={item} style={styles.carouselImage} />
            )}
          />
        </View>

        <View style={styles.resourcesContainer}>
          <Text style={styles.resourcesText}>Resources</Text>
        </View>

        <View style={styles.tabContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.tabButton,
                selectedCategory === category && styles.tabButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.tabButtonText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          {filterButtons().map((button: Button) => (
            <AwesomeButton
              key={button.title}
              style={styles.button}
              backgroundColor="#007BFF"
              backgroundDarker="#0056b3"
              height={50}
              width={screenWidth * 0.7}
              onPressOut={() => Linking.openURL(button.link)}
            >
              <Text style={styles.buttonText}>{button.title}</Text>
            </AwesomeButton>
          ))}
        </View>

        <View style={styles.reportSection}>
          <Link href="/(tabs)/calendar" style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color={Colors.clubName} />
          </Link>
          <Text style={styles.title}>Report an Issue</Text>

          <TextInput
            style={styles.input}
            placeholder="Describe the issue..."
            multiline
            numberOfLines={6}
            value={issueDescription}
            onChangeText={setIssueDescription}
          />

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>
          {reportImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeButton}>
                <Ionicons name="close-circle-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.reportButton} onPress={handleReportIssue}>
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  home_BG_Color: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 150, // Ensures enough space for the bottom buttons
    paddingTop: 140, // Adjusted to move carousel down further
  },
  welcomeContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 20,
   // borderWidth: 1,
    //borderColor: 'white',
    //backgroundColor: 'orange',
  },
  welcomeText: {
    color: 'white',
    fontSize: 30, // Adjust font size as needed
    fontWeight: 'bold',
    marginBottom: 15,
  },
  carouselContainer: {
    width: '90%', // Adjusted width
    aspectRatio: 1.7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  resourcesContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 0,

  },
  resourcesText: {
    color: Colors.clubName, // Updated color
    fontSize: 30, // Adjust font size as needed
    fontWeight: '600', // Semi-bold
    marginBottom: 10, // Adjust margin as needed
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 15,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'lightgray',
  },
  tabButtonActive: {
    backgroundColor: '#007BFF',
  },
  tabButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  button: {
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportSection: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.clubName, // Updated color
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 120,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: Colors.overallBackground,
  },
  uploadButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 50,
    
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  reportButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 55,
    marginTop: 15,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 15,
    zIndex: 10,
  },
  profileButton: {
    padding: 10,
  },
});

export default Home;
