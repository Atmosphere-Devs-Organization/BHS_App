import React, { useState, useEffect, useRef } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  Linking,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import Colors from '@/constants/Colors';
import Numbers from '@/constants/Numbers';
import { buttons, Button } from '@/components/ButtonData'; 

const screenWidth = Dimensions.get('window').width;

const categories = ["All", "Students", "Parents"];

const Home: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [buttonPressTimeout, setButtonPressTimeout] = useState<NodeJS.Timeout | null>(null);

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

  const filterButtons = (): Button[] => {
    if (selectedCategory === "All") {
      return buttons;
    } else {
      return buttons.filter(button => button.categories.includes(selectedCategory));
    }
  };

  const handleButtonPress = (url: string) => {
    if (!isScrolling) {
      Linking.openURL(url);
    }
  };

  const handlePressIn = (buttonTitle: string) => {
    setPressedButton(buttonTitle);

    if (buttonPressTimeout) {
      clearTimeout(buttonPressTimeout);
    }
  };

  const handlePressOut = (buttonTitle: string, url: string) => {
    setButtonPressTimeout(setTimeout(() => {
      if (pressedButton === buttonTitle) {
        handleButtonPress(url);
      }
      setPressedButton(null);
    }, 500)); 
  };

  return (
    <View style={[styles.home_BG_Color]}>
      <StatusBar
        animated={true}
        barStyle={'light-content'}
        showHideTransition={'fade'}
        hidden={false}
      />

      <TouchableWithoutFeedback onPressIn={() => setIsScrolling(true)}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollViewContent}
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
          onMomentumScrollEnd={() => setIsScrolling(false)}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          <Animated.View style={[
            styles.profileButtonContainer,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, 100],
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
            <Text style={styles.welcomeText}>Resources</Text>
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
              <TouchableOpacity
                key={button.title}
                onPressIn={() => handlePressIn(button.title)}
                onPressOut={() => handlePressOut(button.title, button.link)}
                style={[
                  styles.button,
                  pressedButton === button.title && styles.buttonPressed
                ]}
              >
                <Text style={styles.buttonText}>{button.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            onPress={() => router.push('(modals)/report')}
            style={styles.reportButton}
          >
            <Text style={styles.reportButtonText}>Report an Issue</Text>
          </TouchableOpacity>
          
        </Animated.ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  home_BG_Color: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 150, 
    paddingTop: 140, 
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    backgroundColor: '#333333',
  },
  tabButtonActive: {
    backgroundColor: '#007BFF',
  },
  tabButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  button: {
    width: '45%',
    marginBottom: 10,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '2.5%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonPressed: {
    backgroundColor: '#0056b3',
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
  reportButton: {
    position: 'absolute',
    bottom: 120, // Moves the button up from the bottom edge
    left: '50%', // Centers the button horizontally
    marginLeft: -80, // Half of the button's width to align it perfectly at the center (width is 160)
    backgroundColor: '#FF8500',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;
