package model;

public class Recomendacao {

    // atributos
    private int id;
    private int usuarioId;
    private String titulo;
    private String descricao;
    private int relevancia;
    private boolean status;

    // construtores
    public Recomendacao() {
    }

    public Recomendacao(int id, int usuarioId, String titulo, String descricao, int relevancia, boolean status) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.titulo = titulo;
        this.descricao = descricao;
        this.relevancia = relevancia;
        this.status = status;
    }

    // Getters e Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public int getRelevancia() {
        return relevancia;
    }

    public void setRelevancia(int relevancia) {
        this.relevancia = relevancia;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }
}
