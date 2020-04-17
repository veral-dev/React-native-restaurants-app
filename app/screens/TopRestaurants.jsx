import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-easy-toast"
import { firebaseApp } from "../utils/FireBase"
import firebase from "firebase/app"
import "firebase/firestore"
import ListTopRestaurants from "../components/Ranking/ListTopRestaurants"
const db = firebase.firestore(firebaseApp)

export default function TopRestaurants(props) {
  const { navigation } = props
  const [restaurants, setRestaurants] = useState([])
  const toastRef = useRef()

  useEffect(() => {

    (async => {

      db.collection("restaurants")
        .orderBy("rating", "desc")
        .limit(5)
        .get()
        .then(response => {
          const restaurantsArray = []

          response.forEach(doc => {
            let restaurant = doc.data()
            restaurant.id = doc.id
            restaurantsArray.push(restaurant)
          })
          setRestaurants(restaurantsArray)
        }).catch(() => {
          toastRef.current.show("Error al cargar el rating, inténtelo mas tarde", 3000)
        })
    })()
  }, [])

  return (
    <View>
      <ListTopRestaurants restaurants={restaurants} navigation={navigation} />
      <Toast ref={toastRef} position="center" opacity={0.75} />
    </View>

  );
}