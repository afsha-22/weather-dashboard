// variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var cityValue = "";
var sCity = [];

//Set up the API key
const APIKey = "c371c3c576ed97f2a811b3246c1db709";

//Call function on page load
// $(window).on("load", loadlastCity);

//Click Handlers
$("#search-button").on("click", displayWeather);
$(".list-group").on("click", invokePastSearch);
$("#clear-history").on("click", clearHistory);

// function runs on load of the page and renders the page
function loadlastCity() {
  $("#div-weather").hide();
  $("ul").empty();
  //Get all cities stored in the local storage as part of previous searches
  var sCity = JSON.parse(localStorage.getItem("cityname"));
  if (sCity !== null) {
    //For each previously searched city, add city to the unordered list.
    for (i = 0; i < sCity.length; i++) {
      addToList(sCity[i]);
    }
    //Set city to the last city searched in the local storage
    city = sCity[i - 1];

    //Show weather forecase div if city is available on page load
    $("#div-weather").show();

    //Call current weather for the last city searched.
    currentWeather(city);
  }
}

// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    $("#div-weather").show();
    currentWeather(city);
  }
}

/*Here we make the API call using FETCH, 
//passing the last city from the local storage as 
the city parameter to the API call*/

function currentWeather(city) {
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
        $("#div-weather").hide();
        console.error();
        window.alert(
          "Enter a valid city name, this city could not be found. Error Code: " +
            data.cod
        );
        return console.error(data.cod);
      } else if (data.cod === 200) {
        //Show weather div if a successful API call is made for weather.
        $("#div-weather").show();

        //Empty search city once a valid city has been searched.
        $(searchCity).val("");
        // Using Moment to convert Unix date to specific format
        var date = moment.unix(data.dt).format("DD/MM/YYYY");
        //parse the response for name of city and concatinate the date.
        $(currentCity).html(data.name + " " + "(" + date + ")");

        //Display Temperature
        var temp = data.main.temp;
        var feelsLike = data.main.feels_like;
        //Display current temperature and concatenate degree C and feels like values
        $(currentTemperature).html(
          temp.toFixed(2) +
            " &#8451" +
            " (Feels like: " +
            feelsLike.toFixed(2) +
            " &#8451" +
            ")"
        );

        // Display the Humidity
        $(currentHumidty).html(data.main.humidity + "%");

        //Display Wind speed and convert to KPH
        var ws = data.wind.speed;
        var windsKPH = (ws * 3.6).toFixed(1);
        $(currentWSpeed).html(windsKPH + " KPH");

        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UVIndex(data.coord.lon, data.coord.lat);

        //Call the forecast function with the city ID of the response.
        forecast(data.id);

        //Store city in local storage if successful response from API i.e. 200
        if (data.cod == 200) {
          sCity = JSON.parse(localStorage.getItem("cityname"));
          if (sCity == null) {
            sCity = [];
            sCity.push(city.toUpperCase());
            localStorage.setItem("cityname", JSON.stringify(sCity));
            addToList(city);
          } else if (findInStorage(city) > 0) {
            sCity.push(city.toUpperCase());
            localStorage.setItem("cityname", JSON.stringify(sCity));
            addToList(city);
          }
        }
      }
    });
}

// This function returns the UVIindex response.
function UVIndex(longitude, latitude) {
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
      $(currentUvindex).html(data.value);
    });
}

// Here we display the 5 days forecast for the current city.
function forecast(cityid) {
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
      /*For loop to find the right index for the list as the API responds with 
      forecast of 5 days in 3 hour intervals*/
      for (i = 0; i < 5; i++) {
// Using Moment to convert Unix date to specific format
       var date = moment.unix(data.list[(i + 1) * 8 - 1].dt).format("DD/MM/YYYY");
        var iconcode = data.list[(i + 1) * 8 - 1].weather[0].icon;
        var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
        var tempC = data.list[(i + 1) * 8 - 1].main.temp.toFixed(2);
        var humidity = data.list[(i + 1) * 8 - 1].main.humidity;

        $("#fDate" + i).html(date);
        $("#fImg" + i).html("<img src=" + iconurl + ">");
        $("#fTemp" + i).html(tempC + " &#8451");
        $("#fHumidity" + i).html(humidity + "%");
      }
    });
}

// searches the city to see if it exists in the entries from the storage
function findInStorage(city) {
  for (var i = 0; i < sCity.length; i++) {
    if (city.toUpperCase() === sCity[i]) {
      return -1;
    }
  }
  return 1;
}

//Daynamically add the passed city on the search history
function addToList(c) {
  var listEl = $("<li>" + c.toUpperCase() + "</li>");
  $(listEl).attr("class", "list-group-item");
  $(listEl).attr("data-value", c.toUpperCase());
  $(".list-group").append(listEl);
}

// display the past search again when the list group item is clicked in search history
function invokePastSearch(event) {
  var liEl = event.target;
  //Update the selected item to active and all siblings to inactive
  $(event.target).attr("class", " list-group-item active");
  $(event.target)
    .siblings()
    .attr("class", "list-group-item list-group-item-secondary");
  if (event.target.matches("li")) {
    city = liEl.textContent.trim();
    currentWeather(city);
  }
}

//Clear the search history from the page
function clearHistory(event) {
  event.preventDefault();
  sCity = [];
  localStorage.removeItem("cityname");
  document.location.reload();
}