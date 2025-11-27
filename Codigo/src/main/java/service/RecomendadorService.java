package service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import dao.AtividadeDAO;
import dao.RecomendacaoDAO;
import model.Atividade;
import model.Recomendacao;

public class RecomendadorService {

    private final String ENDPOINT = "";
    private final String API_KEY = "";
    private final String DEPLOYMENT = "";

    private final AtividadeDAO atividadeDAO = new AtividadeDAO();
    private final RecomendacaoDAO recomendacaoDAO = new RecomendacaoDAO();
    private final HttpClient http = HttpClient.newHttpClient();
    private final Gson gson = new Gson();

    public Recomendacao[] gerarRecomendacoesUsuario(int usuarioId) throws Exception {
        Atividade[] atividades = atividadeDAO.listarAtividades(usuarioId);
        if (atividades == null || atividades.length == 0) {
            return gerarRecomendacoesPadrao(usuarioId);
        }

        String contextoAtividades = construirContextoAtividades(atividades);
        String prompt = construirPrompt(contextoAtividades, usuarioId);
        String respostaIA = chamarAzureOpenAI(prompt);

        Recomendacao[] recomendacoes = parseResposta(respostaIA, usuarioId);
        for (Recomendacao r : recomendacoes) {
            recomendacaoDAO.inserirRecomendacao(r);
        }

        return recomendacoes;
    }

    private String construirContextoAtividades(Atividade[] atividades) {
        StringBuilder sb = new StringBuilder();
        sb.append("Lista de atividades do usuário:\n");

        Map<Integer, List<Atividade>> porClasse = new HashMap<>();
        for (Atividade a : atividades) {
            if (a == null)
                continue;
            porClasse.computeIfAbsent(a.getClasse(), k -> new ArrayList<>()).add(a);
        }

        String[] nomeClasses = { "", "Atividade Física", "Estudos", "Trabalho", "Tempo de Tela", "Lazer", "Outros" };

        for (Map.Entry<Integer, List<Atividade>> entry : porClasse.entrySet()) {
            int classe = entry.getKey();
            List<Atividade> lista = entry.getValue();
            double totalHoras = lista.stream().mapToDouble(Atividade::getHorasGastas).sum();

            String nomeClasse = (classe >= 0 && classe < nomeClasses.length) ? nomeClasses[classe] : "Classe " + classe;
            sb.append("\n").append(nomeClasse).append(" (").append(totalHoras).append("h total):\n");

            for (Atividade a : lista) {
                String prioridadeTexto = getPrioridadeTexto(a.getPrioridade());
                sb.append("  - ").append(a.getNomeAtividade())
                        .append(" [").append(prioridadeTexto).append("]")
                        .append(" (").append(a.getHorasGastas()).append("h")
                        .append(", ").append(a.getDataHora()).append(")\n");
            }
        }

        sb.append("\nAnálise por Prioridade\n");
        Map<Integer, List<Atividade>> porPrioridade = new HashMap<>();
        for (Atividade a : atividades) {
            if (a == null)
                continue;
            porPrioridade.computeIfAbsent(a.getPrioridade(), k -> new ArrayList<>()).add(a);
        }

        String[] nomePrioridades = { "", "Alta", "Média", "Baixa" };

        for (int prio = 1; prio <= 3; prio++) {
            List<Atividade> lista = porPrioridade.get(prio);
            if (lista == null || lista.isEmpty())
                continue;

            double totalHoras = lista.stream().mapToDouble(Atividade::getHorasGastas).sum();
            String nomePrioridade = (prio >= 0 && prio < nomePrioridades.length) ? nomePrioridades[prio]
                    : "Prioridade " + prio;

            sb.append("\n").append(nomePrioridade).append(" (").append(lista.size()).append(" atividades, ")
                    .append(totalHoras).append("h total):\n");

            for (Atividade a : lista) {
                String nomeClasse = (a.getClasse() >= 0 && a.getClasse() < nomeClasses.length)
                        ? nomeClasses[a.getClasse()]
                        : "Classe " + a.getClasse();
                sb.append("  - ").append(a.getNomeAtividade())
                        .append(" [").append(nomeClasse).append("]")
                        .append(" (").append(a.getHorasGastas()).append("h)\n");
            }
        }

        return sb.toString();
    }

    private String getPrioridadeTexto(int prioridade) {
        switch (prioridade) {
            case 1:
                return "Alta";
            case 2:
                return "Média";
            case 3:
                return "Baixa";
            default:
                return "Indefinida";
        }
    }

    private String construirPrompt(String contextoAtividades, int usuarioId) {
        return "Você é um assistente especializado em produtividade e bem-estar.\n\n" +
                "Com base nas atividades abaixo (organizadas por classe E prioridade), gere 3 recomendações práticas para melhorar a rotina do usuário.\n"
                +
                "Considere:\n" +
                "- Equilíbrio entre estudo, trabalho, exercício e descanso\n" +
                "- Priorização: tarefas de alta prioridade devem ter atenção especial\n" +
                "- Se há muitas tarefas de baixa prioridade consumindo tempo, sugira delegar ou eliminar\n" +
                "- Técnicas de gestão de tempo (Pomodoro, blocos de tempo, matriz de Eisenhower)\n" +
                "- Saúde mental (pausas, sono, lazer)\n" +
                "- Se tarefas de alta prioridade têm poucas horas, sugira redistribuir tempo\n\n" +
                contextoAtividades + "\n\n" +
                "Retorne APENAS um JSON válido no formato:\n" +
                "{\n" +
                "  \"recomendacoes\": [\n" +
                "    {\n" +
                "      \"titulo\": \"Título curto da recomendação\",\n" +
                "      \"descricao\": \"Descrição detalhada e prática\",\n" +
                "      \"relevancia\": 1-3 (1=baixa, 2=média, 3=alta)\n" +
                "    }\n" +
                "  ]\n" +
                "}\n\n" +
                "Não inclua texto adicional fora do JSON.";
    }

    private String chamarAzureOpenAI(String prompt) throws Exception {
        if (ENDPOINT == null || API_KEY == null || DEPLOYMENT == null) {
            throw new Exception("Variáveis de ambiente Azure OpenAI não configuradas. Usando fallback heurístico.");
        }

        String url = ENDPOINT;
        if (!url.endsWith("/"))
            url += "/";
        url += "openai/deployments/" + DEPLOYMENT + "/chat/completions?api-version=2024-08-01-preview";

        Map<String, Object> payload = new HashMap<>();
        payload.put("messages", Arrays.asList(
                Map.of("role", "system", "content", "Você é um assistente de produtividade."),
                Map.of("role", "user", "content", prompt)));
        payload.put("max_tokens", 1000);
        payload.put("temperature", 0.7);

        String body = gson.toJson(payload);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .header("api-key", API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
            throw new Exception("Erro Azure OpenAI: " + resp.statusCode() + " - " + resp.body());
        }

        JsonObject jsonResp = JsonParser.parseString(resp.body()).getAsJsonObject();
        JsonArray choices = jsonResp.getAsJsonArray("choices");
        if (choices.size() == 0) {
            throw new Exception("Nenhuma resposta retornada pela IA");
        }

        String content = choices.get(0).getAsJsonObject()
                .getAsJsonObject("message")
                .get("content").getAsString();

        return content.trim();
    }

    private Recomendacao[] parseResposta(String respostaIA, int usuarioId) {
        try {
            String json = respostaIA;
            if (json.contains("```json")) {
                json = json.substring(json.indexOf("```json") + 7);
                json = json.substring(0, json.indexOf("```"));
            } else if (json.contains("```")) {
                json = json.substring(json.indexOf("```") + 3);
                json = json.substring(0, json.indexOf("```"));
            }
            json = json.trim();

            JsonObject obj = JsonParser.parseString(json).getAsJsonObject();
            JsonArray recsArray = obj.getAsJsonArray("recomendacoes");

            List<Recomendacao> lista = new ArrayList<>();
            for (int i = 0; i < recsArray.size(); i++) {
                JsonObject recObj = recsArray.get(i).getAsJsonObject();
                Recomendacao r = new Recomendacao();
                r.setUsuarioId(usuarioId);
                r.setTitulo(recObj.get("titulo").getAsString());
                r.setDescricao(recObj.get("descricao").getAsString());
                r.setRelevancia(recObj.get("relevancia").getAsInt());
                r.setStatus(false);
                lista.add(r);
            }

            return lista.toArray(new Recomendacao[0]);

        } catch (Exception e) {
            System.err.println("Erro ao parsear resposta IA: " + e.getMessage());
            return gerarRecomendacoesPadrao(usuarioId);
        }
    }

    private Recomendacao[] gerarRecomendacoesPadrao(int usuarioId) {
        Recomendacao r1 = new Recomendacao();
        r1.setUsuarioId(usuarioId);
        r1.setTitulo("Organize sua rotina");
        r1.setDescricao(
                "Comece registrando suas atividades diárias. Use blocos de tempo dedicados para estudo, trabalho e lazer.");
        r1.setRelevancia(2);
        r1.setStatus(false);

        Recomendacao r2 = new Recomendacao();
        r2.setUsuarioId(usuarioId);
        r2.setTitulo("Inclua pausas regulares");
        r2.setDescricao(
                "A cada 50 minutos de foco, faça uma pausa de 10 minutos. Técnica Pomodoro ajuda a manter a produtividade.");
        r2.setRelevancia(2);
        r2.setStatus(false);

        return new Recomendacao[] { r1, r2 };
    }
}
