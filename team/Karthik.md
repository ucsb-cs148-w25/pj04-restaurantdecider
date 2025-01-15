# Who am I?

I'm a third year computer science major. I'm most experienced with Python, Java, and C++.

# Project Ideas

## Possible Names
* WeEat

## Features
* Add a group of friends
* Each person has a set of restaurants they like/cuisines they like
* Dietary restrictions (veg, vegan, etc.)
* They have addresses/locations
* Find a restaurant that maximizes weighted average of rating and minimizes distance cost
* Rating
	* Minimize $$\sum_{p_i \in g} ({\textrm{rating of }p_i} - 5.0)^2$$ where $g$ is the group who want to dine together and $p_i$ is a person in that group
	* Also minimize $$\sum_{p_i \in g} (\textrm{commute time})^2$$
* Prior to these operations filter out any restaurants that do not have options for those with the aforementioned restrictions

## Implementation
* Source ratings from Yelp API and/or Google reviews
	* weigh them, e.g. 100% for one or the other if reviews for the other do not exist
	* could do this if people in the group haven't visited that type of restaurant yet
* Encrypt data in transit/rest
	* AES 256
* Flask for backend, React for front end