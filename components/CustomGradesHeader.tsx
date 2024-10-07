import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useRef, useState, useEffect } from "react"; // Import useEffect
import Colors from "@/constants/Colors";
import Numbers from "@/constants/Numbers";

const screenHeight = Dimensions.get("window").height;

const clubCategories = [
  {
    name: "Calculator",
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
        <Text style={{ color: "white", textAlign: "center", fontSize: 40, fontWeight: "bold", marginTop: screenHeight * 0.01 }}>Grades</Text>
        <View style={{ backgroundColor: "#494547", borderRadius: 12, marginTop: screenHeight * 0.01, height: 53, marginLeft: 10, marginRight: 10,
}}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesScroll}
            style={{ alignSelf: "center" }}
            ref={scrollRef}
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
    backgroundColor: Colors.headerBGColor,
    height: screenHeight * 0.2,
    marginBottom: 10,
  },
  categoriesScroll: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  categoryText: {
    fontSize: 16,
    paddingTop: 5,
    color: "white",
    fontWeight: "bold",
  },
  categoryActiveText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  categoryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryActiveBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#5283b7",
  },
});

export default ClubsHeader;
