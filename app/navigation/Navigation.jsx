import React from "react";
import { Icon } from "react-native-elements";
import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";
import RestaurantsScreenStacks from "./RestaurantsStacks";
import TopListScreenStacks from "./TopListStacks";
import SearchScreenStacks from "./SearchStacks";
import AccountScreenStacks from "./AccountStacks";
import FavouritesScreenStacks from "./FavouritesStack";


const NavigationStacks = createBottomTabNavigator(
  {
    Restaurants: {
      screen: RestaurantsScreenStacks,
      navigationOptions: () => ({
        tabBarLabel: "Restaurantes",
        tabBarIcon: ({ tintColor }) => (
          <Icon
            type="material-community"
            name="compass-outline"
            size={22}
            color={tintColor}
          />
        ),
      }),
    },
    TopLists: {
      screen: TopListScreenStacks,
      navigationOptions: () => ({
        tabBarLabel: "Ranking",
        tabBarIcon: ({ tintColor }) => (
          <Icon
            type="material-community"
            name="star-outline"
            size={22}
            color={tintColor}
          />
        ),
      }),
    },
    Favourites: {
      screen: FavouritesScreenStacks,
      navigationOptions: () => ({
        tabBarLabel: "Favoritos",
        tabBarIcon: ({ tintColor }) => (
          <Icon type="material-community"
            name="heart-outline"
            size={22}
            color={tintColor} />)
      })
    },
    Search: {
      screen: SearchScreenStacks,
      navigationOptions: () => ({
        tabBarLabel: "Buscar",
        tabBarIcon: ({ tintColor }) => (
          <Icon
            type="material-community"
            name="magnify"
            size={22}
            color={tintColor}
          />
        ),
      }),
    },
    Account: {
      screen: AccountScreenStacks,
      navigationOptions: () => ({
        tabBarLabel: "Cuenta",
        tabBarIcon: ({ tintColor }) => (
          <Icon
            type="material-community"
            name="home-outline"
            size={22}
            color={tintColor}
          />
        ),
      }),
    },
  },
  {
    initialRouteName: "Restaurants",
    order: ["Restaurants", "Favourites", "TopLists", "Search", "Account"],
    tabBarOptions: {
      activeTintColor: "#00a680",
      inactiveTintColor: "#646464",
    },
  }
);

export default createAppContainer(NavigationStacks);
