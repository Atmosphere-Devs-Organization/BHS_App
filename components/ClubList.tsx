import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Club } from "@/interfaces/club";
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
        borderWidth: 1,
        borderRadius: 30,
        margin: 5,
        backgroundColor: Colors.clubBG,
      }}
    >
      <TouchableOpacity>
        <View style={styles.club}>
          <Image source={{ uri: item.imageURL }} style={styles.image} />
          <View style={styles.bottomText}>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.descText}>{item.shortDescription}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
  return (
    <View>
      {clubs ? (
        <FlatList data={filteredClubs} ref={listRef} renderItem={renderRow} />
      ) : (
        <Text>Loading</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  club: { padding: 16 },
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
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.nameText,
    marginLeft: 10,
    marginBottom: 5,
  },
  descText: {
    fontSize: 14,
    color: Colors.descText,
    marginLeft: 20,
    width: "90%",
  },
});

export default ClubList;
