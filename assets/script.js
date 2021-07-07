// variable declaration
var searchInputEl = $("#input-city");
var searchButtonEl = $("#input-button");
var removeButtonEl = $("#remove-history");
var currentCityHeaderEl = $("#current-city");
var currentTemperatureTextEl = $("#temperature");
var currentHumidtyTextEl = $("#humidity");
var currentWindSpeedTextEl = $("#wind");
var currentUVindexTextElTextEl = $("#uv-index");
var searchedCities = [];

//Set up the API key
const APIKey = "c371c3c576ed97f2a811b3246c1db709";

//Call function on page load
$(window).on("load", loadPreviouslySearchedCity);

// function runs on load of the page and renders the page
function loadPreviouslySearchedCity() {
  // $("#div-weather").hide();
  $("ul").empty();
  //Get all cities stored in the local storage as part of previous searches
  var searchedCities = JSON.parse(
    localStorage.getItem("previouslySearchedCity")
  );

  if (searchedCities !== null) {
    //For each previously searched city, add city to the unordered list.
    for (i = 0; i < searchedCities.length; i++) {
      addToHistoryList(searchedCities[i]);
    }
    //Set city to the last city searched in the local storage
    city = searchedCities[i - 1];

    //Show weather forecase div if city is available on page load
    $("#div-weather").show();

    //Call current weather for the last city searched.
    getCurrentWeather(city);
  }
}

// Display the curent and future weather to the user after grabing the city form the input text box.
function getWeather(event) {
  event.preventDefault();
  if (searchInputEl.val().trim() !== "") {
    city = searchInputEl.val().trim();
    getCurrentWeather(city);
  }
}

/*Here we make the API call using FETCH, 
//passing the last city from the local storage as 
the city parameter to the API call*/

function getCurrentWeather(city) {
  // Here we build the URL so we can get a data from server side.
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=metric" +
    "&APPID=" +
    APIKey;
  //Use fetch API for GET of current weather API from OpenWeatherMap API
  fetch(queryURL)
    .then(function (response) {
      return response.json();
    }) //pass actual json response to the function
    .then(function (data) {
      if (data.cod !== 200) {
        // $("#div-weather").hide();
        console.error();
        window.alert(
          "Enter a valid city name, this city could not be found. Error Code: " +
            data.cod
        );
        return console.error(data.cod);
      } else if (data.cod === 200) {
        $(searchInputEl).val("");
        // Converting unix timestamp (returned from API call) to moment format
        var date = moment.unix(data.dt).format("MM/DD/YYYY");
        //parse the response for name of city and concatinate the date.
        $(currentCityHeaderEl).html(data.name + " " + "(" + date + ")");

        //Display Temperature
        var temp = data.main.temp;
        var feelsLike = data.main.feels_like;
        //Display current temperature and concatenate degree C and feels like values
        $(currentTemperatureTextEl).html(
          temp.toFixed(2) +
            " &#8451" +
            " (Feels like: " +
            feelsLike.toFixed(2) +
            " &#8451" +
            ")"
        );

        // Display the Humidity
        $(currentHumidtyTextEl).html(data.main.humidity + "%");

        //Display Wind speed and convert to KPH
        var ws = data.wind.speed;
        var windsKPH = (ws * 3.6).toFixed(1);
        $(currentWindSpeedTextEl).html(windsKPH + " KPH");

        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        getUVIndex(data.coord.lon, data.coord.lat);

        //Call the forecast function with the city ID of the response.
        getForecastWeather(data.id);

        $("#div-weather").removeClass("d-none");
        $("#div-weather").addClass("d-block");

        //Store city in local storage if successful response from API i.e. 200
        if (data.cod == 200) {
          searchedCities = JSON.parse(
            localStorage.getItem("previouslySearchedCity")
          );
          if (searchedCities == null) {
            searchedCities = [];
            searchedCities.push(city.toUpperCase());
            localStorage.setItem(
              "previouslySearchedCity",
              JSON.stringify(searchedCities)
            );
            addToHistoryList(city);
          } else if (findInStorage(city) > 0) {
            searchedCities.push(city.toUpperCase());
            localStorage.setItem(
              "previouslySearchedCity",
              JSON.stringify(searchedCities)
            );
            addToHistoryList(city);
          }
        }
      }
    });
}

// This function returns the UVIindex response.
function getUVIndex(longitude, latitude) {
  //lets build the url for uvindex.
  var queryURL =
    "https://api.openweathermap.org/data/2.5/uvi?appid=" +
    APIKey +
    "&lat=" +
    latitude +
    "&lon=" +
    longitude;
  fetch(queryURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      $(currentUVindexTextElTextEl).html(data.value);
    });
}

// Here we display the 5 days forecast for the current city.
function getForecastWeather(cityid) {
  var queryURL =
    "https://api.openweathermap.org/data/2.5/forecast?id=" +
    cityid +
    "&units=metric" +
    "&appid=" +
    APIKey;
  fetch(queryURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      for (i = 0; i < 5; i++) {
        var date = new Date(
          data.list[(i + 1) * 8 - 1].dt * 1000
        ).toLocaleDateString();
        var iconcode = data.list[(i + 1) * 8 - 1].weather[0].icon;
        var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
        var tempC = data.list[(i + 1) * 8 - 1].main.temp.toFixed(2);
        var humidity = data.list[(i + 1) * 8 - 1].main.humidity;

        $("#forecast-date-" + i).html(date);
        $("#forecast-img-" + i).html("<img src=" + iconurl + ">");
        $("#forecast-temp-" + i).html(tempC + " &#8451");
        $("#forecast-humidity-" + i).html(humidity + "%");
      }
    });
}

//Daynamically add the passed city on the search history
function addToHistoryList(c) {
  var listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}

// searches the city to see if it exists in the entries from the storage
function findInStorage(city) {
  for (var i = 0; i < searchedCities.length; i++) {
    if (city.toUpperCase() === searchedCities[i]) {
      return -1;
    }
  }
  return 1;
}

// display the past search again when the list group item is clicked in search history
function searchWeatherAgain(event) {
  var liEl = event.target;
  //Update the selected item to active and all siblings to inactive
  $(event.target).attr("class", " list-group-item active");
  $(event.target)
    .siblings()
    .attr("class", "list-group-item list-group-item-secondary");
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    getCurrentWeather(city);
  }
}

//Clear the search history from the page
function clearSearchHistory(event) {
  event.preventDefault();
  searchedCities = [];
  localStorage.removeItem("previouslySearchedCity");
  document.location.reload();
}

//Click Handlers
$("#input-button").on("click", getWeather);
$(".list-group").on("click", searchWeatherAgain);
$("#remove-history").on("click", clearSearchHistory);