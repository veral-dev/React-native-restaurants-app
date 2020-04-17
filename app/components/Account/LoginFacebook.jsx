import React, { useState } from "react";
import { SocialIcon } from "react-native-elements";
import { FacebookApi } from "../../utils/Social";
import Loading from "../Loading";
import * as firebase from "firebase";
import * as Facebook from "expo-facebook";

export default function LoginFacebook(props) {
  const { toastRef, navigation } = props;
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    await Facebook.initializeAsync(FacebookApi.application_id);
    const {
      type,
      token,
    } = await Facebook.logInWithReadPermissionsAsync(
      FacebookApi.application_id,
      { permissions: FacebookApi.permissions }
    );

    if (type === "success") {
      setIsLoading(true);
      const credentials = firebase.auth.FacebookAuthProvider.credential(token);
      await firebase
        .auth()
        .signInWithCredential(credentials)
        .then(() => {
          navigation.navigate("MyAccount");
        })
        .catch(() => {
          toastRef.current.show(
            "Error accediendo con Facebook, intentelo más tarde"
          );
        });
    } else if (type === "cancel") {
      toastRef.current.show("Inicio de sesión cancelado");
    } else {
      toastRef.current.show("Error desconocido, intentelo más tarde");
    }
    setIsLoading(false);
  };

  return (
    <>
      <SocialIcon
        title="Iniciar sesión con Facebook"
        button
        type="facebook"
        onPress={login}
      />
      <Loading isVisible={isLoading} text="Iniciando sesión" />
    </>
  );
}
