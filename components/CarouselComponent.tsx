import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const screenWidth = Dimensions.get("window").width;

const images = [
  require("@/assets/images/image1.png"),
  require("@/assets/images/image2.png"),
  require("@/assets/images/image3.png"),
];

const CarouselComponent: React.FC = () => {
  return (
    <View style={styles.carouselContainer}>
      <Carousel
        loop
        width={screenWidth - 40} // Padding on both sides
        height={200}
        autoPlay={true}
        data={images}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <Image source={item} style={styles.carouselImage} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    width: screenWidth,
    paddingHorizontal: 20, // Padding on both sides
    marginTop: 20,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});

export default CarouselComponent;
