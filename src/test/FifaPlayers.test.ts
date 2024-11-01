import FifaPlayers from '../model/FifaPlayers';
import { DatabaseModel } from '../model/DatabaseModel';

// Mock do DatabaseModel
jest.mock('../model/DatabaseModel', () => {
    // Definir o mockQuery dentro do mock
    const mockQuery = jest.fn(); // Mock da função query
    return {
        DatabaseModel: jest.fn().mockImplementation(() => ({
            pool: {
                query: mockQuery, // Atribuindo o mockQuery à função query
            },
        })),
        mockQuery, // Exportar o mockQuery para ser usado nos testes
    };
});

describe('FifaPlayers', () => {
    const mockDatabase = new DatabaseModel().pool;

    afterEach(() => {
        jest.clearAllMocks(); // Limpa os mocks após cada teste
    });

    describe('listarPlayersCards', () => {
        it('deve retornar uma lista de players cards em caso de sucesso', async () => {
            // Mock do resultado da query bem-sucedida
            const mockResult = {
                rows: [
                    {
                        playerid: 1,
                        nome: 'Cristiano Ronaldo',
                        overall: 93,
                        posicao: 'ST',
                        clube: 'Al Nassr',
                        pais: 'Portugal',
                        preco_min: 50000,
                        preco_max: 120000,
                    },
                ],
            };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockResult);

            const result = await FifaPlayers.listarPlayersCards();
            expect(result).toEqual(mockResult.rows);
        });

        it('deve retornar uma mensagem de erro em caso de falha', async () => {
            // Mock de erro ao realizar a query
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await FifaPlayers.listarPlayersCards();
            expect(result).toBe('error, verifique os logs do servidor');
        });
    });

    describe('removerPlayerCard', () => {
        it('deve retornar true quando o player card for removido com sucesso', async () => {
            // Mock de resultado de remoção bem-sucedida
            const mockDeleteResult = { rowCount: 1 };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult);

            const result = await FifaPlayers.removerPlayerCard(1);
            expect(result).toBe(true);
        });

        it('deve retornar false quando não houver player card para remover', async () => {
            // Mock de resultado quando não encontra o registro
            const mockDeleteResult = { rowCount: 0 };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult);

            const result = await FifaPlayers.removerPlayerCard(2);
            expect(result).toBe(false);
        });

        it('deve retornar false e capturar erro em caso de falha', async () => {
            // Mock de erro ao realizar a query de remoção
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Delete error'));

            const result = await FifaPlayers.removerPlayerCard(1);
            expect(result).toBe(false);
        });
    });
});