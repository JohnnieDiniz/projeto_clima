import { jest } from '@jest/globals';
// Importamos agora as DUAS funções
import { fetchWeatherData, getCityCoordinates } from '../assets/js/api.js';

// Limpa as simulações antes de cada teste
beforeEach(() => {
    global.fetch = jest.fn();
});

// ==========================================
// TESTES DA FUNÇÃO: fetchWeatherData
// ==========================================
describe('Testes da função fetchWeatherData', () => {
    
    it('Deve retornar os dados do clima corretamente quando a API responder com sucesso', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({
                current_weather: { temperature: 25, windspeed: 10, weathercode: 0 }
            })
        };
        global.fetch.mockResolvedValue(mockResponse);

        const result = await fetchWeatherData(-23.55, -46.63);

        expect(global.fetch).toHaveBeenCalledTimes(1); 
        expect(result.temperature).toBe(25);
    });

    it('Deve lançar um erro NETWORK_ERROR quando não houver internet (fetch rejeitado)', async () => {
        global.fetch.mockRejectedValue(new Error('Falha de conexão'));
        await expect(fetchWeatherData(-23.55, -46.63)).rejects.toThrow('NETWORK_ERROR');
    });

    it('Deve lançar um erro API_ERROR quando a API retornar status HTTP de erro', async () => {
        const mockErrorResponse = { ok: false };
        global.fetch.mockResolvedValue(mockErrorResponse);
        await expect(fetchWeatherData(-23.55, -46.63)).rejects.toThrow('API_ERROR');
    });
});

// ==========================================
// TESTES DA FUNÇÃO: getCityCoordinates
// ==========================================
describe('Testes da função getCityCoordinates', () => {

    it('Deve retornar os dados da cidade quando encontrada com sucesso', async () => {
        // PREPARAR: Simulamos a API retornando uma lista com os dados de São Paulo
        const mockResponse = {
            ok: true,
            json: async () => ({
                results: [
                    { name: "São Paulo", latitude: -23.5475, longitude: -46.6361 }
                ]
            })
        };
        global.fetch.mockResolvedValue(mockResponse);

        // AGIR
        const result = await getCityCoordinates("São Paulo");

        // VERIFICAR: O fetch foi chamado com a cidade correta e extraiu o primeiro resultado
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('name=S%C3%A3o%20Paulo') // A URL codifica os espaços e acentos
        );
        expect(result.name).toBe("São Paulo");
        expect(result.latitude).toBe(-23.5475);
    });

    it('Deve lançar um erro INVALID_CITY quando a cidade não for encontrada (lista vazia)', async () => {
        // PREPARAR: Simulamos a API respondendo (ok: true), mas sem encontrar resultados
        const mockResponse = {
            ok: true,
            json: async () => ({
                results: [] // API retorna uma lista vazia quando não acha a cidade
            })
        };
        global.fetch.mockResolvedValue(mockResponse);

        // AGIR & VERIFICAR
        await expect(getCityCoordinates("CidadeQueNaoExiste123")).rejects.toThrow('INVALID_CITY');
    });

    it('Deve lançar um erro NETWORK_ERROR quando não houver internet', async () => {
        global.fetch.mockRejectedValue(new Error('Falha de conexão'));
        await expect(getCityCoordinates("Rio de Janeiro")).rejects.toThrow('NETWORK_ERROR');
    });

    it('Deve lançar um erro API_ERROR quando a API retornar status HTTP de erro', async () => {
        const mockErrorResponse = { ok: false };
        global.fetch.mockResolvedValue(mockErrorResponse);
        await expect(getCityCoordinates("Curitiba")).rejects.toThrow('API_ERROR');
    });

});