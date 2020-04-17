
import { createStackNavigator } from "react-navigation-stack"
import FavouritesScreen from "../screens/Favourites"

const FavouritesScreenStacks = createStackNavigator({
    Favourites: {
        screen: FavouritesScreen,
        navigationOptions: () => ({
            title: "Restaurantes favoritos"
        })
    }
});

export default FavouritesScreenStacks