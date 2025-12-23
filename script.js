const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const weatherCard = document.getElementById('weather-card');
    const errorMsg = document.getElementById('error-message');
    const loader = document.getElementById('loader');

    const tempVal = document.getElementById('temp-val');
    const wDesc = document.getElementById('w-desc');
    const wIcon = document.getElementById('w-icon');
    const cityNameEl = document.getElementById('city-name');
    const windSpeedEl = document.getElementById('wind-speed');
    const humidityEl = document.getElementById('humidity');


    function getWeatherDetails(code) {
        const mapping = {
            0: { desc: "Clear Sky", icon: "fa-sun", color: "#f1c40f" },
            1: { desc: "Mainly Clear", icon: "fa-cloud-sun", color: "#f1c40f" },
            2: { desc: "Partly Cloudy", icon: "fa-cloud-sun", color: "#bdc3c7" },
            3: { desc: "Overcast", icon: "fa-cloud", color: "#7f8c8d" },
            45: { desc: "Foggy", icon: "fa-smog", color: "#95a5a6" },
            48: { desc: "Depositing Rime Fog", icon: "fa-smog", color: "#95a5a6" },
            51: { desc: "Light Drizzle", icon: "fa-cloud-rain", color: "#3498db" },
            53: { desc: "Moderate Drizzle", icon: "fa-cloud-rain", color: "#3498db" },
            55: { desc: "Dense Drizzle", icon: "fa-cloud-showers-heavy", color: "#2980b9" },
            61: { desc: "Slight Rain", icon: "fa-cloud-rain", color: "#3498db" },
            63: { desc: "Moderate Rain", icon: "fa-cloud-showers-heavy", color: "#2980b9" },
            65: { desc: "Heavy Rain", icon: "fa-cloud-showers-heavy", color: "#2980b9" },
            71: { desc: "Slight Snow", icon: "fa-snowflake", color: "#ecf0f1" },
            73: { desc: "Moderate Snow", icon: "fa-snowflake", color: "#ecf0f1" },
            75: { desc: "Heavy Snow", icon: "fa-snowflake", color: "#ecf0f1" },
            95: { desc: "Thunderstorm", icon: "fa-bolt", color: "#f1c40f" },
            96: { desc: "Thunderstorm with Hail", icon: "fa-bolt", color: "#f1c40f" },
            99: { desc: "Thunderstorm with Heavy Hail", icon: "fa-bolt", color: "#f1c40f" },
        };

        return mapping[code] || { desc: "Unknown", icon: "fa-cloud", color: "#bdc3c7" };
    }

    async function fetchWeather(city) {
        // Reset UI
        errorMsg.style.display = 'none';
        weatherCard.style.display = 'none';
        loader.style.display = 'block';

        try {
            // get Lattitude/Longitude
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("City not found. Please try again.");
            }

            const { latitude, longitude, name, country } = geoData.results[0];

            // Fetch Weather Data
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m`;
            
            const weatherRes = await fetch(weatherUrl);
            const weatherData = await weatherRes.json();

            // Extract Current Weather
            const current = weatherData.current_weather;
            
            
            const currentHourISO = current.time; 
            const hourlyIndex = weatherData.hourly.time.indexOf(currentHourISO);
            const currentHumidity = hourlyIndex !== -1 ? weatherData.hourly.relativehumidity_2m[hourlyIndex] : "--";

            // Update UI
            updateUI({
                temp: current.temperature,
                wind: current.windspeed,
                weatherCode: current.weathercode,
                cityName: name,
                country: country,
                humidity: currentHumidity
            });

        } catch (error) {
            console.error(error);
            errorMsg.textContent = error.message || "Failed to fetch weather data.";
            errorMsg.style.display = 'block';
        } finally {
            loader.style.display = 'none';
        }
    }

    // Update DOM Elements
    function updateUI(data) {
        tempVal.textContent = Math.round(data.temp);
        cityNameEl.textContent = `${data.cityName}, ${data.country}`;
        windSpeedEl.textContent = `${data.wind} km/h`;
        humidityEl.textContent = `${data.humidity}%`;

        // Get icon and description based on WMO code
        const details = getWeatherDetails(data.weatherCode);
        wDesc.textContent = details.desc;
        
        // Reset classes and add new icon class
        wIcon.className = 'fa-solid ' + details.icon;
        wIcon.style.color = details.color;

        // Show card
        weatherCard.style.display = 'block';
    }

    // -- Event Listeners --
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        } else {
            errorMsg.textContent = "Please enter a city name.";
            errorMsg.style.display = 'block';
            weatherCard.style.display = 'none';
        }
    });

    // Allow "Enter" key to search
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });