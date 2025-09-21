const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

// UI elements
const cityName = document.getElementById("cityName");
const dateEl = document.getElementById("date");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const precipitation = document.getElementById("precipitation");
const weatherIcon = document.getElementById("weatherIcon");
const hourlyList = document.getElementById("hourlyList");
const dailyForecast = document.getElementById("dailyForecast");

// Fetch weather
async function getWeather(city) {
    try {
        // 1. Get coordinates
        const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
        );
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found!");
            return;
        }
        const { latitude, longitude, name, country } = geoData.results[0];

        // 2. Get weather
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
        );
        const weatherData = await weatherRes.json();

        // 3. Update UI
        cityName.textContent = `${name}, ${country}`;
        dateEl.textContent = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        // Current weather
        temperature.textContent = `${weatherData.current_weather.temperature}°C`;
        feelsLike.textContent = `${weatherData.current_weather.temperature}°C`; // fallback
        wind.textContent = `${weatherData.current_weather.windspeed} km/h`;
        humidity.textContent = `${weatherData.hourly.relativehumidity_2m[0]}%`;
        precipitation.textContent = `${weatherData.hourly.precipitation[0]} mm`;

        // Icon
        const weatherCode = weatherData.current_weather.weathercode;
        weatherIcon.src = getWeatherIcon(weatherCode);

        // Hourly forecast (next 8 hours)
        hourlyList.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            const time = new Date(weatherData.hourly.time[i]).getHours();
            const temp = weatherData.hourly.temperature_2m[i];
            const code = weatherData.hourly.weathercode[i];
            const icon = getWeatherIcon(code);
            hourlyList.innerHTML += `
        <div class="hour">
          <img src="${icon}" alt="">
          <p>${time}:00</p>
          <span>${temp}°C</span>
        </div>`;
        }

        // Daily forecast (7 days)
        dailyForecast.innerHTML = "";
        for (let i = 0; i < 7; i++) {
            const day = new Date(weatherData.daily.time[i]).toLocaleDateString(
                "en-US",
                { weekday: "short" }
            );
            const max = weatherData.daily.temperature_2m_max[i];
            const min = weatherData.daily.temperature_2m_min[i];
            const code = weatherData.daily.weathercode[i];
            const icon = getWeatherIcon(code);
            dailyForecast.innerHTML += `
        <div>
          <p>${day}</p>
          <img src="${icon}" alt="">
          <p>${max}° / ${min}°</p>
        </div>`;
        }
    } catch (error) {
        console.error(error);
        alert("Something went wrong!");
    }
}

// Weather code → icon mapping
function getWeatherIcon(code) {
    const path = "./assets/images/";
    if (code === 0) return path + "icon-sunny.webp";
    if ([1, 2].includes(code)) return path + "icon-partly-cloudy.webp";
    if (code === 3) return path + "icon-cloudy.webp";
    if ([45, 48].includes(code)) return path + "icon-fog.webp";
    if ([51, 53, 55].includes(code)) return path + "icon-drizzle.webp";
    if ([61, 63, 65].includes(code)) return path + "icon-rain.webp";
    if ([71, 73, 75].includes(code)) return path + "icon-snow.webp";
    if ([95, 96, 99].includes(code)) return path + "icon-storm.webp";
    return path + "icon-cloudy.webp"; // fallback
}

// Search event
searchBtn.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) getWeather(city);
});

// Default load
getWeather("Berlin");
