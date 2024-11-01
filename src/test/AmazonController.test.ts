import request from 'supertest'; // Para simular requisições HTTP
import express, { Express } from 'express';
import AmazonController from '../controller/AmazonController';
import Amazon from '../model/Amazon'; // Importa o modelo Amazon

jest.mock('../model/Amazon'); // Mock do modelo Amazon

const app: Express = express();
app.use(express.json()); // Middleware para interpretar JSON

const amazonController = new AmazonController();

app.get('/amazon/todos', (req, res) => amazonController.todos(req, res));
app.delete('/amazon/remover', (req, res) => amazonController.remover(req, res));

describe('AmazonController', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpar os mocks após cada teste
    });

    describe('todos', () => {
        it('deve retornar uma lista de livros com status 200', async () => {
            // Mock do retorno da função listarVendaLivros
            const mockLivros = [
                {
                    id_livro: 1,
                    data_venda: '2020-07-31T03:00:00.000Z',
                    rank_venda: 2,
                    nome_produto: 'As Crônicas de Nárnia. Brochura',
                    estrelas: null,
                    reviews: null,
                    autores: null,
                    edicao: 'Capa comum',
                    preco_padrao_min: 26.9,
                    preco_max: null,
                },
            ];
            (Amazon.listarVendaLivros as jest.Mock).mockResolvedValue(mockLivros); // Mock da função do modelo

            const response = await request(app).get('/amazon/todos'); // Simula a requisição GET
            expect(response.status).toBe(200); // Verifica o status
            expect(response.body).toEqual(mockLivros); // Verifica o corpo da resposta
        });

        it('deve retornar status 500 em caso de falha', async () => {
            // Mock de erro na função listarVendaLivros
            (Amazon.listarVendaLivros as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/amazon/todos'); // Simula a requisição GET
            expect(response.status).toBe(500); // Verifica o status
            expect(response.text).toBe('error'); // Verifica a mensagem de erro
        });
    });

    describe('remover', () => {
        it('deve remover uma venda e retornar mensagem de sucesso com status 200', async () => {
            // Mock do retorno de sucesso na função removerVenda
            (Amazon.removerVenda as jest.Mock).mockResolvedValue(true);

            const response = await request(app).delete('/amazon/remover').query({ id_livro: 1 }); // Simula a requisição DELETE
            expect(response.status).toBe(200); // Verifica o status
            expect(response.text).toBe('"Venda removida com sucesso"'); // Verifica a mensagem de sucesso
        });

        it('deve retornar status 400 quando a venda não for removida', async () => {
            // Mock do retorno de falha na função removerVenda
            (Amazon.removerVenda as jest.Mock).mockResolvedValue(false);

            const response = await request(app).delete('/amazon/remover').query({ id_livro: 2 }); // Simula a requisição DELETE
            expect(response.status).toBe(400); // Verifica o status
            expect(response.text).toBe('"Erro ao remover venda"'); // Verifica a mensagem de erro
        });

        it('deve retornar status 500 em caso de falha no método remover', async () => {
            // Mock de erro na função removerVenda
            (Amazon.removerVenda as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/amazon/remover').query({ id_livro: 1 }); // Simula a requisição DELETE
            expect(response.status).toBe(500); // Verifica o status
            expect(response.text).toBe('error'); // Verifica a mensagem de erro
        });
    });
});