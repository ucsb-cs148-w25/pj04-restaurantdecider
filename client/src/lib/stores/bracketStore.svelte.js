let restaurantsList = $state({});

export function getRestaurantsList() {
    return restaurantsList;
}

export function setRestaurantsList(newList) {
    restaurantsList = newList;
}