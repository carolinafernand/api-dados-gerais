import request from 'supertest'; // Para simular requisições HTTP
import express, { Express } from 'express';
import NetflixController from '../controller/NetflixController';
import Netflix from '../model/Netflix'; // Importa o modelo Netflix

jest.mock('../model/Netflix'); // Mock do modelo Netflix

const app: Express = express();
app.use(express.json()); // Middleware para interpretar JSON

const netflixController = new NetflixController();

app.get('/netflix/todos', (req, res) => netflixController.todos(req, res));
app.delete('/netflix/remover', (req, res) => netflixController.remover(req, res));

describe('NetflixController', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpar os mocks após cada teste
    });

    describe('todos', () => {
        it('deve retornar uma lista de títulos com status 200', async () => {
            // Mock do retorno da função listarNetflixTitles
            const mockTitles = [
                {
                    show_id: "s1",
                    tipo: "Movie",
                    titulo: "Dick Johnson Is Dead",
                    diretor: "Kirsten Johnson",
                    elenco: null,
                    pais: "United States",
                    adicionado: "September 25, 2021",
                    ano_lancamento: 2020,
                    classificacao: "PG-13",
                    duracao: "90 min",
                    listado_em: "Documentaries",
                    descricao: "As her father nears the end of his life, filmmaker Kirsten Johnson stages his death in inventive and comical ways to help them both face the inevitable."
                },
            ];
            (Netflix.listarNetflixTitles as jest.Mock).mockResolvedValue(mockTitles); // Mock da função do modelo

            const response = await request(app).get('/netflix/todos'); // Simula a requisição GET
            expect(response.status).toBe(200); // Verifica o status
            expect(response.body).toEqual(mockTitles); // Verifica o corpo da resposta
        });

        it('deve retornar status 500 em caso de falha', async () => {
            // Mock de erro na função listarNetflixTitles
            (Netflix.listarNetflixTitles as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/netflix/todos'); // Simula a requisição GET
            expect(response.status).toBe(500); // Verifica o status
            expect(response.text).toBe('error'); // Verifica a mensagem de erro
        });
    });

    describe('remover', () => {
        it('deve remover um título e retornar mensagem de sucesso com status 200', async () => {
            // Mock do retorno de sucesso na função removerNetflixTitle
            (Netflix.removerNetflixTitle as jest.Mock).mockResolvedValue(true);

            const response = await request(app).delete('/netflix/remover').query({ show_id: "s1" }); // Simula a requisição DELETE
            expect(response.status).toBe(200); // Verifica o status
            expect(response.text).toBe('"Titulo removido com sucesso"'); // Verifica a mensagem de sucesso
        });

        it('deve retornar status 400 quando o título não for removido', async () => {
            // Mock do retorno de falha na função removerNetflixTitle
            (Netflix.removerNetflixTitle as jest.Mock).mockResolvedValue(false);

            const response = await request(app).delete('/netflix/remover').query({ show_id: "s2" }); // Simula a requisição DELETE
            expect(response.status).toBe(400); // Verifica o status
            expect(response.text).toBe('"Erro ao remover titulo"'); // Verifica a mensagem de erro
        });

        it('deve retornar status 500 em caso de falha no método remover', async () => {
            // Mock de erro na função removerNetflixTitle
            (Netflix.removerNetflixTitle as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/netflix/remover').query({ show_id: "s1" }); // Simula a requisição DELETE
            expect(response.status).toBe(500); // Verifica o status
            expect(response.text).toBe('error'); // Verifica a mensagem de erro
        });
    });
});