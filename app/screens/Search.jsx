import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Image } from "react-native";
import { SearchBar, ListItem, Icon } from "react-native-elements"
import { FireSQL } from "firesql"
import firebase from "firebase/app"
import { useDebouncedCallback } from 'use-debounce'

const fireSQL = new FireSQL(firebase.firestore(), { includeId: "id" })

export default function Search(props) {
  const { navigation } = props
  const [restaurants, setRestaurants] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {

    // if (search) {
    //   // TO DO CONTROLAR MINUSCULAS
    //   fireSQL.query(`SELECT * FROM restaurants WHERE name LIKE '${search}%'`)
    //     .then(response => {
    //       setRestaurants(response)
    //     })
    // }

    // onSearch();

  }, [search])

  const [onSearch] = useDebouncedCallback(() => {

    if (search) {
      // TO DO CONTROLAR MINUSCULAS
      fireSQL.query(`SELECT * FROM restaurants WHERE name LIKE '${search}%'`)
        .then(response => {
        setRestaurants(response)
      })
    }

  },500)

  return (
    <View>
      <SearchBar
        placeholder="Buscar restaurante"
        onChangeText={e => setSearch(e)}
        value={search}
        containerStyle={styles.searchBar}
      />
      {restaurants.length === 0 ? (
        <NoFoundRestaurants />
      ) : (
          <FlatList
            data={restaurants}
            renderItem={restaurant => <Restaurant restaurant={restaurant} navigation={navigation} />}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
    </View>
  );
}

function Restaurant(props) {
  const { restaurant, navigation } = props
  const { name, images } = restaurant.item
  const [imageRestaurant, setImageRestaurant] = useState(null)

  useEffect(() => {

    const image = images[0]

    firebase.storage()
      .ref(`restaurants-images/${image}`)
      .getDownloadURL()
      .then(response => {
        setImageRestaurant(response)
      })
  }, [])

  return (

    <ListItem
      title={name}
      leftAvatar={{ source: { uri: imageRestaurant } }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={() => navigation.navigate("Restaurant", { restaurant: restaurant.item })}
    />
  )
}

function NoFoundRestaurants() {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Image
        source={require("../../assets/img/noresults.png")}
        resizeMode="cover"
        style={{ width: 200, height: 200 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 20,

  }
})