import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity } from "react-native"
import { Image, Icon, Button } from "react-native-elements"
import Toast from "react-native-easy-toast"
import { firebaseApp } from "../utils/FireBase"
import firebase from "firebase/app"
import "firebase/firestore"
import Loading from "../components/Loading"
import { NavigationEvents } from "react-navigation"

const db = firebase.firestore(firebaseApp)

export default function Favourites(props) {
    const { navigation } = props
    const [restaurants, setRestaurants] = useState([])
    const [reloadRestaurants, setReloadRestaurants] = useState(false)
    const [isVisibleLoading, setIsVisibleLoading] = useState(false)
    const toastRef = useRef()
    const [userLogged, setUserLogged] = useState(false)

    firebase.auth().onAuthStateChanged(user => {
        user ? setUserLogged(true) : setUserLogged(false)
    })


    useEffect(() => {

        if (userLogged) {

        db.collection("favourites")
            .where("userId", "==", firebase.auth().currentUser.uid)
            .get()
            .then(response => {
                const restaurantsIdArray = []
                response.forEach(doc => {
                    restaurantsIdArray.push(doc.data().restaurantId)
                })
                getRestaurantsData(restaurantsIdArray).then(response => {
                    const restaurants = [];
                    response.forEach(doc => {
                        let restaurant = doc.data()
                        restaurant.id = doc.id
                        restaurants.push(restaurant)
                    });
                    setRestaurants(restaurants)
                })
            })
        }
        setReloadRestaurants(false)


    }, [reloadRestaurants])

    const getRestaurantsData = restaurantsIdArray => {
        const arrayRestaurants = []
        restaurantsIdArray.forEach(restaurantId => {
            const result = db.collection("restaurants").doc(restaurantId).get()
            arrayRestaurants.push(result)

        })
        return Promise.all(arrayRestaurants)
    }

    if (!userLogged) {

        return (
            <UserNotLogged setReloadRestaurants={setReloadRestaurants} navigation={navigation} />
        )
    }
    if (restaurants.length === 0) return <NotFoundRestaurants setReloadRestaurants={setReloadRestaurants} />


    return (
        <View style={styles.viewBody}>
            <NavigationEvents onWillFocus={() => setReloadRestaurants(true)} />
            {restaurants ? (
                <FlatList
                    data={restaurants}
                    renderItem={restaurant => (
                        <Restaurant
                            restaurant={restaurant}
                            navigation={navigation}
                            setIsVisibleLoading={setIsVisibleLoading}
                            setReloadRestaurants={setReloadRestaurants}
                            toastRef={toastRef} />)}
                    keyExtractor={(item, index) => index.toString()}
                />
            ) : (
                    <View style={styles.loaderRestaurants}>
                        <ActivityIndicator size="large" />
                        <Text>Cargando restaurantes</Text>
                    </View>
                )}
            <Toast ref={toastRef} position="center" opacity={1} />
            <Loading text="Eliminando restaurante" isVisible={isVisibleLoading} />
        </View>
    )

    function Restaurant(props) {
        const { restaurant, navigation, setIsVisibleLoading, setReloadRestaurants, toastRef } = props;
        const { id, name, images } = restaurant.item
        const [restaurantImage, setRestaurantImage] = useState(null)
        useEffect(() => {

            const image = images[0]
            firebase
                .storage()
                .ref(`restaurants-images/${image}`)
                .getDownloadURL()
                .then(response => {
                    setRestaurantImage(response)
                })



        }, [])


        const confirmRemoveFavourite = () => {

            Alert.alert(
                "Eliminar restaurante de favoritos",
                "¿Estas seguro de que deseas eliminar el restaurante de favoritos?",
                [{
                    text: "Cancelar",
                    style: "Cancel"
                },
                {
                    text: "Eliminar",
                    onPress: removeFavourite

                }
                ],
                { cancelable: false }
            )
        }

        const removeFavourite = () => {
            setIsVisibleLoading(true)
            db.collection("favourites")
                .where("restaurantId", "==", id)
                .where("userId", "==", firebase.auth().currentUser.uid)
                .get().then(response => {
                    response.forEach(doc => {
                        const favouriteId = doc.id
                        db.collection("favourites")
                            .doc(favouriteId)
                            .delete()
                            .then(() => {
                                setIsVisibleLoading(false)
                                setReloadRestaurants(true)
                                toastRef.current.show("Restaurante eliminado correctamente")
                            }).catch(() => {
                                toastRef.current.show("Error al eliminar el restaurante, inténtelo más tarde")
                            })
                    })
                })

        }


        return (
            <View style={styles.restaurant}>
                <TouchableOpacity onPress={() => navigation.navigate("Restaurant", { restaurant: restaurant.item })}>
                    <Image
                        resizeMode="cover"
                        source={{ uri: restaurantImage }}
                        style={styles.image}
                        PlaceholderContent={<ActivityIndicator color={"#fff"} />}
                    />
                </TouchableOpacity>
                <View style={styles.info}>
                    <Text style={styles.name}>{name}</Text>
                    <Icon
                        type="material-community"
                        name="heart"
                        color="#00a680"
                        containerStyle={styles.favourite}
                        onPress={confirmRemoveFavourite}
                        size={40}
                        underlayColor="transparent"
                    />
                </View>
            </View>
        )
    }
}

function NotFoundRestaurants(props) {
    const { setReloadRestaurants } = props
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <NavigationEvents onWillFocus={() => setReloadRestaurants(true)} />
            <Icon
                type="material-community"
                name="alert-outline"
                size={50}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                No tienes restaurantes en la lista
             </Text>
        </View>
    )
}

function UserNotLogged(props) {
    const { setReloadRestaurants, navigation } = props
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <NavigationEvents onWillFocus={() => setReloadRestaurants(true)} />
            <Icon
                type="material-community"
                name="alert-outline"
                size={50}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
                Necesitas estar logueado para ver esta sección
             </Text>
            <Button
                title="Ir al Login"
                onPress={() => navigation.navigate("Login")}
                containerStyle={{ marginTop: 20, width: "80%" }}
                buttonStyle={{ backgroundColor: "#00a680" }}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    loaderRestaurants: {
        marginTop: 10,
        marginBottom: 10
    },
    viewBody: {
        flex: 1,
        backgroundColor: "#f2f2f2"
    },
    restaurant: {
        margin: 10,
    },
    image: {
        width: "100%",
        height: 180
    },
    info: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        marginTop: -30,
        backgroundColor: "#fff"
    },
    name: {
        fontWeight: "bold",
        fontSize: 20
    },
    favourite: {
        marginTop: -35,
        padding: 15,
        borderRadius: 100,
        backgroundColor: "#fff"
    }
})