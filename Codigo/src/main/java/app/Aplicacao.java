package app;

import static spark.Spark.delete;
import static spark.Spark.get;
import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.put;
import static spark.Spark.staticFiles;
import static spark.Spark.stop;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;

import com.google.gson.Gson;

import dao.AtividadeDAO;
import dao.RecomendacaoDAO;
import dao.UsuarioDAO;
import model.Atividade;
import model.Recomendacao;
import model.Usuario;
import service.NotificacoesService;
import service.RecomendadorService;
import spark.Request;

public class Aplicacao {
    private static UsuarioDAO usuarioDAO = new UsuarioDAO();
    private static AtividadeDAO atividadeDAO = new AtividadeDAO();
    private static RecomendacaoDAO recomendacaoDAO = new RecomendacaoDAO();
    private static RecomendadorService recomendadorIA = new RecomendadorService();
    private static Gson gson = new Gson();

    public static void main(String[] args) {
        port(6789);
        staticFiles.location("/public");

        if (!usuarioDAO.conectar() || !atividadeDAO.conectar() || !recomendacaoDAO.conectar()) {
            System.out.println("Falha ao conectar no banco!");
            stop();
            return;
        }

        // Inicializar agendamento automático de lembretes (6h, 12h, 20h) e relatórios diários (23:59)
        NotificacoesService.iniciarTodosAgendamentos(atividadeDAO, usuarioDAO);

        final java.util.function.BiFunction<Request, String, String> param = (req, name) -> {
            String v = req.queryParams(name);
            if (v != null)
                return v;
            String body = req.body();
            if (body == null || body.isEmpty())
                return null;
            for (String pair : body.split("&")) {
                String[] kv = pair.split("=", 2);
                if (kv.length == 2) {
                    String k = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
                    if (k.equals(name))
                        return URLDecoder.decode(kv[1], StandardCharsets.UTF_8);
                }
            }
            return null;
        };

        // ==================== ROTAS DE USUÁRIO ====================

        // Inserir usuário
        post("/usuarios", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            String nome = param.apply(req, "nome");
            String login = param.apply(req, "login");
            String email = param.apply(req, "email");
            String telefone = param.apply(req, "telefone");
            String senha = param.apply(req, "senha");

            // Validações de unicidade
            if (usuarioDAO.loginExiste(login, 0)) {
                res.status(400);
                return "{\"success\":false, \"message\":\"Este login já está em uso. Escolha outro.\", \"field\":\"login\"}";
            }
            if (usuarioDAO.emailExiste(email, 0)) {
                res.status(400);
                return "{\"success\":false, \"message\":\"Este email já está em uso. Escolha outro.\", \"field\":\"email\"}";
            }
            if (usuarioDAO.telefoneExiste(telefone, 0)) {
                res.status(400);
                return "{\"success\":false, \"message\":\"Este telefone já está em uso. Escolha outro.\", \"field\":\"telefone\"}";
            }

            Usuario u = new Usuario();
            u.setNome(nome);
            u.setLogin(login);
            u.setSenha(senha);
            u.setEmail(email);
            u.setTelefone(telefone);
            boolean ok = usuarioDAO.inserirUsuario(u);
            res.status(ok ? 201 : 500);
            return "{\"success\":" + ok + "}";
        });

        // Buscar usuário por ID
        get("/usuarios/:id", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            Usuario usuario = usuarioDAO.buscarUsuarioPorId(id);
            if (usuario != null) {
                res.status(200);
                return "{\"success\":true, \"id\":" + usuario.getId() +
                        ", \"nome\":\"" + usuario.getNome() + "\"" +
                        ", \"login\":\"" + usuario.getLogin() + "\"" +
                        ", \"email\":\"" + usuario.getEmail() + "\"" +
                        ", \"telefone\":\"" + usuario.getTelefone() + "\"" +
                        ", \"notificacoes\":" + usuario.isNotificacoes() + "}";
            } else {
                res.status(404);
                return "{\"success\":false, \"message\":\"Usuário não encontrado\"}";
            }
        });

        // Listar todos os usuários
        get("/usuarios", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            Usuario[] usuarios = usuarioDAO.listarUsuarios();
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < usuarios.length; i++) {
                Usuario u = usuarios[i];
                json.append("{\"id\":").append(u.getId())
                        .append(", \"nome\":\"").append(u.getNome()).append("\"")
                        .append(", \"login\":\"").append(u.getLogin()).append("\"")
                        .append(", \"email\":\"").append(u.getEmail()).append("\"")
                        .append(", \"telefone\":\"").append(u.getTelefone()).append("\"}");
                if (i < usuarios.length - 1)
                    json.append(",");
            }
            json.append("]");
            res.status(200);
            return json.toString();
        });

        // Atualizar usuário
        put("/usuarios/:id", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            String nome = param.apply(req, "nome");
            String login = param.apply(req, "login");
            String email = param.apply(req, "email");
            String telefone = param.apply(req, "telefone");
            String senha = param.apply(req, "senha");
            String notificacoesParam = param.apply(req, "notificacoes");
            boolean notificacoes = "true".equals(notificacoesParam);

            if (usuarioDAO.loginExiste(login, id)) {
                res.status(400);
                return "{\"success\":false, \"message\":\"Este login já está em uso. Escolha outro.\", \"field\":\"login\"}";
            }
            if (usuarioDAO.emailExiste(email, id)) {
                res.status(400);
                return "{\"success\":false, \"message\":\"Este email já está em uso. Escolha outro.\", \"field\":\"email\"}";
            }
            if (usuarioDAO.telefoneExiste(telefone, id)) {
                res.status(400);
                return "{\"success\":false, \"message\":\"Este telefone já está em uso. Escolha outro.\", \"field\":\"telefone\"}";
            }

            Usuario u = new Usuario();
            u.setId(id);
            u.setNome(nome);
            u.setLogin(login);
            u.setSenha(senha);
            u.setEmail(email);
            u.setTelefone(telefone);
            u.setNotificacoes(notificacoes);
            boolean ok = usuarioDAO.atualizarUsuario(u);
            res.status(ok ? 200 : 404);
            return "{\"success\":" + ok + "}";
        });

        // Atualizar apenas preferência de notificações do usuário
        put("/usuarios/:id/notificacoes", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            String notificacoesParam = param.apply(req, "notificacoes");
            boolean notificacoes = "true".equals(notificacoesParam);

            // Atualizar APENAS notificações sem tocar na senha!
            boolean ok = usuarioDAO.atualizarNotificacoes(id, notificacoes);

            res.status(ok ? 200 : 500);
            return "{\"success\":" + ok + ", \"notificacoes\":" + notificacoes + "}";
        });

        // Excluir usuário
        delete("/usuarios/:id", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            boolean ok = usuarioDAO.excluirUsuario(id);
            res.status(ok ? 200 : 404);
            return "{\"success\":" + ok + "}";
        });

        // Autenticar usuário - ENVIA SENHA PLANA (PostgreSQL fará MD5)
        post("/login", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            String login = param.apply(req, "login");
            String senha = param.apply(req, "senha");
            Usuario usuario = usuarioDAO.autenticarUsuario(login, senha);
            if (usuario != null) {
                res.status(200);
                return "{\"success\":true, \"id\":" + usuario.getId() + ", \"nome\":\"" + usuario.getNome() + "\"}";
            } else {
                res.status(401);
                return "{\"success\":false, \"message\":\"Login ou senha inválidos\"}";
            }
        });

        // ==================== ROTAS DE ATIVIDADE ====================

        // Inserir atividade
        post("/atividades", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            Atividade a = new Atividade();
            a.setUsuarioId(Integer.parseInt(param.apply(req, "usuarioId")));
            a.setNomeAtividade(param.apply(req, "nomeAtividade"));
            a.setClasse(Integer.parseInt(param.apply(req, "classe")));
            String horasStr = param.apply(req, "horasGastas");
            if (horasStr == null || horasStr.isEmpty()) {
                res.status(400);
                return "{\"success\":false, \"message\":\"horasGastas é obrigatório\"}";
            }
            horasStr = horasStr.replace(',', '.');
            try {
                a.setHorasGastas(Double.parseDouble(horasStr));
            } catch (NumberFormatException nfe) {
                System.err.println("Invalid horasGastas received: '" + horasStr + "'");
                res.status(400);
                return "{\"success\":false, \"message\":\"horasGastas inválido\"}";
            }
            a.setMetaHoras(Integer.parseInt(param.apply(req, "metaHoras")));
            a.setPrioridade(Integer.parseInt(param.apply(req, "prioridade")));
            a.setDataHora(LocalDateTime.now());
            boolean ok = atividadeDAO.inserirAtividade(a);
            res.status(ok ? 201 : 500);
            return "{\"success\":" + ok + "}";
        });

        // Buscar atividade por ID
        get("/atividades/:id", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            int usuarioId = Integer.parseInt(param.apply(req, "usuarioId"));
            Atividade atividade = atividadeDAO.buscarAtividadePorId(id, usuarioId);
            if (atividade != null) {
                res.status(200);
                return "{\"success\":true, \"id\":" + atividade.getId() +
                        ", \"usuarioId\":" + atividade.getUsuarioId() +
                        ", \"nomeAtividade\":\"" + atividade.getNomeAtividade() + "\"" +
                        ", \"classe\":" + atividade.getClasse() +
                        ", \"horasGastas\":" + atividade.getHorasGastas() +
                        ", \"metaHoras\":" + atividade.getMetaHoras() +
                        ", \"metaCumprida\":" + atividade.isMetaCumprida() +
                        ", \"prioridade\":" + atividade.getPrioridade() +
                        ", \"dataHora\":\"" + atividade.getDataHora() + "\"}";
            } else {
                res.status(404);
                return "{\"success\":false, \"message\":\"Atividade não encontrada\"}";
            }
        });

        // Listar atividades de um usuário
        get("/atividades", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int usuarioId = Integer.parseInt(param.apply(req, "usuarioId"));
            Atividade[] atividades = atividadeDAO.listarAtividades(usuarioId);
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < atividades.length; i++) {
                Atividade a = atividades[i];
                json.append("{\"id\":").append(a.getId())
                        .append(", \"usuarioId\":").append(a.getUsuarioId())
                        .append(", \"nomeAtividade\":\"").append(a.getNomeAtividade()).append("\"")
                        .append(", \"classe\":").append(a.getClasse())
                        .append(", \"horasGastas\":").append(a.getHorasGastas())
                        .append(", \"metaHoras\":").append(a.getMetaHoras())
                        .append(", \"metaCumprida\":").append(a.isMetaCumprida())
                        .append(", \"prioridade\":").append(a.getPrioridade())
                        .append(", \"dataHora\":\"").append(a.getDataHora()).append("\"}");
                if (i < atividades.length - 1)
                    json.append(",");
            }
            json.append("]");
            res.status(200);
            return json.toString();
        });

        // Atualizar atividade
        put("/atividades/:id", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            Atividade a = new Atividade();
            a.setId(id);
            a.setUsuarioId(Integer.parseInt(param.apply(req, "usuarioId")));
            a.setNomeAtividade(param.apply(req, "nomeAtividade"));
            a.setClasse(Integer.parseInt(param.apply(req, "classe")));
            String horasStr = param.apply(req, "horasGastas");
            if (horasStr == null || horasStr.isEmpty()) {
                res.status(400);
                return "{\"success\":false, \"message\":\"horasGastas é obrigatório\"}";
            }
            horasStr = horasStr.replace(',', '.');
            try {
                a.setHorasGastas(Double.parseDouble(horasStr));
            } catch (NumberFormatException nfe) {
                System.err.println("Invalid horasGastas received for update: '" + horasStr + "'");
                res.status(400);
                return "{\"success\":false, \"message\":\"horasGastas inválido\"}";
            }
            a.setMetaHoras(Integer.parseInt(param.apply(req, "metaHoras")));
            a.setPrioridade(Integer.parseInt(param.apply(req, "prioridade")));
            a.setDataHora(LocalDateTime.now());
            boolean ok = atividadeDAO.atualizarAtividade(a);
            res.status(ok ? 200 : 404);
            return "{\"success\":" + ok + "}";
        });

        // Excluir atividade
        delete("/atividades/:id", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            int usuarioId = Integer.parseInt(param.apply(req, "usuarioId"));
            boolean ok = atividadeDAO.excluirAtividade(id, usuarioId);
            res.status(ok ? 200 : 404);
            return "{\"success\":" + ok + "}";
        });

        // ==================== ROTAS DE RECOMENDAÇÃO ====================

        // Inserir recomendação
        post("/recomendacoes", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            Recomendacao r = new Recomendacao();
            r.setUsuarioId(Integer.parseInt(param.apply(req, "usuarioId")));
            r.setTitulo(param.apply(req, "titulo"));
            r.setDescricao(param.apply(req, "descricao"));
            r.setRelevancia(Integer.parseInt(param.apply(req, "relevancia")));
            r.setStatus(Boolean.parseBoolean(param.apply(req, "status")));
            boolean ok = recomendacaoDAO.inserirRecomendacao(r);
            res.status(ok ? 201 : 500);
            return "{\"success\":" + ok + "}";
        });

        // Buscar recomendação por ID
        get("/recomendacoes/:id", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            int usuarioId = Integer.parseInt(param.apply(req, "usuarioId"));
            Recomendacao recomendacao = recomendacaoDAO.buscarRecomendacaoPorId(id, usuarioId);
            if (recomendacao != null) {
                res.status(200);
                return "{\"success\":true, \"id\":" + recomendacao.getId() +
                        ", \"usuarioId\":" + recomendacao.getUsuarioId() +
                        ", \"titulo\":\"" + recomendacao.getTitulo() + "\"" +
                        ", \"descricao\":\"" + recomendacao.getDescricao() + "\"" +
                        ", \"relevancia\":" + recomendacao.getRelevancia() +
                        ", \"status\":" + recomendacao.isStatus() + "}";
            } else {
                res.status(404);
                return "{\"success\":false, \"message\":\"Recomendação não encontrada\"}";
            }
        });

        // Listar recomendações de um usuário
        get("/recomendacoes", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int usuarioId = Integer.parseInt(param.apply(req, "usuarioId"));
            Recomendacao[] recomendacoes = recomendacaoDAO.listarRecomendacoes(usuarioId);
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < recomendacoes.length; i++) {
                Recomendacao r = recomendacoes[i];
                json.append("{\"id\":").append(r.getId())
                        .append(", \"usuarioId\":").append(r.getUsuarioId())
                        .append(", \"titulo\":\"").append(r.getTitulo()).append("\"")
                        .append(", \"descricao\":\"").append(r.getDescricao()).append("\"")
                        .append(", \"relevancia\":").append(r.getRelevancia())
                        .append(", \"status\":").append(r.isStatus()).append("}");
                if (i < recomendacoes.length - 1)
                    json.append(",");
            }
            json.append("]");
            res.status(200);
            return json.toString();
        });

        // Atualizar recomendação completa
        put("/recomendacoes/:id", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            Recomendacao r = new Recomendacao();
            r.setId(id);
            r.setUsuarioId(Integer.parseInt(param.apply(req, "usuarioId")));
            r.setTitulo(param.apply(req, "titulo"));
            r.setDescricao(param.apply(req, "descricao"));
            r.setRelevancia(Integer.parseInt(param.apply(req, "relevancia")));
            r.setStatus(Boolean.parseBoolean(param.apply(req, "status")));
            boolean ok = recomendacaoDAO.atualizarRecomendacao(r);
            res.status(ok ? 200 : 404);
            return "{\"success\":" + ok + "}";
        });

        // Atualizar status da recomendação
        put("/recomendacoes/:id/status", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            int usuarioId = Integer.parseInt(param.apply(req, "usuarioId"));
            boolean novoStatus = Boolean.parseBoolean(param.apply(req, "status"));
            boolean ok = recomendacaoDAO.atualizarStatus(id, usuarioId, novoStatus);
            res.status(ok ? 200 : 404);
            return "{\"success\":" + ok + "}";
        });

        // Excluir recomendação
        delete("/recomendacoes/:id", (req, res) -> {
            res.type("application/json; charset=UTF-8");
            int id = Integer.parseInt(req.params(":id"));
            int usuarioId = Integer.parseInt(param.apply(req, "usuarioId"));
            boolean ok = recomendacaoDAO.excluirRecomendacao(id, usuarioId);
            res.status(ok ? 200 : 404);
            return "{\"success\":" + ok + "}";
        });

        // Gerar recomendações via IA
        post("/recomendacoes/gerar", (req, res) -> {
            res.type("application/json; charset=UTF-8");

            String usuarioIdStr = req.queryParams("usuarioId");
            if (usuarioIdStr == null || usuarioIdStr.isEmpty()) {
                res.status(400);
                return "{\"success\":false, \"message\":\"usuarioId é obrigatório\"}";
            }

            try {
                int usuarioId = Integer.parseInt(usuarioIdStr);
                Recomendacao[] recomendacoes = recomendadorIA.gerarRecomendacoesUsuario(usuarioId);

                res.status(200);
                return gson.toJson(Map.of(
                        "success", true,
                        "recomendacoes", recomendacoes,
                        "total", recomendacoes.length));
            } catch (NumberFormatException e) {
                res.status(400);
                return "{\"success\":false, \"message\":\"usuarioId inválido\"}";
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(Map.of(
                        "success", false,
                        "message", "Erro ao gerar recomendações: " + e.getMessage()));
            }
        });

        // ==================== ROTA PARA ENVIO DE RELATÓRIOS ====================

        post("/relatorios/enviar", (req, res) -> {
            res.type("application/json; charset=UTF-8");

            try {
                // Parse do JSON enviado pelo frontend
                @SuppressWarnings("unchecked")
                Map<String, Object> dados = gson.fromJson(req.body(), Map.class);
                int usuarioId = ((Double) dados.get("usuarioId")).intValue();
                String tipo = (String) dados.get("tipo");

                // Buscar dados do usuário
                Usuario usuario = usuarioDAO.buscarUsuarioPorId(usuarioId);
                if (usuario == null) {
                    res.status(404);
                    return "{\"success\":false, \"message\":\"Usuário não encontrado\"}";
                }

                // Verificar se notificações estão habilitadas
                if (!usuario.isNotificacoes()) {
                    res.status(400);
                    return "{\"success\":false, \"message\":\"Notificações desabilitadas para este usuário\"}";
                }

                String assunto = "";
                String corpoHTML = "";

                if ("diario".equals(tipo)) {
                    // Relatório Diário
                    String data = (String) dados.get("data");
                    double tempoTotal = (Double) dados.get("tempoTotal");
                    String metasAtingidas = (String) dados.get("metasAtingidas");
                    String categoriaDestaque = (String) dados.get("categoriaDestaque");
                    String sugestao = (String) dados.get("sugestao");

                    assunto = "📊 Seu Relatório Diário - " + data;
                    corpoHTML = NotificacoesService.gerarTemplateRelatorioDiario(
                            usuario.getNome(), data, tempoTotal, metasAtingidas, categoriaDestaque, sugestao);

                } else if ("semanal".equals(tipo)) {
                    // Relatório Semanal
                    String periodo = (String) dados.get("periodo");
                    double tempoTotal = (Double) dados.get("tempoTotal");
                    String comparacao = (String) dados.get("comparacao");
                    String melhorDia = (String) dados.get("melhorDia");
                    String categoriaDestaque = (String) dados.get("categoriaDestaque");
                    String insight = (String) dados.get("insight");
                    int totalAtividades = dados.containsKey("totalAtividades")
                            ? ((Double) dados.get("totalAtividades")).intValue()
                            : 0;

                    assunto = "📈 Seu Relatório Semanal - " + periodo;
                    corpoHTML = NotificacoesService.gerarTemplateRelatorioSemanal(
                            usuario.getNome(), periodo, tempoTotal, comparacao, melhorDia, categoriaDestaque, insight,
                            totalAtividades);
                } else {
                    res.status(400);
                    return "{\"success\":false, \"message\":\"Tipo de relatório inválido\"}";
                }

                // Enviar email
                boolean enviado = NotificacoesService.enviarRelatorio(usuario.getEmail(), assunto, corpoHTML);

                if (enviado) {
                    res.status(200);
                    return "{\"success\":true, \"message\":\"Relatório enviado com sucesso!\"}";
                } else {
                    res.status(500);
                    return "{\"success\":false, \"message\":\"Erro ao enviar email\"}";
                }

            } catch (Exception e) {
                e.printStackTrace();
                res.status(500);
                return gson.toJson(Map.of(
                        "success", false,
                        "message", "Erro ao processar relatório: " + e.getMessage()));
            }
        });
    }
}
