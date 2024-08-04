import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
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
        marginHorizontal: 25,
        marginVertical: 10,
      }}
    >
      <TouchableOpacity>
        <View style={styles.club}>
          <ImageBackground
            source={{ uri: item.imageURL }}
            style={styles.image}
            resizeMode="cover"
            imageStyle={{ borderRadius: 15 }}
          >
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
  club: {},
  image: {
    alignSelf: "center",
    width: "100%",
    borderWidth: 5,
    borderRadius: 20,
    borderColor: "orange",
    backgroundColor: "white",
    justifyContent: "center",
    flex: 1,
    flexDirection: "column",
  },
  nameText: {
    fontSize: 25,
    fontWeight: "bold",
    color: Colors.clubListName,
    textAlign: "center",
    // borderWidth: 2.5,
    alignSelf: "center",
    marginBottom: 80,
    marginTop: 10,
    marginHorizontal: 10,
    // borderColor: Colors.clubNameBorder,
    //backgroundColor: Colors.clubNameBG,
    textShadowColor: "#000",
    textShadowOffset: { width: -2, height: -2 },
    textShadowRadius: 10,
    elevation: 5,
    padding: 6,
  },
});

export default ClubList;
