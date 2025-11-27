package model;

import java.time.LocalDateTime;

public class Atividade {

    // atributos
    private int id;
    private int usuarioId;
    private String nomeAtividade;
    private int classe;
    private double horasGastas;
    private int metaHoras;
    private boolean metaCumprida;
    private int prioridade;
    private LocalDateTime dataHora;

    // construtores
    public Atividade() {
    }

    public Atividade(int id, int usuarioId, String nomeAtividade, int classe, double horasGastas, int metaHoras,
            boolean metaCumprida, int prioridade, LocalDateTime dataHora) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.nomeAtividade = nomeAtividade;
        this.classe = classe;
        this.horasGastas = horasGastas;
        this.metaHoras = metaHoras;
        this.metaCumprida = metaCumprida;
        this.prioridade = prioridade;
        this.dataHora = (dataHora != null) ? dataHora : LocalDateTime.now();
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

    public String getNomeAtividade() {
        return nomeAtividade;
    }

    public void setNomeAtividade(String nomeAtividade) {
        this.nomeAtividade = nomeAtividade;
    }

    public int getClasse() {
        return classe;
    }

    public void setClasse(int classe) {
        this.classe = classe;
    }

    public double getHorasGastas() {
        return horasGastas;
    }

    public void setHorasGastas(double horasGastas) {
        this.horasGastas = horasGastas;
    }

    public int getMetaHoras() {
        return metaHoras;
    }

    public void setMetaHoras(int metaHoras) {
        this.metaHoras = metaHoras;
    }

    public boolean isMetaCumprida() {
        return metaCumprida;
    }

    public void setMetaCumprida(boolean metaCumprida) {
        this.metaCumprida = metaCumprida;
    }

    public int getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(int prioridade) {
        this.prioridade = prioridade;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
