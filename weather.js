const cityinput = document.querySelector(".city-input"); // Select the city input element
const searchbutton = document.querySelector(".search-button"); // Select the search button element
const locationbutton = document.querySelector(".location-button"); // Select the location button element
const currentweatherdiv = document.querySelector(".current-weather"); // Select the current weather display element
const weathercardsdiv = document.querySelector(".weather-cards"); // Select the weather cards display element

const API_key = `8b75a16975625466ad230c2dfe32b4a1`; // API key for OpenWeather API

/**
 * Function to create a weather card
 * @param {string} cityname - Name of the city
 * @param {object} weatheritem - Weather data object
 * @param {number} index - Index of the weather item
 * @returns {string} - HTML string for the weather card
 */
const createweathercard = (cityname, weatheritem, index) => {
    if (index === 0) {
        return `
            <div class="details">
                <h2 class="text-xl">${cityname} (${weatheritem.dt_txt.split(" ")[0]})</h2>
                <h4 class="text-lg">Temperature: ${(weatheritem.main.temp - 273.15).toFixed(2)}&deg;C</h4>
                <h4 class="text-lg">Wind: ${weatheritem.wind.speed}M/S</h4>
                <h4 class="text-lg">Humidity: ${weatheritem.main.humidity}%</h4>
            </div>
            <div class="icon text-center">
                <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="weathericon" class="w-20 h-20 mx-auto">
                <h4 class="text-lg">${weatheritem.weather[0].description}</h4>
            </div>
        `;
    } else {
        return `
            <li class="card bg-gray-700 p-4 rounded-lg shadow">
                <h2 class="text-xl">(${weatheritem.dt_txt.split(" ")[0]})</h2>
                <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="weather-icons" class="w-16 h-16 mx-auto">
                <h4 class="text-lg">Temperature: ${(weatheritem.main.temp - 273.15).toFixed(2)}&deg;C</h4>
                <h4 class="text-lg">Wind: ${weatheritem.wind.speed}M/S</h4>
                <h4 class="text-lg">Humidity: ${weatheritem.main.humidity}%</h4>
            </li>
        `;
    }
};

/**
 * Function to get weather details using city coordinates
 * @param {string} cityname - Name of the city
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
const getweatherdetails = (cityname, lat, lon) => {
    const weather_api_url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;

    fetch(weather_api_url)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            const uniqueforecastdays = [];
            const fivedaysforecast = data.list.filter(forecast => {
                const forecastdate = new Date(forecast.dt_txt).getDate();
                if (!uniqueforecastdays.includes(forecastdate)) {
                    return uniqueforecastdays.push(forecastdate);
                }
            });
            cityinput.value = "";
            currentweatherdiv.innerHTML = "";
            weathercardsdiv.innerHTML = "";

            console.log(fivedaysforecast);
            fivedaysforecast.forEach((weatheritem, index) => {
                if (index === 0) {
                    currentweatherdiv.insertAdjacentHTML("beforeend", createweathercard(cityname, weatheritem, index));
                } else {
                    weathercardsdiv.insertAdjacentHTML("beforeend", createweathercard(cityname, weatheritem, index));
                }
            });
        })
        .catch(() => {
            alert("AN ERROR OCCURED!!!");
        });
};

/**
 * Function to get city coordinates using city name
 */
const getcitycoordinates = () => {
    const cityname = cityinput.value.trim(); // Get user entered city name and remove extra spaces
    if (!cityname) return; // Return if city name is empty

    const geocoding_api_url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=1&appid=${API_key}`;

    fetch(geocoding_api_url)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No Coordinates found for ${cityname}`);
            const { name, lat, lon } = data[0];
            getweatherdetails(name, lat, lon);
        })
        .catch(() => {
            alert("AN ERROR OCCURED!!!");
        });
};

/**
 * Function to get user's coordinates using geolocation
 */
const getusercoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const reverse_geocoding_url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
            fetch(reverse_geocoding_url)
                .then(res => res.json())
                .then(data => {
                    const { name } = data[0];
                    getweatherdetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("AN ERROR OCCURED!!!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Permission Denied!!");
            }
        }
    );
};

// Event listeners for search and location buttons
locationbutton.addEventListener("click", getusercoordinates);
searchbutton.addEventListener("click", getcitycoordinates);
cityinput.addEventListener("keyup", e => e.key === "Enter" && getcitycoordinates());
