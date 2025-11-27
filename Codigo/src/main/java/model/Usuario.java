package model;

public class Usuario {

    // atributos
    private int id;
    private String nome;
    private String login;
    private String senha;
    private String email;
    private String telefone;
    private boolean notificacoes;

    // construtores
    public Usuario() {
    }

    public Usuario(int id, String nome, String login, String senha, String email, String telefone,
            boolean notificacoes) {
        this.id = id;
        this.nome = nome;
        this.login = login;
        this.senha = senha;
        this.email = email;
        this.telefone = telefone;
        this.notificacoes = notificacoes;
    }

    // Getters e Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public boolean isNotificacoes() {
        return notificacoes;
    }

    public void setNotificacoes(boolean notificacoes) {
        this.notificacoes = notificacoes;
    }
}
