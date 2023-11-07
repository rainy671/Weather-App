let weatherAPIKey = "bf2582903969606c67fa17593fc288d3";
let weatherBaseEndPoint =
  "https://api.openweathermap.org/data/2.5/weather?&appid=" +
  weatherAPIKey +
  "&units=metric";
let forecastBaseEndPoint =
  "https://api.openweathermap.org/data/2.5/forecast?&appid=" + weatherAPIKey;
let geoEndPoint =
  "http://api.openweathermap.org/geo/1.0/direct?&appid=" +
  weatherAPIKey +
  "&limit=5";
let reverseGeoEndPoint =
  "http://api.openweathermap.org/geo/1.0/reverse?&appid=" +
  weatherAPIKey +
  "&limit=1";
show();
let inputBox = document.querySelector(".weather_search");
let city = document.querySelector(".weather_city");
let day = document.querySelector(".weather_day");
let humidity = document.querySelector(".weather_indicator--humidity>.value");
let wind = document.querySelector(".weather_indicator--wind>.value");
let pressure = document.querySelector(".weather_indicator--pressure>.value");
let temperature = document.querySelector(".weather_temperature>.value");
let image = document.querySelector(".weather_image");
let forecastBlock = document.querySelector(".weather_forecast");
let datalist = document.getElementById("suggestions");
let weatherImages = [
  {
    url: "images/broken-clouds.png",
    ids: [803, 804],
  },
  {
    url: "images/clear-sky.png",
    ids: [800],
  },
  {
    url: "images/snow.png",
    ids: [600, 601, 611, 612, 613, 615, 616, 620, 621, 622],
  },
  {
    url: "images/rain.png",
    ids: [500, 501, 502, 503, 504],
  },
  {
    url: "images/mist.png",
    ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
  },
  {
    url: "images/few-clouds.png",
    ids: [801],
  },
  {
    url: "images/shower-rain.png",
    ids: [520, 521, 522, 531],
  },
  {
    url: "images/thunderstorm.png",
    ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
  },
];
function show() {
  navigator.geolocation.getCurrentPosition(success, error, options);
}
var options = {
  enableHighAccuracy: true,
};
async function success(pos) {
  let crd = pos.coords;
  let lat = crd.latitude.toString();
  let lng = crd.longitude.toString();

  console.log(lat, lng);
  let endpoint = reverseGeoEndPoint + "&lat=" + lat + "&lon=" + lng;
  let response = await fetch(endpoint);
  let coords = await response.json();
  // console.log(coords);
  Swal.fire({
    icon: "success",
    title: "City Detected!",
    text: ` ${coords[0].name}, ${coords[0].state}`,
  });
  weatherForCity(coords[0].name);
}
function error(err) {
  // console.log(err.code, err.msg);
}

let getWeatherByCityName = async (city) => {
  let endpoint = weatherBaseEndPoint + "&q=" + city;
  let response = await fetch(endpoint);
  let weather = await response.json();

  // console.log(weather);

  return weather;
};
let updateCurrentWeather = (data) => {
  console.log(data);
  city.innerText = data.name;
  day.innerText = dayOfWeek();
  humidity.innerText = data.main.humidity;
  pressure.innerText = data.main.pressure;
  let windDir;
  let degree = data.wind.deg;
  if (degree > 45 && degree <= 135) {
    windDir = "East";
  } else if (degree > 135 && degree <= 225) {
    windDir = "South";
  } else if (degree > 225 && degree <= 315) {
    windDir = "West";
  } else {
    windDir = "North";
  }
  wind.innerText = windDir + "," + data.wind.speed;

  temperature.innerText =
    data.main.temp > 0 ? "+" + Math.round(data.main.temp) : data.main.temp;
  let weatherimg = data.weather[0].id;
  weatherImages.forEach((obj) => {
    if (obj.ids.indexOf(weatherimg) != -1) {
      image.src = obj.url;
    }
  });
};

let getForeCastByCityId = async (id) => {
  let endpoint = forecastBaseEndPoint + "&id=" + id;
  let response = await fetch(endpoint);
  let forecast = await response.json();
  // console.log(forecast);
  forecastList = forecast.list;
  // console.log(forecastList);
  let daily = [];
  forecastList.forEach((day) => {
    let date_txt = day.dt_txt;
    let dt = date_txt.replace(" ", "T");
    let date = new Date(dt);
    let hours = date.getHours();
    if (hours == 12) {
      daily.push(day);
    }
  });
  // console.log(daily);
  return daily;
};

let dayOfWeek = (dt) => {
  if (dt === undefined) {
    dt = new Date().getTime();
  }
  let day = new Date(dt).toLocaleDateString("en-En", { weekday: "long" });
  return day;
};
//getWeatherByCityName("Bhopal");
// let cityName = () => {
let weatherForCity = async (city) => {
  // console.log(inputBox.value);
  let weather = await getWeatherByCityName(city);

  // console.log(weather);
  if (weather.cod === "404") {
    Swal.fire({
      icon: "error",
      title: "OOPS...",
      text: "You typed wrong city name",
    });
    return;
  }
  updateCurrentWeather(weather);
  let cityID = weather.id;
  let forecast = await getForeCastByCityId(cityID);
  updateForecast(forecast);
};
inputBox.addEventListener("keydown", async (e) => {
  if (e.keyCode === 13) {
    weatherForCity(inputBox.value);
  }
});
inputBox.addEventListener("input", async () => {
  if (inputBox.value.length <= 2) {
    return;
  }
  let endpoint = geoEndPoint + "&q=" + inputBox.value;
  let response = await fetch(endpoint);
  let geocode = await response.json();
  datalist.innerHTML = "";
  // console.log(geocode);
  geocode.forEach((city) => {
    let option = document.createElement("option");

    option.value = `${city.name}${city.state ? "," + city.state : ""},${
      city.country
    }`;
    datalist.appendChild(option);
  });
});

updateForecast = (forecast) => {
  forecastBlock.innerHTML = "";
  let forecastItem = "";

  forecast.forEach((day) => {
    let iconURL =
      "http://openweathermap.org/img/wn/" + day.weather[0].icon + "@2x.png";
    let temp = day.main.temp - 273;
    let temperature = temp > 0 ? "+" + Math.round(temp) : temp;
    let dayname = dayOfWeek(day.dt * 1000);
    // console.log(dayname);
    forecastItem += `<div class="col-xl-2 col-md-4 align-item-center mt-3  "><article class="weather_forecast_item card "> <div class="text-center"><img
    src="${iconURL}"
    alt="${day.weather[0].description}"
    class="weather_forecast_icon card-img  "
  />
  </div>
  <div class="card-body"> <h3 class="weather_forecast_day">${dayname}</h3>
  <p class="weather_forecast_temperature">
    <span class="value">${temperature}</span> &deg;C
  </p>
  
</article>
</div>
</div>`;
    forecastBlock.innerHTML = forecastItem;
    // console.log(iconURL);
  });
};
//s;
