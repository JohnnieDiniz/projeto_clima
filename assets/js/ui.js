import { CONFIG } from './config.js';

// Seleção de Elementos DOM
export const DOM = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    locationBtn: document.getElementById('location-btn'),
    weatherResult: document.getElementById('weather-result'),
    homeBtn: document.getElementById('home-btn'),
    historyContainer: document.getElementById('history-container'),
    historyChips: document.getElementById('history-chips')
};

export function renderWeather(cityName, weather) {
    const weatherInfo = CONFIG.WEATHER_CODES[weather.weathercode] || { text: 'Condição desconhecida', theme: '' };
    
    DOM.historyContainer.classList.add('hidden');
    document.body.className = weatherInfo.theme;

    DOM.weatherResult.innerHTML = `
        <h2>${cityName}</h2>
        <p><strong>Descrição:</strong> ${weatherInfo.text}</p>
        <p><strong>Temperatura:</strong> ${weather.temperature}°C</p>
    `;
    DOM.homeBtn.classList.remove('hidden');
}

export function showError(message) {
    DOM.weatherResult.innerHTML = `<p class="error-message">${message}</p>`;
    DOM.homeBtn.classList.remove('hidden');
    DOM.historyContainer.classList.add('hidden');
    document.body.className = '';
}

export function setLoadingState(isLoading) {
    if (isLoading) {
        document.body.className = '';
        DOM.weatherResult.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <span class="loading-text">Analisando dados do clima...</span>
            </div>
        `;
        DOM.homeBtn.classList.add('hidden');
        DOM.historyContainer.classList.add('hidden');
    }
}

export function resetUI() {
    DOM.weatherResult.innerHTML = '';
    DOM.cityInput.value = '';
    DOM.homeBtn.classList.add('hidden');
    document.body.className = '';
    DOM.cityInput.focus();
}

export function renderHistory(onSelectCity) {
    const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    
    if (history.length === 0) {
        DOM.historyContainer.classList.add('hidden');
        return;
    }

    DOM.historyContainer.classList.remove('hidden');
    DOM.historyChips.innerHTML = '';

    history.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = city;
        btn.onclick = () => onSelectCity(city);
        DOM.historyChips.appendChild(btn);
    });
}

export function saveToHistory(cityName) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    history = history.filter(city => city.toLowerCase() !== cityName.toLowerCase());
    history.unshift(cityName);
    if (history.length > 3) history.pop();
    localStorage.setItem('weatherHistory', JSON.stringify(history));
}

export function getFriendlyErrorMessage(errorMsg) {
    switch (errorMsg) {
        case 'INVALID_CITY': return 'Cidade não encontrada. Verifique se o nome está correto.';
        case 'API_ERROR': return 'O serviço de clima está temporariamente indisponível.';
        case 'NETWORK_ERROR': return 'Erro de conexão. Verifique sua internet.';
        default: return 'Ocorreu um erro inesperado ao buscar os dados.';
    }
}