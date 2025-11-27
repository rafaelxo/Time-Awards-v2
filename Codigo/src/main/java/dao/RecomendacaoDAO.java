package dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import model.Recomendacao;

public class RecomendacaoDAO extends DAO {

    public RecomendacaoDAO() {
        super();
    }

    // Inserir nova recomendação
    public boolean inserirRecomendacao(Recomendacao recomendacao) {
        boolean status = false;

        if (!conectar()) {
            System.err.println("Erro: Não foi possível conectar ao banco de dados");
            return false;
        }

        try {
            String sql = "INSERT INTO recomendacao (usuario_id, titulo, descricao, relevancia, status) "
                    + "VALUES (?, ?, ?, ?, ?)";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setInt(1, recomendacao.getUsuarioId());
            st.setString(2, recomendacao.getTitulo());
            st.setString(3, recomendacao.getDescricao());
            st.setInt(4, recomendacao.getRelevancia());
            st.setBoolean(5, recomendacao.isStatus());
            st.executeUpdate();
            st.close();
            status = true;
        } catch (SQLException e) {
            System.err.println("Erro ao inserir recomendação: " + e.getMessage());
        } finally {
            close();
        }
        return status;
    }

    // Listar recomendações de um usuário
    public Recomendacao[] listarRecomendacoes(int usuarioId) {
        Recomendacao[] recomendacoes = new Recomendacao[10000];
        int count = 0;

        if (!conectar()) {
            System.err.println("Erro: Não foi possível conectar ao banco de dados!");
            return new Recomendacao[0];
        }

        try {
            String sql = "SELECT * FROM recomendacao WHERE usuario_id = ? ORDER BY relevancia DESC";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setInt(1, usuarioId);
            ResultSet rs = st.executeQuery();
            while (rs.next()) {
                recomendacoes[count] = new Recomendacao(
                        rs.getInt("id"),
                        rs.getInt("usuario_id"),
                        rs.getString("titulo"),
                        rs.getString("descricao"),
                        rs.getInt("relevancia"),
                        rs.getBoolean("status"));
                count++;
            }
            rs.close();
            st.close();
        } catch (SQLException e) {
            System.err.println("Erro ao listar recomendações: " + e.getMessage());
        } finally {
            close();
        }

        Recomendacao[] resultado = new Recomendacao[count];
        System.arraycopy(recomendacoes, 0, resultado, 0, count);
        return resultado;
    }

    // Buscar recomendação específica por ID
    public Recomendacao buscarRecomendacaoPorId(int id, int usuarioId) {
        Recomendacao r = null;

        if (!conectar()) {
            System.err.println("Erro: Não foi possível conectar ao banco de dados");
            return null;
        }

        try {
            String sql = "SELECT * FROM recomendacao WHERE id = ? AND usuario_id = ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setInt(1, id);
            st.setInt(2, usuarioId);
            ResultSet rs = st.executeQuery();
            if (rs.next()) {
                r = new Recomendacao(
                        rs.getInt("id"),
                        rs.getInt("usuario_id"),
                        rs.getString("titulo"),
                        rs.getString("descricao"),
                        rs.getInt("relevancia"),
                        rs.getBoolean("status"));
            }
            rs.close();
            st.close();
        } catch (SQLException e) {
            System.err.println("Erro ao buscar recomendação: " + e.getMessage());
        } finally {
            close();
        }
        return r;
    }

    // Atualizar recomendação completa
    public boolean atualizarRecomendacao(Recomendacao recomendacao) {
        boolean status = false;

        if (!conectar()) {
            System.err.println("Erro: Não foi possível conectar ao banco de dados");
            return false;
        }

        try {
            String sql = "UPDATE recomendacao SET titulo = ?, descricao = ?, relevancia = ?, status = ? WHERE id = ? AND usuario_id = ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setString(1, recomendacao.getTitulo());
            st.setString(2, recomendacao.getDescricao());
            st.setInt(3, recomendacao.getRelevancia());
            st.setBoolean(4, recomendacao.isStatus());
            st.setInt(5, recomendacao.getId());
            st.setInt(6, recomendacao.getUsuarioId());
            st.executeUpdate();
            st.close();
            status = true;
        } catch (SQLException e) {
            System.err.println("Erro ao atualizar recomendação: " + e.getMessage());
        } finally {
            close();
        }
        return status;
    }

    // Atualizar status da recomendação
    public boolean atualizarStatus(int id, int usuarioId, boolean novoStatus) {
        boolean status = false;

        if (!conectar()) {
            System.err.println("Erro: Não foi possível conectar ao banco de dados");
            return false;
        }

        try {
            String sql = "UPDATE recomendacao SET status = ? WHERE id = ? AND usuario_id = ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setBoolean(1, novoStatus);
            st.setInt(2, id);
            st.setInt(3, usuarioId);
            st.executeUpdate();
            st.close();
            status = true;
        } catch (SQLException e) {
            System.err.println("Erro ao atualizar status da recomendação: " + e.getMessage());
        } finally {
            close();
        }
        return status;
    }

    // Excluir recomendação
    public boolean excluirRecomendacao(int id, int usuarioId) {
        boolean status = false;

        if (!conectar()) {
            System.err.println("Erro: Não foi possível conectar ao banco de dados");
            return false;
        }

        try {
            String sql = "DELETE FROM recomendacao WHERE id = ? AND usuario_id = ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setInt(1, id);
            st.setInt(2, usuarioId);
            st.executeUpdate();
            st.close();
            status = true;
        } catch (SQLException e) {
            System.err.println("Erro ao excluir recomendação: " + e.getMessage());
        } finally {
            close();
        }
        return status;
    }
}
