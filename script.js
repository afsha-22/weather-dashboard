var search = $('.btn-primary')
var input = $('#formGroupExampleInput')
var displayEl = $('.display')

function handleSearch(event){
    console.log("sdf")
    event.preventDefault()
    var user = input.val()
    console.log(user)

    var apiUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + user + ',us&appid=c371c3c576ed97f2a811b3246c1db709';
    console.log(apiUrl)
  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        console.log(response);
        response.json().then(function (data) {
          console.log(data);
          displayTemp(data, user);
        });
      } else {
        // alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
    //   alert('Unable to connect to Weather app');
    });
    function displayTemp(data, user){
        var para = document.createElement('p');
        para.textContent = data.list[0].main.temp
        console.log(data.list[0].main.temp)
        displayEl.append(para)
    }
};



search.on('click', handleSearch)