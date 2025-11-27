package dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DAO {
    protected Connection conexao;

    public DAO() {
        conexao = null;
    }

    // Conectar no PostgreSQL (Azure)
    public boolean conectar() {
        boolean status = false;
        try {
            String driverName = "";
            String url = "";
            String username = "";
            String password = "";

            Class.forName(driverName);
            conexao = DriverManager.getConnection(url, username, password);
            status = (conexao != null);
            if (status) System.out.println("Conexão efetuada com sucesso!");
        } catch (ClassNotFoundException e) {
            System.err.println("Driver não encontrado: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("Erro na conexão: " + e.getMessage());
        }
        return status;
    }

    // Verifica se conexão está ativa e reconecta se necessário
    public boolean verificarConexao() {
        try {
            if (conexao == null || conexao.isClosed() || !conexao.isValid(2)) {
                System.out.println("Reconectando ao banco...");
                return conectar();
            }
            return true;
        } catch (SQLException e) {
            System.err.println("❌ Erro ao verificar conexão: " + e.getMessage());
            return conectar();
        }
    }

    // Fechar conexão
    public boolean close() {
        boolean status = false;
        try {
            if (conexao != null && !conexao.isClosed())
                conexao.close();
            status = true;
        } catch (SQLException e) {
            System.err.println("Erro ao fechar conexão: " + e.getMessage());
        }
        return status;
    }
}
