import request from 'supertest'; // Para simular requisições HTTP
import express, { Express } from 'express';
import FifaPlayersController from '../controller/FifaPlayersController';
import FifaPlayers from '../model/FifaPlayers'; // Importa o modelo FifaPlayers

jest.mock('../model/FifaPlayers'); // Mock do modelo FifaPlayers

const app: Express = express();
app.use(express.json()); // Middleware para interpretar JSON

const fifaPlayersController = new FifaPlayersController();

app.get('/fifa/todos', (req, res) => fifaPlayersController.todos(req, res));
app.delete('/fifa/remover', (req, res) => fifaPlayersController.remover(req, res));

describe('FifaPlayersController', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpar os mocks após cada teste
    });

    describe('todos', () => {
        it('deve retornar uma lista de jogadores com status 200', async () => {
            // Mock do retorno da função listarPlayersCards
            const mockPlayers = [
                {
                    playerid: 1,
                    playername: 'Pelé',
                    foot: 'Right',
                    playerposition: 'CAM',
                    awr: 'High',
                    dwr: 'Med',
                    ovr: '98',
                    pac: '95',
                    sho: '96',
                    pas: '93',
                    dri: '96',
                    def: '60',
                    phy: '76',
                    sm: '5',
                    div: 'NA',
                    pos: 'NA',
                    han: 'NA',
                    reff: 'NA',
                    kic: 'NA',
                    spd: 'NA'
                },
            ];
            (FifaPlayers.listarPlayersCards as jest.Mock).mockResolvedValue(mockPlayers); // Mock da função do modelo

            const response = await request(app).get('/fifa/todos'); // Simula a requisição GET
            expect(response.status).toBe(200); // Verifica o status
            expect(response.body).toEqual(mockPlayers); // Verifica o corpo da resposta
        });

        it('deve retornar status 500 em caso de falha', async () => {
            // Mock de erro na função listarPlayersCards
            (FifaPlayers.listarPlayersCards as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/fifa/todos'); // Simula a requisição GET
            expect(response.status).toBe(500); // Verifica o status
            expect(response.text).toBe('error'); // Verifica a mensagem de erro
        });
    });

    describe('remover', () => {
        it('deve remover um jogador e retornar mensagem de sucesso com status 200', async () => {
            // Mock do retorno de sucesso na função removerPlayerCard
            (FifaPlayers.removerPlayerCard as jest.Mock).mockResolvedValue(true);

            const response = await request(app).delete('/fifa/remover').query({ playerid: 1 }); // Simula a requisição DELETE
            expect(response.status).toBe(200); // Verifica o status
            expect(response.text).toBe('"Player card removida com sucesso"'); // Verifica a mensagem de sucesso
        });

        it('deve retornar status 400 quando o jogador não for removido', async () => {
            // Mock do retorno de falha na função removerPlayerCard
            (FifaPlayers.removerPlayerCard as jest.Mock).mockResolvedValue(false);

            const response = await request(app).delete('/fifa/remover').query({ playerid: 2 }); // Simula a requisição DELETE
            expect(response.status).toBe(400); // Verifica o status
            expect(response.text).toBe('"Erro ao remover player card"'); // Verifica a mensagem de erro
        });

        it('deve retornar status 500 em caso de falha no método remover', async () => {
            // Mock de erro na função removerPlayerCard
            (FifaPlayers.removerPlayerCard as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/fifa/remover').query({ playerid: 1 }); // Simula a requisição DELETE
            expect(response.status).toBe(500); // Verifica o status
            expect(response.text).toBe('error'); // Verifica a mensagem de erro
        });
    });
});