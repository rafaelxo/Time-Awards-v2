package dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import model.Atividade;

public class AtividadeDAO extends DAO {

    public AtividadeDAO() {
        super();
    }

    // Inserir nova atividade para um usuário
    public boolean inserirAtividade(Atividade atividade) {
        verificarConexao();
        boolean status = false;
        try {
            String sql = "INSERT INTO atividade (usuario_id, nomeAtividade, classe, horasGastas, metaHoras, prioridade) "
                    + "VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setInt(1, atividade.getUsuarioId());
            st.setString(2, atividade.getNomeAtividade());
            st.setInt(3, atividade.getClasse());
            st.setDouble(4, atividade.getHorasGastas());
            st.setInt(5, atividade.getMetaHoras());
            st.setInt(6, atividade.getPrioridade());
            st.executeUpdate();
            st.close();
            status = true;
        } catch (SQLException e) {
            System.err.println("Erro ao inserir atividade: " + e.getMessage());
        }
        return status;
    }

    // Listar atividades de um usuário
    public Atividade[] listarAtividades(int usuarioId) {
        Atividade[] atividades = new Atividade[10000];
        int count = 0;

        if (!verificarConexao()) {
            System.err.println("Erro: Não foi possível conectar ao banco de dados");
            return new Atividade[0];
        }

        try {
            String sql = "SELECT * FROM atividade WHERE usuario_id = ? ORDER BY dataHora DESC";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setInt(1, usuarioId);
            ResultSet rs = st.executeQuery();
            while (rs.next()) {
                atividades[count] = new Atividade(
                        rs.getInt("id"),
                        rs.getInt("usuario_id"),
                        rs.getString("nomeAtividade"),
                        rs.getInt("classe"),
                        rs.getDouble("horasGastas"),
                        rs.getInt("metaHoras"),
                        rs.getBoolean("metaCumprida"),
                        rs.getInt("prioridade"),
                        rs.getTimestamp("dataHora").toLocalDateTime());
                count++;
            }
            rs.close();
            st.close();
        } catch (SQLException e) {
            System.err.println("Erro ao listar atividades: " + e.getMessage());
        }

        Atividade[] resultado = new Atividade[count];
        System.arraycopy(atividades, 0, resultado, 0, count);
        return resultado;
    }

    // Buscar uma atividade específica por ID
    public Atividade buscarAtividadePorId(int id, int usuarioId) {
        verificarConexao();
        Atividade a = null;
        try {
            String sql = "SELECT * FROM atividade WHERE id = ? AND usuario_id = ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setInt(1, id);
            st.setInt(2, usuarioId);
            ResultSet rs = st.executeQuery();
            if (rs.next()) {
                a = new Atividade(
                        rs.getInt("id"),
                        rs.getInt("usuario_id"),
                        rs.getString("nomeAtividade"),
                        rs.getInt("classe"),
                        rs.getDouble("horasGastas"),
                        rs.getInt("metaHoras"),
                        rs.getBoolean("metaCumprida"),
                        rs.getInt("prioridade"),
                        rs.getTimestamp("dataHora").toLocalDateTime());
            }
            rs.close();
            st.close();
        } catch (SQLException e) {
            System.err.println("Erro ao buscar atividade: " + e.getMessage());
        }
        return a;
    }

    // Atualizar horas, meta ou prioridade de uma atividade
    public boolean atualizarAtividade(Atividade atividade) {
        verificarConexao();
        boolean status = false;
        try {
            String sql = "UPDATE atividade SET nomeAtividade = ?, classe = ?, horasGastas = ?, metaHoras = ?, prioridade = ? "
                    + "WHERE id = ? AND usuario_id = ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setString(1, atividade.getNomeAtividade());
            st.setInt(2, atividade.getClasse());
            st.setDouble(3, atividade.getHorasGastas());
            st.setInt(4, atividade.getMetaHoras());
            st.setInt(5, atividade.getPrioridade());
            st.setInt(6, atividade.getId());
            st.setInt(7, atividade.getUsuarioId());
            st.executeUpdate();
            st.close();
            status = true;
        } catch (SQLException e) {
            System.err.println("Erro ao atualizar atividade: " + e.getMessage());
        }
        return status;
    }

    // Excluir atividade
    public boolean excluirAtividade(int id, int usuarioId) {
        verificarConexao();
        boolean status = false;
        try {
            String sql = "DELETE FROM atividade WHERE id = ? AND usuario_id = ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setInt(1, id);
            st.setInt(2, usuarioId);
            st.executeUpdate();
            st.close();
            status = true;
        } catch (SQLException e) {
            System.err.println("Erro ao excluir atividade: " + e.getMessage());
        }
        return status;
    }
}
