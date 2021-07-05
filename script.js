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

// function handleSearch(event){
//     console.log("sdf")
//     event.preventDefault()
//     var user = input.val()
//     console.log(user)

//     var apiUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + user + '&appid=c371c3c576ed97f2a811b3246c1db709';
//     console.log(apiUrl)
//   fetch(apiUrl)
//     .then(function (response) {
//       if (response.ok) {
//         console.log(response);
//         response.json().then(function (data) {
//           console.log(data);
//           displayTemp(data, user);
//         });
//       } else {
//         // alert('Error: ' + response.statusText);
//       }
//     })
//     .catch(function (error) {
//     //   alert('Unable to connect to Weather app');
//     });
//     function displayTemp(data, user){
//         var city = document.createElement('p');
//         city.textContent = user
//         city.style.weight = "bold"
//         displayEl.append(city)


//         var temp = document.createElement('p');
//         temp.textContent = data.list[0].main.temp
//         displayEl.append(temp)

//         var wind = document.createElement('p')
//         wind.textContent = data.list[0].wind.speed
//         console.log(wind)
//         displayEl.append(wind)

//         var humidity = document.createElement('p');
//         humidity.textContent = data.list[0].main.humidity
//         displayEl.append(humidity)

//         displayEl.addClass('border')
//     }
// };

// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event) {
  event.preventDefault();
  if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    $("#div-weather").show();
    currentWeather(city);
  }
}

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


$("#search-button").on("click", displayWeather);
$(".list-group").on("click", invokePastSearch);
$("#clear-history").on("click", clearHistory);