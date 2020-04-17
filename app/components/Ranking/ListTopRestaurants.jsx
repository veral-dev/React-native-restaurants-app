import React, { useState, useEffect } from 'react'
import { StyleSheet, View, FlatList, ScrollView, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Card, Image, Icon, Rating } from "react-native-elements"
import * as firebase from "firebase"

export default function ListTopRestaurants(props) {
    const { restaurants, navigation } = props
    console.log(props)

    return (
        <FlatList
            data={restaurants}
            renderItem={restaurant => <Restaurant restaurant={restaurant} navigation={navigation} />}
            keyExtractor={(item, index) => index.toString()}
        />
    )
}

function Restaurant(props) {
    const { restaurant, navigation } = props
    const { name, description, images, rating } = restaurant.item
    const [imageRestaurant, setImageRestaurant] = useState(null)
    const [iconColor, setIconColor] = useState("#000")

    useEffect(() => {

        const image = images[0]
        firebase
            .storage()
            .ref(`restaurants-images/${image}`)
            .getDownloadURL()
            .then(response => {
                setImageRestaurant(response)
            })
    }, [])

    useEffect(() => {

        if (restaurant.index === 0) {
            setIconColor("#efb819")
        } else if (restaurant.index === 1) {
            setIconColor("#e3e4e5")
        } else if (restaurant.index === 2) {
            setIconColor("#cd7f32")
        }

    }, [])

    return (
        <TouchableOpacity onPress={() => navigation.navigate("Restaurant", {
            restaurant: restaurant.item
        })}>
            <Card containerStyle={styles.containerCard}>
                <Icon
                    type="material-community"
                    name="chess-queen"
                    color={iconColor}
                    size={40}
                    containerStyle={styles.containerIcon}
                />
                <Image
                    style={styles.restaurantImage}
                    resizeMode={"cover"}
                    source={{ uri: imageRestaurant }}
                />
            </Card>
            <View style={styles.ratingTitle}>
                <Text style={styles.name}>
                    {name}
                </Text>
                <Rating
                    imageSize={20}
                    startingValue={rating}
                    style={styles.rating}
                    readonly
                />
            </View>
            <Text style={styles.description}>
                {description}
            </Text>
        </TouchableOpacity>


    )
}


const styles = StyleSheet.create({

    containerCard: {
        marginBottom: 10,
        borderWidth: 0
    },
    containerIcon: {
        position: "absolute",
        top: -30,
        left: -30,
        zIndex: 1
    },
    restaurantImage: {
        width: "100%",
        height: 200
    },
    ratingTitle: {
        flexDirection: "row",
        marginTop: 10
    },
    name: {
        fontSize: 20,
        fontWeight: "bold"
    },
    rating: {
        position: "absolute",
        right: 0
    },
    description: {
        color: "grey",
        marginTop: 0,
        textAlign: "justify"
    }
})