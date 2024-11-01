
import Netflix from '../model/Netflix';
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

describe('Netflix', () => {
    const mockDatabase = new DatabaseModel().pool;

    afterEach(() => {
        jest.clearAllMocks(); // Limpa os mocks após cada teste
    });

    describe('listarNetflixTitles', () => {
        it('deve retornar uma lista de títulos da Netflix em caso de sucesso', async () => {
            // Mock do resultado da query bem-sucedida
            const mockResult = {
                rows: [
                    {
                        show_id: 's1',
                        type: 'Movie',
                        title: 'Breaking Bad',
                        director: 'Vince Gilligan',
                        cast: 'Bryan Cranston, Aaron Paul',
                        country: 'United States',
                        release_year: 2008,
                        rating: 'TV-MA',
                        duration: '5 Seasons',
                        listed_in: 'Crime, Drama, Thriller',
                        description: 'A high school chemistry teacher turned methamphetamine producer.',
                    },
                ],
            };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockResult);

            const result = await Netflix.listarNetflixTitles();
            expect(result).toEqual(mockResult.rows);
        });

        it('deve retornar uma mensagem de erro em caso de falha', async () => {
            // Mock de erro ao realizar a query
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await Netflix.listarNetflixTitles();
            expect(result).toBe('error, verifique os logs do servidor');
        });
    });

    describe('removerNetflixTitle', () => {
        it('deve retornar true quando o título for removido com sucesso', async () => {
            // Mock de resultado de remoção bem-sucedida
            const mockDeleteResult = { rowCount: 1 };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult);

            const result = await Netflix.removerNetflixTitle('s1');
            expect(result).toBe(true);
            expect(mockDatabase.query).toHaveBeenCalledWith("DELETE FROM netflix_titles WHERE show_id='s1'");
        });

        it('deve retornar false quando não houver título para remover', async () => {
            // Mock de resultado quando não encontra o registro
            const mockDeleteResult = { rowCount: 0 };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult);

            const result = await Netflix.removerNetflixTitle('s2');
            expect(result).toBe(false);
            expect(mockDatabase.query).toHaveBeenCalledWith("DELETE FROM netflix_titles WHERE show_id='s2'");
        });

        it('deve retornar false e capturar erro em caso de falha', async () => {
            // Mock de erro ao realizar a query de remoção
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Delete error'));

            const result = await Netflix.removerNetflixTitle('s1');
            expect(result).toBe(false);
            expect(mockDatabase.query).toHaveBeenCalledWith("DELETE FROM netflix_titles WHERE show_id='s1'");
        });
    });
});