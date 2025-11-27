package dao;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import model.Usuario;

public class UsuarioDAO extends DAO {

    public UsuarioDAO() {
        super();
    }

    // Cadastrar usuário (registrar) - USANDO MD5 DO POSTGRESQL
    public boolean inserirUsuario(Usuario u) {
        verificarConexao();
        boolean status = false;
        try {
            // Usa MD5 nativo do PostgreSQL para garantir consistência
            String sql = "INSERT INTO usuario (nome, login, senha, email, telefone, notificacoes) VALUES (?, ?, MD5(?::text), ?, ?, ?)";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setString(1, u.getNome());
            st.setString(2, u.getLogin());
            st.setString(3, u.getSenha());
            st.setString(4, u.getEmail());
            st.setString(5, u.getTelefone());
            st.setBoolean(6, u.isNotificacoes());
            st.executeUpdate();
            st.close();
            status = true;
            System.out.println("✅ Usuário inserido com sucesso!");
        } catch (SQLException e) {
            System.err.println(" Erro ao inserir usuário: " + e.getMessage());
        }
        return status;
    }

    // Verificar se login já existe
    public boolean loginExiste(String login, int idExcluir) {
        verificarConexao();
        try {
            String sql = "SELECT COUNT(*) FROM usuario WHERE login = ? AND id != ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setString(1, login);
            st.setInt(2, idExcluir);
            ResultSet rs = st.executeQuery();
            rs.next();
            boolean existe = rs.getInt(1) > 0;
            rs.close();
            st.close();
            return existe;
        } catch (SQLException e) {
            System.err.println("Erro ao verificar login: " + e.getMessage());
            return true;
        }
    }

    // Verificar se email já existe
    public boolean emailExiste(String email, int idExcluir) {
        verificarConexao();
        try {
            String sql = "SELECT COUNT(*) FROM usuario WHERE email = ? AND id != ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setString(1, email);
            st.setInt(2, idExcluir);
            ResultSet rs = st.executeQuery();
            rs.next();
            boolean existe = rs.getInt(1) > 0;
            rs.close();
            st.close();
            return existe;
        } catch (SQLException e) {
            System.err.println("Erro ao verificar email: " + e.getMessage());
            return true;
        }
    }

    // Verificar se telefone já existe
    public boolean telefoneExiste(String telefone, int idExcluir) {
        verificarConexao();
        try {
            String sql = "SELECT COUNT(*) FROM usuario WHERE telefone = ? AND id != ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setString(1, telefone);
            st.setInt(2, idExcluir);
            ResultSet rs = st.executeQuery();
            rs.next();
            boolean existe = rs.getInt(1) > 0;
            rs.close();
            st.close();
            return existe;
        } catch (SQLException e) {
            System.err.println("Erro ao verificar telefone: " + e.getMessage());
            return true;
        }
    }

    // Autenticar usuário (login) - USANDO MD5 DO POSTGRESQL
    public Usuario autenticarUsuario(String login, String senhaPlainText) {
        verificarConexao();
        Usuario u = null;
        try {
            // Busca usuário usando MD5 nativo do PostgreSQL para comparar
            String sql = "SELECT * FROM usuario WHERE login = ? AND senha = MD5(?::text)";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setString(1, login);
            st.setString(2, senhaPlainText);
            ResultSet rs = st.executeQuery();
            if (rs.next()) {
                u = new Usuario();
                u.setId(rs.getInt("id"));
                u.setNome(rs.getString("nome"));
                u.setLogin(rs.getString("login"));
                u.setSenha(rs.getString("senha"));
                u.setEmail(rs.getString("email"));
                u.setTelefone(rs.getString("telefone"));
                u.setNotificacoes(rs.getBoolean("notificacoes"));
            }
            rs.close();
            st.close();
        } catch (SQLException e) {
            System.err.println("Erro ao autenticar usuário: " + e.getMessage());
        }
        return u;
    }

    // Listar todos os usuários
    public Usuario[] listarUsuarios() {
        verificarConexao();
        Usuario[] usuarios = new Usuario[10000];
        int count = 0;
        try {
            String sql = "SELECT * FROM usuario ORDER BY nome";
            PreparedStatement st = conexao.prepareStatement(sql);
            ResultSet rs = st.executeQuery();
            while (rs.next()) {
                usuarios[count] = new Usuario();
                usuarios[count].setId(rs.getInt("id"));
                usuarios[count].setNome(rs.getString("nome"));
                usuarios[count].setLogin(rs.getString("login"));
                usuarios[count].setSenha(rs.getString("senha"));
                usuarios[count].setEmail(rs.getString("email"));
                usuarios[count].setTelefone(rs.getString("telefone"));
                usuarios[count].setNotificacoes(rs.getBoolean("notificacoes"));
                count++;
            }
            rs.close();
            st.close();
        } catch (SQLException e) {
            System.err.println("Erro ao listar usuários: " + e.getMessage());
        }
        Usuario[] resultado = new Usuario[count];
        System.arraycopy(usuarios, 0, resultado, 0, count);
        return resultado;
    }

    // Buscar usuário por ID
    public Usuario buscarUsuarioPorId(int id) {
        verificarConexao();
        Usuario u = null;
        try {
            String sql = "SELECT * FROM usuario WHERE id = ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setInt(1, id);
            ResultSet rs = st.executeQuery();
            if (rs.next()) {
                u = new Usuario();
                u.setId(rs.getInt("id"));
                u.setNome(rs.getString("nome"));
                u.setLogin(rs.getString("login"));
                u.setSenha(rs.getString("senha"));
                u.setEmail(rs.getString("email"));
                u.setTelefone(rs.getString("telefone"));
                u.setNotificacoes(rs.getBoolean("notificacoes"));
            }
            rs.close();
            st.close();
        } catch (SQLException e) {
            System.err.println("Erro ao buscar usuário: " + e.getMessage());
        }
        return u;
    }

    // Atualizar usuário - USANDO MD5 DO POSTGRESQL
    public boolean atualizarUsuario(Usuario u) {
        verificarConexao();
        boolean status = false;
        try {
            // Se senha estiver vazia/nula, NÃO atualiza a senha
            String sql;
            PreparedStatement st;

            if (u.getSenha() == null || u.getSenha().trim().isEmpty()) {
                // Atualiza SEM alterar a senha
                sql = "UPDATE usuario SET nome = ?, login = ?, email = ?, telefone = ?, notificacoes = ? WHERE id = ?";
                st = conexao.prepareStatement(sql);
                st.setString(1, u.getNome());
                st.setString(2, u.getLogin());
                st.setString(3, u.getEmail());
                st.setString(4, u.getTelefone());
                st.setBoolean(5, u.isNotificacoes());
                st.setInt(6, u.getId());
            } else {
                // Atualiza incluindo nova senha
                sql = "UPDATE usuario SET nome = ?, login = ?, senha = MD5(?::text), email = ?, telefone = ?, notificacoes = ? WHERE id = ?";
                st = conexao.prepareStatement(sql);
                st.setString(1, u.getNome());
                st.setString(2, u.getLogin());
                st.setString(3, u.getSenha());
                st.setString(4, u.getEmail());
                st.setString(5, u.getTelefone());
                st.setBoolean(6, u.isNotificacoes());
                st.setInt(7, u.getId());
                System.out.println("🔐 Nova senha definida!");
            }

            st.executeUpdate();
            st.close();
            status = true;
            System.out.println("✅ Usuário atualizado com sucesso!");
        } catch (SQLException e) {
            System.err.println("Erro ao atualizar usuário: " + e.getMessage());
        }
        return status;
    }

    // Atualizar apenas notificações (SEM tocar na senha!)
    public boolean atualizarNotificacoes(int id, boolean notificacoes) {
        verificarConexao();
        boolean status = false;
        try {
            String sql = "UPDATE usuario SET notificacoes = ? WHERE id = ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setBoolean(1, notificacoes);
            st.setInt(2, id);
            st.executeUpdate();
            st.close();
            status = true;
            System.out.println("✅ Notificações atualizadas sem alterar senha!");
        } catch (SQLException e) {
            System.err.println("Erro ao atualizar notificações: " + e.getMessage());
        }
        return status;
    }

    // Excluir usuário
    public boolean excluirUsuario(int id) {
        verificarConexao();
        boolean status = false;
        try {
            String sql = "DELETE FROM usuario WHERE id = ?";
            PreparedStatement st = conexao.prepareStatement(sql);
            st.setInt(1, id);
            st.executeUpdate();
            st.close();
            status = true;
        } catch (SQLException e) {
            System.err.println("Erro ao excluir usuário: " + e.getMessage());
        }
        return status;
    }
}
