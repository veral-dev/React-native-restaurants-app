import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, ScrollView, Text, Dimensions } from "react-native"
import { Rating, Icon, ListItem } from 'react-native-elements'
import Carousel from "../../components/Carousel"
import Map from "../../components/Map"
import ListReviews from "../../components/Restaurants/ListReviews"
import { firebaseApp } from "../../utils/FireBase"
import firebase from "firebase/app"
import "firebase/firestore"
import Toast from "react-native-easy-toast"


const db = firebase.firestore(firebaseApp)

const screenWidth = Dimensions.get("window").width;

export default function Restaurant(props) {

    const { navigation } = props
    const { restaurant } = navigation.state.params
    const [imagesRestaurant, setImagesRestaurant] = useState([])
    const [rating, setRating] = useState(restaurant.rating)
    const [isFavourite, setIsFavourite] = useState(false)
    const [userLogged, setUserLogged] = useState(false)
    const toastRef = useRef()

    firebase.auth().onAuthStateChanged(user => {
        user ? setUserLogged(true) : setUserLogged(false)
    })

    useEffect(() => {
        const arrayUrls = [];
        (async () => {
            await Promise.all(restaurant.images.map(async idImage => {
                await firebase.storage().ref(`restaurants-images/${idImage}`).getDownloadURL()
                    .then(imageUrl => arrayUrls.push(imageUrl))
            }))
            setImagesRestaurant(arrayUrls)
        })()
    }, [])

    useEffect(() => {
        if (userLogged) {

            db.collection("favourites")
                .where("restaurantId", "==", restaurant.id)
                .where("userId", "==", firebase.auth().currentUser.uid)
                .get().then(response => {
                    if (response.docs.length === 1) {
                        setIsFavourite(true)
                    }
                })

        }

    }, [])

    const addFavourite = () => {

        if (!userLogged) {
            toastRef.current.show("Para usar el sistema de favoritos tienes que estar logueado", 3000)
        } else {

            const payload = {
                userId: firebase.auth().currentUser.uid,
                restaurantId: restaurant.id
            }
            db.collection("favourites").add(payload).then(() => {
                setIsFavourite(true)
                toastRef.current.show("Restaurante añadido a favoritos", 3000)
            }).catch(() => {
                toastRef.current.show("Error al añadir el restaurante a favoritos", 3000)
            })
        }

    }

    const removeFavourite = () => {
        db.collection("favourites")
            .where("restaurantId", "==", restaurant.id)
            .where("userId", "==", firebase.auth().currentUser.uid)
            .get()
            .then(response => {
                response.forEach(doc => {
                    const favouriteId = doc.id
                    db.collection("favourites")
                        .doc(favouriteId)
                        .delete()
                        .then(() => {
                            setIsFavourite(false)
                            toastRef.current.show("Restaurante eliminado de favoritos")
                        }).catch(() => {
                            toastRef.current.show("Error al eliminar el restaurante de favoritos")
                        })
                })
            })

    }

    return (
        <ScrollView style={styles.viewBody}>
            <View style={styles.viewFavourite}>
                <Icon
                    type="material-community"
                    name={isFavourite ? "heart" : "heart-outline"}
                    onPress={isFavourite ? removeFavourite : addFavourite}
                    color={isFavourite ? "#00a680" : "#000"}
                    size={35}
                    underlayColor="transparent"
                />
            </View>
            <Carousel
                arrayImages={imagesRestaurant}
                width={screenWidth}
                height={200}
            />
            <TitleRestaurant
                name={restaurant.name}
                description={restaurant.description}
                rating={rating} />
            <RestaurantInfo
                location={restaurant.location}
                name={restaurant.name}
                address={restaurant.address}
            />
            <ListReviews
                navigation={navigation}
                idRestaurant={restaurant.id}
                setRating={setRating}
            />
            <Toast ref={toastRef} position="center" opacity={0.5} />

        </ScrollView>
    )
}

function TitleRestaurant(props) {
    const { name, description, rating } = props

    return (
        <View style={styles.viewRestaurantTitle}>
            <View >
                <Text style={styles.restaurantName}>{name}</Text>
                <Rating style={styles.rating}
                    imageSize={20}
                    readonly
                    startingValue={parseFloat(rating)}
                />
            </View>
            <Text style={styles.restaurantDescription}>{description}</Text>

        </View>
    )
}

function RestaurantInfo(props) {
    const { location, name, address } = props
    //TO DO METER CAMPOS EN ADDRESTAURANTFORM, TELEFONO E EMAIL
    const listInfo = [
        {
            text: address,
            iconName: "map-marker",
            iconType: "material-community",
            action: null
        },
        {
            text: "91-769-48-32",
            iconName: "phone",
            iconType: "material-community",
            action: null
        },
        {
            text: "reservas@restaurante.es",
            iconName: "at",
            iconType: "material-community",
            action: null
        }

    ]

    return (
        <View style={styles.viewRestaurantInfo}>

            <Text style={styles.restaurantInfoTitle}>
                Información del restaurante
        </Text>
            <Map location={location} name={name} height={150} />
            {listInfo.map((item, index) => (

                <ListItem
                    key={index}
                    title={item.text}
                    leftIcon={{
                        name: item.iconName,
                        type: item.iconType,
                        color: "#00a680"
                    }}
                    containerStyle={styles.containerListItem}

                />
            )
            )}
        </View>
    )

}

const styles = StyleSheet.create({
    viewBody: {
        flex: 1
    },
    viewRestaurantTitle: {
        margin: 15
    },
    restaurantName: {
        fontWeight: "bold",
        fontSize: 20
    },
    rating: {
        position: "absolute",
        right: 0,
    },
    restaurantDescription: {
        marginTop: 5,
        color: "grey"
    },
    viewRestaurantInfo: {
        margin: 15,
        marginTop: 25
    },
    restaurantInfoTitle: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 10
    },
    containerListItem: {
        borderBottomColor: "#d8d8d8",
        borderBottomWidth: 1
    },
    viewFavourite: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 2,
        backgroundColor: "#fff",
        borderBottomLeftRadius: 100,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 15,
        paddingRight: 5
    }
})