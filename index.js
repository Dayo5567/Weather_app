// WEATHER REPORT//

/**
 * Fetch data from server
 * @param {string} URL API url
 * @param {Function} callback callback
 */

const api_key = "6609c5a42793db4c4e7c363b0c71e623";

export const fetchData = function(URL, callback) {
    fetch(`${URL}&appid=${api_key}`)
    .then(res => res.json())
    .then(data => callback(data));
}

export const url = {
    currentWeather(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`

    },


    forecast(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`
        
    },

    airPollution(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}&units=metric`

    },

    reverseGeo(lat, lon) {
        return `https://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`
    },

    /**
     * 
     * @param {string} query search query e.g "Athens"
     * @returns 
     */
    

    geo(query) {
        return `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`
    },
}




export const weekDayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

export  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec"
];

/**
 * 
 * @param {number} dateUnix date in seconds
 * @param {number} timezone time from UTC in seconds
 * @returns date string format:"Monday 15, Dec"
 */

export const getDate = function (dateUnix, timezone) {
    const date = new Date((dateUnix + timezone) * 1000);
    const weekDayName = weekDayNames[date.getUTCDay()];
    const monthName = monthNames[date.getUTCMonth()];

    return `${weekDayName} ${date.getUTCDate()}, ${monthName}`;
}

/**
 * 
 * @param {number} timeUnix date in seconds
 * @param {number} timezone UTC in seconds
 * @returns time format: "HH:MM AM/PM"
 */

export const getTime = function(timeUnix, timezone) {
    const date = new Date((timeUnix + timezone) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? "PM" : "AM";

    return `${hours % 12 || 12}:${minutes} ${period}`;
}

/**
 * 
 * @param {number} timeUnix date in seconds
 * @param {number} timezone UTC in seconds
 * @returns time format: "HH AM/PM"
 */

export const getHours = function(timeUnix, timezone) {
    const date = new Date((timeUnix + timezone) * 1000);
    const hours = date.getUTCHours();
    const period = hours >= 12 ? "PM" : "AM";

    return `${hours % 12 || 12} ${period}`;
}


/**
 * 
 * @param {number} mps meter per seconds
 * @returns {number} kilometer per hours
 */


export const mps_to_kmh = mps => {
    const mph = mps * 3600;
    return mph / 1000;
}

const defaultLocation = "#/weather?lat=51.5073219&lon=0.1276474" //London
const currentLocation = function () {
    window.navigator.geolocation.getCurrentPosition(res => {
        const {latitude, longitude} = res.coords;

        updateWeather(`lat=${latitude}`, `lon=${longitude}`);
    }, err => {
        window.location.hash = defaultLocation;
    });
}


/**
 * 
 * @param {string} query searched query
 */

const searchedLocation = query => updateWeather(...query.split("&"));
//updateWeather("lat=51.5073219", "lon=0.1276464")

const routes = new Map([
    ["/current-location", currentLocation],
    ["/weather", searchedLocation]
]);

const checkHash = function () {
    const requestURL = window.location.hash.slice(1);
    const [route, query] = requestURL.includes ? requestURL.split("?") : [requestURL];

    routes.get(route) ? routes.get(route)(query) : error404();
}


window.addEventListener("hashchange", checkHash);

window.addEventListener("load", function () {
    if (!window.location.hash) {
        window.location.hash = "#/current-location";
    }
    else{
        checkHash();
    }
} );

/**
 * Add eventlistener on multiple elements
 * @param {NodeList} elements node array
 * @param {string} eventType e.g click
 * @param {Function} callback 
 */


const addEventOnElements = function(elements, eventType, callback) {
    for (const element of elements) element.addEventListener(eventType, callback);
}

// search in mobile

const searchView = document.querySelector("[data-search-view");
const searchToggler = document.querySelectorAll("[data-search-toggler]");

const toggleSearch = () => searchView.classList.toggle("active");
addEventOnElements(searchToggler, "click", toggleSearch);


/**
 * search integration
 */

const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");

let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener("input", function () {
    
    searchTimeout ?? clearTimeout(searchTimeout);

    if (!searchField.value) {
        searchResult.classList.remove("active");
        searchResult.innerHTML = "";
        searchField.classList.remove("searching");
    }
    else {
        searchField.classList.add("searching");
    }

    if (searchField.value) {
        searchTimeout = setTimeout(() => {
            fetchData(url.geo(searchField.value), function (locations) {
                searchField.classList.remove("searching");
                searchResult.classList.add("active");
                searchResult.innerHTML = `
                <ul class="view-list" data-search-list>
                        <li class="view-item"></li>
                </ul>
                `;

                const items = [];

                for (const {name, lat, lon, country, state} of locations) {
                    const searchItem = document.createElement("li");
                    searchItem.classList.add("view-item");

                    searchItem.innerHTML = `
                    <i class="m-icon fa-solid fa-location-dot"></i>
    
                    <div>
                        <p class="item-title">${name}</p>
                    <p class="label-2item-subtitle">${state || ""} ${country}</p>
                    </div>
                    <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-toggler></a>
                    `;

                    searchResult.querySelector("[data-search-list]").appendChild(searchItem);

                    items.push(searchItem.querySelector("[data-search-toggler]"));
                }
                addEventOnElements(items, "click", function () {
                    toggleSearch();
                    searchResult.classList.remove("active");
                })
            });
        }, searchTimeoutDuration);
    }
});

const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector("[data-current-locatin-btn]");
const errorContent = document.querySelector("[data-error-content]");


/**
 * Render all weather data
 * @param {number} lat
 * @param {number} lon
 */
export const updateWeather = function (lat, lon) {

    
    errorContent.style.display = "none";


    const currentWeatherSection = document.querySelector("[data-current-weather]");
    const highlightSection = document.querySelector("[data-highlights]");
    const hourlySection = document.querySelector("[data-hourly-forecast]");
    const forecastSection = document.querySelector("[data-5-day-forecast]");

    currentWeatherSection.innerHTML = "";
    highlightSection.innerHTML = "";
    hourlySection.innerHTML = "";
    forecastSection.innerHTML = "";


    if (!window.location.hash === "#/current-location") {
        currentLocationBtn.setAttribute("disabled", "");
    } else {
        currentLocationBtn.removeAttribute("disbled");
    }


    /**
     * CURRENT WEATHER
     */

    fetchData(url.currentWeather(lat, lon), function (currentWeather) {

        const {
            weather,
            dt,
            main: {temp, feels_like, pressure, humidity}, 
            timezone
        } = currentWeather
        const [{description, icon}] = weather;

        const card = document.createElement("div");
        card.classList.add("card", "card-lg", "current-weather-card");

        card.innerHTML = `
        <p>Feels like: <span class="title-3 font-bold">${parseInt(feels_like)}&deg;<sup>c</sup></span></p>

                                        <div class="wrapper">
                                        <p class="heading">${parseInt(temp)}&deg;<sup>c</sup></p>
                                            <img src="assets/images/weather_icons/${icon}.png" width="64" height="64"" class="m-icon" alt="">
                                        </div>
                                        <h3 class="title-3">${description}</h3>
        <ul class="meta-list">
                            <li class="meta-item">
                                <i class="m-icon fa-solid fa-location-dot"></i>
                                <p class="title-3 meta-text" data-location></p>
                            </li>
                            <li class="meta-item">
                                <i class="m-icon fa-regular fa-calendar"></i>
                                <p class="title-3 meta-text">${getDate(dt, timezone)}</p>
                            </li>
                        </ul>
        `;

        fetchData(url.reverseGeo(lat, lon), function([{name, country,}]) {
            card.querySelector("[data-location]").innerHTML = `${name}, ${country}`;
        });

        currentWeatherSection.appendChild(card);

        /**
         * HIGHLIGHT
         */

        fetchData(url.currentWeather(lat, lon), function (currentWeather) {

            const {
                weather,
                dt: dateUnix,
                sys: {sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC},
                main: {temp, feels_like, pressure, humidity},
                wind: {speed},
                visibility,
                timezone
            } = currentWeather
            const [{description, icon}] = weather;
            const card = document.createElement("div");
            card.classList.add("card", "card-lg");

            card.innerHTML = `
                            <h2 class="title-2" id="highlights-label">Todays Highlights</h2>
                            
                            <div class="highlight-list">
                                        
                                        <div class="card card-sm highlight-card bg-white dark:bg-primary">
                                                <img src="images/sunrise.png" class="m-icon" alt="${description}">
                                            <div>
                                                <p class="label-1">Sunrise</p>
                                                <p class="title-1 text-right">${getTime(sunriseUnixUTC, timezone)}</p>
                                            </div>
                                        </div>
                                        <div class="card card-sm highlight-card bg-white dark:bg-primary">
                                                <img src="images/sunset.png" class="m-icon" alt="">
                                            <div>
                                                <p class="label-1">Sunset</p>
                                                <p class="title-1 text-right">${getTime(sunsetUnixUTC, timezone)}</p>
                                            </div>
                                        </div>
                                
                                    <div class="card card-sm highlight-card bg-white dark:bg-primary">
                                        <h3 class="title-3">Humidity</h3>
                                        <div class="wrapper">
                                            <img src="images/river.png" class="m-icon" alt="">
                                            <p class="title-1">${humidity}<sub>%</sub></p>
                                        </div>
                                    </div>
                                    <div class="card card-sm highlight-card bg-white dark:bg-primary">
                                        <h3 class="title-3">Pressure</h3>
                                        <div class="wrapper">
                                            <img src="images/barometer.png" class="m-icon" alt="">
                                            <p class="title-1">${pressure}<sub>hPa</sub></p>
                                        </div>
                                    </div>
                                    <div class="card card-sm highlight-card bg-white dark:bg-primary">
                                        <h3 class="title-3">Wind  Speed</h3>
                                        <div class="wrapper">
                                            <img src="images/wind.png" class="m-icon" alt="">
                                            <p class="title-1">${speed}<sub>KM</sub></p>
                                        </div>
                                    </div>
                                    <div class="card card-sm highlight-card bg-white dark:bg-primary">
                                        <h3 class="title-3">UV</h3>
                                        <div class="wrapper">
                                            <img src="images/ultraviolet.png" class="m-icon" alt="">
                                            <p class="title-1">${visibility / 1000}<sub>km</sub></p>
                                        </div>
                                    </div>
                                
                            </div>
            
            `;

            highlightSection.appendChild(card);

        });

        /**
         * 24H FORECAST
         */


        fetchData(url.forecast(lat, lon), function (forecast) {
            const {
                list: forecastList,
                city: {timezone}
            } = forecast;
        
            hourlySection.innerHTML = `
            <h2 class="title-2">Hourly Forecast:</h2>
                    <div class="slider-container dark:bg-dark dark:text-secondary-200 text-secondary-100 bg-secondary-200 rounded-lg shadow-lg shadow-secondary-100">
                        <ul class="slider-list" data-temp>
                            
                        </ul>
                    </div>
            `;
        
            for (const [index, data] of forecastList.entries()) {
        
                if (index > 4) break;
                const {
                    dt: dateTimeUnix,
                    main: {temp},
                    weather,
                    wind:{deg: windDirection, speed: windSpeed}
                } = data
        
                const [{icon, description}] = weather
        
                const tempLi = document.createElement("li");
                tempLi.classList.add("slider-item");
                tempLi.classList.add("slider-item");
                tempLi.innerHTML = `
                    <div class="card card-sm slider-card bg-light dark:bg-forecast">
                        <p class="body-3">${getHours(dateTimeUnix, timezone)}</p>
                        <img src="assets/images/weather_icons/${icon}.png" width="48" height="48" loading="lazy" alt="" class="weather-icon" style="transfom: rotate(${windDirection})>
                        <p class="body-3">${parseInt(temp)}&deg;<sup>c</sup></p>
                        <img class="weather-icon" src="images/direction.png" alt="" style="transform: rotate(${windDirection - 180}deg)">
                        <p class="body-3">${parseInt(mps_to_kmh(windSpeed))}<sup>km/h</sup></p>
                    </div>
                `;
                hourlySection.querySelector("[data-temp]").appendChild(tempLi);
        
            }  
        });

        /**
             * 5DAys
             */

        fetchData(url.forecast(lat, lon), function (forecast) {

            const {
                list: forecastList,
                city: {timezone}
            } = forecast;

            forecastSection.innerHTML = `
            <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>

                    <div class="card card-lg forecast-card dark:bg-dark dark:text-secondary-200 text-secondary-100 bg-secondary-200 shadow-lg shadow-secondary-100">
                        <ul data-forecast-list>
                            <li class="card-item">
                                
                            </li>
                        </ul>
                    </div>
            `;

            for ( let i = 4, len = forecastList.length; i < len; i += 8) {
        
                const {
                    main: {temp_max},
                    weather,
                    dt_txt
                } = forecastList[i];

                const [{icon}] = weather
                const date = new Date(dt_txt);

                const li = document.createElement("li");
                li.classList.add("card-item");

                li.innerHTML = `
                    <div class="icon-wrapper">
                        <img src="./assets/images/weather_icons/${icon}.png" width="48" height="48" alt="" class="weather-icon">
                    </div>
                    <p class="label-1">${parseInt(temp_max)}&deg;<sup>c</sup></p>
                    <p class="label-1">${date.getDate()} ${monthNames[date.getUTCMonth()]} ${weekDayNames[date.getUTCDay()]}</p>
                
                `;

                forecastSection.querySelector("[data-forecast-list]").appendChild(li);
            }

            loading.style.display = "none";
            container.style.overflowY = "overlay";
            container.classList.add("fade-in");
        });
    });
}

export const error404 = () => errorContent.style.display = "flex";