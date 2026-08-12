// ==========================================
// 1. FUNÇÕES DE API (Testadas pelo Jest)
// ==========================================
export async function fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    
    const response = await fetch(url).catch(() => { 
        throw new Error('NETWORK_ERROR'); 
    });
    
    if (!response.ok) {
        throw new Error('API_ERROR');
    }
    
    const data = await response.json();
    return data.current_weather;
}

export async function getCityCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt`;
    const response = await fetch(url).catch(() => { throw new Error('NETWORK_ERROR'); });
    if (!response.ok) throw new Error('API_ERROR');
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error('INVALID_CITY');
    return data.results[0];
}


// ==========================================
// 2. CÓDIGO DA TELA (Ignorado pelo Jest)
// ==========================================
if (typeof document !== 'undefined') {
    // Só executa se o "document" existir (ou seja, no Navegador)
    
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const locationBtn = document.getElementById('location-btn');
    const weatherResult = document.getElementById('weather-result');
    const homeBtn = document.getElementById('home-btn');
    const historyContainer = document.getElementById('history-container');
    const historyChips = document.getElementById('history-chips');

    document.addEventListener('DOMContentLoaded', renderHistory);

    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') handleSearch();
    });

    homeBtn.addEventListener('click', () => {
        weatherResult.innerHTML = ''; 
        cityInput.value = ''; 
        homeBtn.classList.add('hidden'); 
        document.body.className = ''; 
        renderHistory();
        cityInput.focus(); 
    });

    locationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            showError('Seu navegador não suporta geolocalização.');
            return;
        }
        setLoadingState(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                const geoData = await geoResponse.json();
                const cityName = geoData.address.city || geoData.address.town || 'Sua Localização';

                const weatherData = await fetchWeatherData(lat, lon);
                renderWeather(cityName, weatherData);
                saveToHistory(cityName);
            } catch (error) {
                handleError(new Error('NETWORK_ERROR'));
            }
        }, () => {
            showError('Permissão de localização negada ou indisponível.');
        });
    });

    async function handleSearch() {
        const cityName = cityInput.value.trim();
        if (!cityName) {
            showError('Por favor, digite o nome de uma cidade.');
            return;
        }
        setLoadingState(true);
        try {
            const coordinates = await getCityCoordinates(cityName);
            const weatherData = await fetchWeatherData(coordinates.latitude, coordinates.longitude);
            
            renderWeather(coordinates.name, weatherData);
            saveToHistory(coordinates.name);
        } catch (error) {
            handleError(error);
        }
    }

    function getWeatherDescription(code) {
        const weatherCodes = {
            0: 'Céu limpo ☀️', 1: 'Principalmente limpo 🌤️', 2: 'Parcialmente nublado ⛅',
            3: 'Nublado ☁️', 45: 'Nevoeiro 🌫️', 51: 'Chuvisco leve 🌦️',
            61: 'Chuva 🌧️', 71: 'Neve ❄️', 95: 'Tempestade ⛈️'
        };
        return weatherCodes[code] || 'Condição desconhecida';
    }

    function applyDynamicTheme(code) {
        document.body.className = ''; 
        if (code <= 1) document.body.classList.add('theme-sunny');
        else if (code === 2 || code === 3 || code === 45) document.body.classList.add('theme-cloudy');
        else if (code >= 51) document.body.classList.add('theme-rainy');
    }

    function renderWeather(cityName, weather) {
        const description = getWeatherDescription(weather.weathercode);
        historyContainer.classList.add('hidden');
        applyDynamicTheme(weather.weathercode);
        weatherResult.innerHTML = `
            <h2>${cityName}</h2>
            <p><strong>Descrição:</strong> ${description}</p>
            <p><strong>Temperatura:</strong> ${weather.temperature}°C</p>
        `;
        homeBtn.classList.remove('hidden');
    }

    function saveToHistory(cityName) {
        let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
        history = history.filter(city => city.toLowerCase() !== cityName.toLowerCase());
        history.unshift(cityName);
        if (history.length > 3) history.pop();
        localStorage.setItem('weatherHistory', JSON.stringify(history));
    }

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
        if (history.length === 0) {
            historyContainer.classList.add('hidden');
            return;
        }
        historyContainer.classList.remove('hidden');
        historyChips.innerHTML = '';
        history.forEach(city => {
            const btn = document.createElement('button');
            btn.className = 'chip';
            btn.textContent = city;
            btn.onclick = () => {
                cityInput.value = city;
                handleSearch();
            };
            historyChips.appendChild(btn);
        });
    }

    function handleError(error) {
        console.error('Detalhes do erro:', error);
        historyContainer.classList.add('hidden');
        document.body.className = ''; 
        switch (error.message) {
            case 'INVALID_CITY': showError('Cidade não encontrada. Verifique se o nome está correto.'); break;
            case 'API_ERROR': showError('O serviço de clima está temporariamente indisponível.'); break;
            case 'NETWORK_ERROR': showError('Erro de conexão. Verifique sua internet.'); break;
            default: showError('Ocorreu um erro inesperado ao buscar os dados.');
        }
    }

    function showError(message) {
        weatherResult.innerHTML = `<p class="error-message">${message}</p>`;
        homeBtn.classList.remove('hidden');
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            document.body.className = ''; 
            weatherResult.innerHTML = `
                <div class="loading-container">
                    <div class="spinner"></div>
                    <span class="loading-text">Analisando dados do clima...</span>
                </div>
            `;
            homeBtn.classList.add('hidden');
            historyContainer.classList.add('hidden');
        }
    }
}