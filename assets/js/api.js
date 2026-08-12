// Seleção de elementos do DOM
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherResult = document.getElementById('weather-result');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') handleSearch();
});

// Função principal que orquestra a busca
async function handleSearch() {
    const cityName = cityInput.value.trim();
    
    if (!cityName) {
        showError('Por favor, digite o nome de uma cidade.');
        return;
    }

    setLoadingState(true);

    try {
        // Passo 1: Converter nome da cidade em coordenadas
        const coordinates = await getCityCoordinates(cityName);
        
        if (!coordinates) {
            showError('Cidade não encontrada. Verifique o nome e tente novamente.');
            return;
        }

        // Passo 2: Buscar o clima usando as coordenadas
        const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
        
        // Passo 3: Exibir os dados na tela
        renderWeather(coordinates.name, weatherData);

    } catch (error) {
        console.error('Erro na requisição:', error);
        showError('Ocorreu um erro ao buscar os dados. Tente novamente mais tarde.');
    }
}

// Interage com a API de Geocodificação da Open-Meteo
async function getCityCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        return null; // Retorna null se a cidade não for encontrada
    }

    return {
        name: data.results[0].name,
        lat: data.results[0].latitude,
        lon: data.results[0].longitude
    };
}

// Interage com a API de Previsão do Tempo (Usando current_weather=true conforme esperado pela sua atividade)
async function getWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.current_weather;
}

// Função auxiliar para traduzir o código do clima
function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Céu limpo',
        1: 'Principalmente limpo',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Nevoeiro',
        51: 'Chuvisco leve',
        61: 'Chuva',
        71: 'Neve',
        95: 'Tempestade'
    };
    return weatherCodes[code] || 'Condição desconhecida';
}

// Função auxiliar de formatação de data e hora
function formatTime(isoTime) {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Atualiza o DOM com os dados de sucesso
function renderWeather(cityName, weather) {
    const conditionText = getWeatherDescription(weather.weathercode);
    const formattedTime = formatTime(weather.time);
    const periodo = weather.is_day === 1 ? 'Dia' : 'Noite';

    weatherResult.innerHTML = `
        <h2>${cityName}</h2>
        <p><strong>Condição:</strong> ${conditionText}</p>
        <p><strong>Temperatura:</strong> ${weather.temperature}°C</p>
        <p><strong>Velocidade do Vento:</strong> ${weather.windspeed} km/h</p>
        <p><strong>Período:</strong> ${periodo} (Atualizado às ${formattedTime})</p>
    `;
}

// Atualiza o DOM com mensagens de erro
function showError(message) {
    weatherResult.innerHTML = `<p class="error-message">${message}</p>`;
}

// Controla o estado de carregamento visual
function setLoadingState(isLoading) {
    if (isLoading) {
        weatherResult.innerHTML = '<p>Buscando informações...</p>';
    }
}

// Função auxiliar para traduzir o código do clima para texto e ícone
function getWeatherDetails(code, isDay) {
    // isDay será 1 para dia e 0 para noite
    const weatherCodes = {
        0: { text: 'Céu limpo', icon: isDay ? '☀️' : '🌙' },
        1: { text: 'Principalmente limpo', icon: isDay ? '🌤️' : '☁️' },
        2: { text: 'Parcialmente nublado', icon: '⛅' },
        3: { text: 'Nublado', icon: '☁️' },
        45: { text: 'Nevoeiro', icon: '🌫️' },
        51: { text: 'Chuvisco leve', icon: '🌦️' },
        61: { text: 'Chuva', icon: '🌧️' },
        71: { text: 'Neve', icon: '❄️' },
        95: { text: 'Tempestade', icon: '⛈️' }
    };
    return weatherCodes[code] || { text: 'Condição desconhecida', icon: '🌡️' };
}

// Função auxiliar de formatação de data e hora
function formatTime(isoTime) {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Atualiza o DOM com os dados de sucesso e o Ícone
function renderWeather(cityName, weather) {
    // Passamos o is_day para saber se mostramos sol ou lua
    const details = getWeatherDetails(weather.weathercode, weather.is_day);
    const formattedTime = formatTime(weather.time);
    const periodo = weather.is_day === 1 ? 'Dia' : 'Noite';

    weatherResult.innerHTML = `
        <h2>${cityName}</h2>
        <div class="weather-icon">${details.icon}</div>
        <p><strong>Condição:</strong> ${details.text}</p>
        <p><strong>Temperatura:</strong> ${weather.temperature}°C</p>
        <p><strong>Velocidade do Vento:</strong> ${weather.windspeed} km/h</p>
        <p><strong>Período:</strong> ${periodo} (Atualizado às ${formattedTime})</p>
    `;
}

// Atualiza o DOM com mensagens de erro
function showError(message) {
    weatherResult.innerHTML = `<p class="error-message">${message}</p>`;
}

// Controla o estado de carregamento visual
function setLoadingState(isLoading) {
    if (isLoading) {
        weatherResult.innerHTML = '<p>Buscando informações...</p>';
    }
}