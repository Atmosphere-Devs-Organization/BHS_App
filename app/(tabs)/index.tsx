import React, { useState, useEffect, useRef } from "react";
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
  Linking,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH } from "@/FirebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import Colors from "@/constants/Colors";
import Numbers from "@/constants/Numbers";
import { buttons, Button } from "@/components/ButtonData";
import * as SecureStore from "expo-secure-store";
import classData from './classes.json'; 

interface ClassInfo {
  name: string;
  average: number;
}

interface resource {
  name: string;
  url: string;
}

const screenWidth = Dimensions.get("window").width;

const categories = ["All", "Students", "Parents"];

const Home: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [currentClassIndex, setCurrentClassIndex] = useState(0);
  const [currentClass, setCurrentClass] = useState<ClassInfo | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    setCurrentClass(classData[currentClassIndex]);

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0, 
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentClassIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % classData.length;
          setCurrentClass(classData[newIndex]);
          return newIndex;
        });

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentClassIndex]);

  const filterButtons = (): Button[] => {
    if (selectedCategory === "All") {
      return buttons;
    } else {
      return buttons.filter((button) =>
        button.categories.includes(selectedCategory)
      );
    }
  };

  const handleScrollBegin = () => {
    setIsScrolling(true);
  };

  const handleScrollEnd = () => {
    setIsScrolling(false);
  };

  const handlePressIn = (buttonTitle: string) => {
    if (!isScrolling) {
      setPressedButton(buttonTitle);
    }
  };

  const handlePressOut = (buttonTitle: string, url: string) => {
    if (!isScrolling) {
      setTimeout(() => {
        if (pressedButton === buttonTitle) {
          Linking.openURL(url);
        }
        setPressedButton(null);
      }, 500);
    }
  };

  return (
    <View style={styles.home_BG_Color}>
      <StatusBar hidden={true} />

      <TouchableWithoutFeedback onPressIn={() => setIsScrolling(true)}>
        <ScrollView>
          <View style={styles.gradeContainer}>
            {currentClass ? (
              <>
                <Animated.Text style={[styles.className, { opacity: fadeAnim }]}>
                  {currentClass.name}
                </Animated.Text>
                <Animated.Text
                  style={[styles.classAverage, { opacity: fadeAnim }]}
                >
                  Average: {currentClass.average}
                </Animated.Text>
              </>
            ) : (
              <Text>Loading...</Text>
            )}
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Resources</Text>
          </View>

          <View style={styles.tabContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.tabButton,
                  selectedCategory === category && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={styles.tabButtonText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            horizontal={true}
            style={styles.horizontalScrollView}
            onScrollBeginDrag={handleScrollBegin}
            onScrollEndDrag={handleScrollEnd}
            scrollEventThrottle={16}
          >
            {filterButtons().map((button: Button) => (
              <TouchableOpacity
                key={button.title}
                onPress={() => {
                    if (!isScrolling) {
                      Linking.openURL(button.link);
                    }
                  }}
                style={[
                  styles.button,
                  pressedButton === button.title && styles.buttonPressed,
                ]}
              >
                <Text style={styles.buttonText}>{button.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      </TouchableWithoutFeedback>

      <View style={styles.reportButtonContainer}>
        <TouchableOpacity
          onPress={() => router.push("(modals)/report")}
          style={styles.reportButton}
        >
          <Text style={styles.reportButtonText}>Report an Issue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  home_BG_Color: {
    flex: 1,
    backgroundColor: "#121212",
    paddingBottom: "30%"
  },
  gradeContainer: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  welcomeContainer: {
    alignItems: "center",
    paddingTop: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 15,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#333333",
  },
  tabButtonActive: {
    backgroundColor: "#007BFF",
  },
  tabButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  horizontalScrollView: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#007BFF",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonPressed: {
    backgroundColor: "#0056b3",
  },
  reportButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  reportButton: {
    backgroundColor: "#FF8500",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  reportButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  className: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  classAverage: {
    fontSize: 28,
    marginTop: 10,
    color: "#FFFFFF",
  },
});

export default Home;
