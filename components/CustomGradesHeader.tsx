import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import React, { useRef, useState, useEffect } from "react"; 
import Colors from "@/constants/Colors"; // Ensure Colors is used correctly
import Numbers from "@/constants/Numbers"; // Ensure Numbers is used correctly

const screenHeight = Dimensions.get("window").height;
console.log(screenHeight);

const clubCategories = [
  {
    name: "Tools",
  },
  {
    name: "Grades",
  },
  {
    name: "Transcript",
  },
];

interface Props {
  onCategoryChanged: (category: string) => void;
}

const ClubsHeader = ({ onCategoryChanged }: Props) => {
  const itemsRef = useRef<Array<TouchableOpacity | null>>([]);
  const [activeIndex, setActiveIndex] = useState(1); // Set initial index to 1 (Grades)
  const scrollRef = useRef<ScrollView>(null);

  // Effect to call onCategoryChanged when the component mounts
  useEffect(() => {
    onCategoryChanged(clubCategories[activeIndex].name);
  }, []); // Empty dependency array to run only once on mount

  const selectCategory = (index: number) => {
    const selected = itemsRef.current[index];
    setActiveIndex(index);
    onCategoryChanged(clubCategories[index].name);
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.titleText}>Grades</Text>
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {clubCategories.map((item, index) => (
              <TouchableOpacity
                key={index}
                ref={(el) => (itemsRef.current[index] = el)}
                style={
                  activeIndex === index
                    ? styles.categoryActiveBtn
                    : styles.categoryBtn
                }
                onPress={() => selectCategory(index)}
              >
                <Text
                  style={
                    activeIndex === index
                      ? styles.categoryActiveText
                      : styles.categoryText
                  }
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0D92F4", // Main header color
    height: 200, // Height of the header
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingBottom: 20, // Padding to give space for category buttons
  },
  titleText: {
    color: "white",
    textAlign: "center",
    fontSize: 50,
    fontWeight: "bold",
    marginTop: screenHeight * -0.01,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  categoryContainer: {
    backgroundColor: "#494547",
    borderRadius: 16,
    marginTop: screenHeight * 0.01, // Adjusted margin to ensure fit
    height: 60, // Fixed height for category container
    marginHorizontal: 10,
    overflow: "hidden", // Ensures rounded corners are applied to children
    justifyContent: "center", // Center vertically
    borderColor: "#b3b3b3",
    borderWidth: 1,
  },
  categoriesScroll: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "space-between",
  },
  categoryText: {
    fontSize: 17,
    paddingTop: 5,
    color: "white",
    fontWeight: "bold",
  },
  categoryActiveText: {
    fontSize: 17,
    color: "white",
    fontWeight: "bold",
  },
  categoryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // Centering the text vertically
    paddingVertical: 16,
    borderRadius: 12,
    width: 100,
  },
  categoryActiveBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#0D92F4",
    //transform: [{ scale: 1.10 }], // Slight scaling effect on active
    borderColor: "white",
    borderWidth: 2,
    width: 100,

  },
});

export default ClubsHeader;
