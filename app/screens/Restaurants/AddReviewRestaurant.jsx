import React, { useState, useRef } from 'react'
import { StyleSheet, View } from "react-native"
import { AirbnbRating, Button, Input } from "react-native-elements"
import Toast from "react-native-easy-toast"
import Loading from "../../components/Loading"
import { FirebaseApp } from "../../utils/FireBase"
import firebase from "firebase/app"
import "firebase/firestore"
const db = firebase.firestore(FirebaseApp)

export default function AddReviewRestaurant(props) {
    const { navigation } = props
    const { idRestaurant, setReloadReviews } = navigation.state.params
    const [rating, setRating] = useState(null)
    const [title, setTitle] = useState("")
    const [review, setReview] = useState("")
    const toastRef = useRef()
    const [isLoading, setIsLoading] = useState(false)

    const addReview = () => {
        if (rating === null) {
            toastRef.current.show("No has dado ninguna puntación")
        } else if (!title) {
            toastRef.current.show("El título es obligatorio")
        } else if (!review) {
            toastRef.current.show("El comentario es obligatorio")
        } else {
            setIsLoading(true)
            const user = firebase.auth().currentUser;
            const payload = {
                idUser: user.uid,
                avatarUser: user.photoURL,
                idRestaurant,
                title,
                review,
                rating,
                createAt: new Date()
            }
            db.collection("reviews").add(payload).then(() => {
                updateRestaurant();
            }).catch(() => {
                toastRef.current.show("Error al enviar la review, inténtelo más tarde", 3000)
                setIsLoading(false)
            })
        }
    }


    const updateRestaurant = () => {
        const restaurantRef = db.collection("restaurants").doc(idRestaurant);

        restaurantRef.get().then(response => {
            const restaurantData = response.data();
            const ratingTotal = restaurantData.ratingTotal + rating;
            const totalVotes = restaurantData.totalVotes + 1;
            const ratingResult = ratingTotal / totalVotes;

            restaurantRef.update({ rating: ratingResult, ratingTotal, totalVotes }).then(() => {
                setIsLoading(false);
                setReloadReviews(true)
                navigation.goBack();
            })
        })

    }

    return (
        <View style={styles.viewBody}>
            <View style={styles.viewRating}>
                <AirbnbRating
                    count={5}
                    reviews={["Pésimo", "Deficiente", "Normal", "Bueno", "Excelente"]}
                    defaultRating={0}
                    size={35}
                    onFinishRating={value => setRating(value)}
                />
            </View>
            <View style={styles.FormReview}>
                <Input
                    placeholder="Titulo"
                    containerStyle={styles.Input}
                    onChange={e => setTitle(e.nativeEvent.text)}
                />
                <Input
                    placeholder="Comentario"
                    multiline={true}
                    inputContainerStyle={styles.textArea}
                    onChange={e => setReview(e.nativeEvent.text)}

                />
                <Button title="Enviar comentario" buttonStyle={styles.btn} containerStyle={styles.btnContainer} onPress={addReview} />
            </View>
            <Toast ref={toastRef} position="center" opacity={0.5} />
            <Loading isVisible={isLoading} text="Enviando comentario" />
        </View>
    )
}

const styles = StyleSheet.create({
    viewBody: {
        flex: 1
    },
    viewRating: {
        height: 110,
        backgroundColor: "#f2f2f2"
    },
    FormReview: {
        flex: 1,
        alignItems: "center",
        margin: 10,
        marginTop: 25
    },
    Input: {
        marginBottom: 10
    },
    textArea: {
        height: 150,
        width: "100%",
        padding: 0,
        margin: 0
    },
    btnContainer: {
        flex: 1,
        justifyContent: "flex-end",
        marginTop: 20,
        marginBottom: 10,
        width: "95%"
    },
    btn: {
        backgroundColor: "#00a680"
    }
})