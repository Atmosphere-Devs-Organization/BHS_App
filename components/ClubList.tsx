import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Club } from "@/interfaces/Club";
import { Link } from "expo-router";
import Colors from "@/constants/Colors";

interface Props {
  clubs: Club[];
  category: string;
}

const Empty = <></>;

const ClubList = ({ clubs, category }: Props) => {
  const listRef = useRef<FlatList>(null);

  const [filteredClubs, setFilteredClubs] = useState<Club[]>(clubs);

  useEffect(() => {
    setFilteredClubs(
      clubs.filter((club) => club.categories.includes(category))
    );
  }, [category]);

  const renderRow: ListRenderItem<Club> = ({ item }) => (
    <Link
      href={"/clubPage/" + item.id}
      asChild
      style={{
        borderWidth: 5,
        borderRadius: 30,
        margin: 25,
        backgroundColor: "white",
        borderColor: "orange",
      }}
    >
      <TouchableOpacity>
        <View style={styles.club}>
          <ImageBackground source={{ uri: item.imageURL }} style={styles.image}>
            <Text style={styles.nameText}>{item.name}</Text>
          </ImageBackground>
        </View>
      </TouchableOpacity>
    </Link>
  );
  return (
    <View style={{ marginBottom: 100 }}>
      {clubs ? (
        <FlatList data={filteredClubs} ref={listRef} renderItem={renderRow} />
      ) : (
        <Text>Loading</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  club: {
    padding: 16,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: Colors.imageBorderColor,
  },
  bottomText: {
    borderWidth: 2,
    padding: 7,
    borderRadius: 20,
    borderColor: Colors.textBorderColor,
    marginTop: 7,
    backgroundColor: Colors.AmarButton,
  },
  nameText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginLeft: 10,
    marginBottom: 5,
  },
  descText: {
    fontSize: 14,
    color: "#d3d3d3",
    marginLeft: 20,
    width: "90%",
  },
});

export default ClubList;
