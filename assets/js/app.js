import { fetchCityCoordinates, fetchWeatherData, fetchCityNameByCoords } from './api.js';
import { DOM, renderWeather, showError, setLoadingState, resetUI, renderHistory, saveToHistory, getFriendlyErrorMessage } from './ui.js';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderHistory(handleHistorySelect);
});

// Event Listeners
DOM.searchBtn.addEventListener('click', handleSearch);
DOM.cityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
DOM.homeBtn.addEventListener('click', () => {
    resetUI();
    renderHistory(handleHistorySelect);
});

DOM.locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        showError('Seu navegador não suporta geolocalização.');
        return;
    }

    setLoadingState(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            const cityName = await fetchCityNameByCoords(lat, lon);
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
    const cityName = DOM.cityInput.value.trim();
    
    if (!cityName) {
        showError('Por favor, digite o nome de uma cidade.');
        return;
    }

    setLoadingState(true);

    try {
        const coordinates = await fetchCityCoordinates(cityName);
        const weatherData = await fetchWeatherData(coordinates.latitude, coordinates.longitude);
        
        renderWeather(coordinates.name, weatherData);
        saveToHistory(coordinates.name);
    } catch (error) {
        handleError(error);
    }
}

function handleHistorySelect(cityName) {
    DOM.cityInput.value = cityName;
    handleSearch();
}

function handleError(error) {
    console.error('Detalhes técnicos do erro:', error);
    const friendlyMessage = getFriendlyErrorMessage(error.message);
    showError(friendlyMessage);
}