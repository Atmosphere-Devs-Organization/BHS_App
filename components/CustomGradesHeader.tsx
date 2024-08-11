import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, { useRef, useState } from "react";
import Colors from "@/constants/Colors";
import Numbers from "@/constants/Numbers";
import { MaterialIcons } from "@expo/vector-icons";

const clubCategories = [
  {
    name: "Grades",
    icon: "apps",
  },
  {
    name: "Calculator",
    icon: "calculate",
  },
  {
    name: "Transcript",
    icon: "stacked-bar-chart",
  },
];

interface Props {
  onCategoryChanged: (category: string) => void;
}

const ClubsHeader = ({ onCategoryChanged }: Props) => {
  const itemsRef = useRef<Array<TouchableOpacity | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef<ScrollView>(null);

  const selectCategory = (index: number) => {
    const selected = itemsRef.current[index];
    setActiveIndex(index);

    onCategoryChanged(clubCategories[index].name);
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.title}>Grades</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
              <MaterialIcons
                name={item.icon as any}
                size={24}
                color={
                  activeIndex === index
                    ? Colors.activeCatIcon
                    : Colors.normalCatIcon
                }
              />
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
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.headerBGColor,
    height: 230,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 70,
    padding: 5,
    borderRadius: 30,
    marginTop: 20,
  },
  categoriesScroll: {
    alignItems: "center",
    justifyContent: "center",
    gap: 70,
    paddingLeft: "4%",
  },
  categoryText: {
    fontSize: 14,
    paddingTop: 5,
    color: Colors.normalCatIcon,
  },
  categoryActiveText: {
    fontSize: 14,
    color: Colors.activeCatIcon,
  },
  categoryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
  },
  categoryActiveBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
    borderBottomColor: Colors.activeCatIcon,
    borderBottomWidth: 2,
  },
});

export default ClubsHeader;
