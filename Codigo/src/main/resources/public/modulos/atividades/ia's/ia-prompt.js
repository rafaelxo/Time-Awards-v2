const mostrarMsgMessage = (message, type = "error") => {
    const container =
        document.getElementById("notification-container") ||
        containerNotif();
    const notification = document.createElement("div");
    notification.className = `notification ${type} show`;
    notification.textContent = message;
    container.appendChild(notification);
    setTimeout(
        () => {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 300);
        },
        type === "success" ? 4000 : 3000
    );
};

const containerNotif = () => {
    const container = document.createElement("div");
    container.id = "notification-container";
    document.body.appendChild(container);
    return container;
};

const AZURE_CONFIG = {
    azureEndpoint: "https://rectimeawards.openai.azure.com",
    azureApiKey: "7VksncO3WYedWIN6ffBDgnTX7aZrf2RNVREjEhqMojs9HZrugmFUJQQJ99BJACHYHv6XJ3w3AAABACOGp8Ed",
    azureDeployment: "gpt-4o",
    azureApiVersion: "2023-12-01-preview",
    timeoutMs: 15000
};

function tentarExtrairJsonDoTexto(text) {
    if (!text) return null;
    const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "");
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
        const altMatch = cleaned.match(/\[[\s\S]*\]/);
        if (altMatch) {
            try {
                return JSON.parse(altMatch[0]);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
    try {
        return JSON.parse(match[0]);
    } catch (e) {
        return null;
    }
}

async function interpretarComAzure(promptText) {
    if (!AZURE_CONFIG.azureEndpoint || !AZURE_CONFIG.azureApiKey || !AZURE_CONFIG.azureDeployment) {
        return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AZURE_CONFIG.timeoutMs);

    const systemMessage = {
        role: "system",
        content:
            "Você é um assistente que extrai de forma precisa e confiável os dados de uma " +
            "descrição de atividade em linguagem natural. Deve retornar SOMENTE um objeto JSON " +
            "com as chaves: nome (string), classe (Trabalho|Estudos|Atividade Física|Lazer|Sono), " +
            "horas (número, pode ser decimal) e prioridade (Baixa|Média|Alta). " +
            "Exemplo de saída válida: {\"nome\":\"Reunião com cliente\",\"classe\":\"Trabalho\",\"horas\":2,\"prioridade\":\"Alta\"}. " +
            "Se algum campo for incerto, gere um valor sensato (horas mínimo 0.1). Não inclua texto explicativo extra. " +
            "Sempre retorne o resultado como um objeto JSON válido, sem texto adicional antes ou depois."
    };

    const userMessage = {
        role: "user",
        content:
            "Analise este texto de usuário e extraia nome, classe, horas e prioridade como JSON estrito:\n\n" +
            promptText
    };

    const url = `${AZURE_CONFIG.azureEndpoint}/openai/deployments/${AZURE_CONFIG.azureDeployment}/chat/completions?api-version=${AZURE_CONFIG.azureApiVersion}`;

    const body = {
        messages: [systemMessage, userMessage],
        max_tokens: 300,
        temperature: 0,
        top_p: 1,
        n: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": AZURE_CONFIG.azureApiKey
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!res.ok) {
            console.warn("Azure OpenAI retornou erro:", res.status, res.statusText);
            return null;
        }

        const json = await res.json();
        const content = json?.choices?.[0]?.message?.content;
        if (!content) {
            console.warn("Resposta da Azure sem conteúdo válido:", json);
            return null;
        }

        const parsed = tentarExtrairJsonDoTexto(content);
        if (!parsed) {
            console.warn("Não foi possível parsear JSON da resposta da Azure. Conteúdo recebido:", content);
            return null;
        }

        const resultado = {
            nome: typeof parsed.nome === "string" ? parsed.nome.trim() : (parsed.name || parsed.titulo || parsed.title || ""),
            classe: typeof parsed.classe === "string" ? parsed.classe.trim() : (parsed.clazz || ""),
            horas: typeof parsed.horas === "number" ? parsed.horas : parseFloat(parsed.horas) || undefined,
            prioridade: typeof parsed.prioridade === "string" ? parsed.prioridade.trim() : (parsed.prio || "")
        };

        return resultado;
    } catch (err) {
        if (err.name === "AbortError") {
            console.warn("Chamada ao Azure abortada por timeout.");
        } else {
            console.warn("Erro ao chamar Azure OpenAI:", err);
        }
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const textareaPrompt = document.querySelector(".input-prompt");
    const botaoEnviarPrompt = document.getElementById("btn-enviar-ia");

    const inputNome = document.querySelector("#nome input.input-formulario");
    const selectClasse = document.querySelector("#classe select.input-formulario");
    const inputHoras = document.querySelector("#horas input.input-formulario");
    const selectPrioridade = document.querySelector("#prioridade select.input-formulario");

    function preencherFormularioInicial(dados) {
        inputNome.value = dados.nome;
        selectClasse.value = dados.classe;
        inputHoras.value = dados.horas;
        selectPrioridade.value = dados.prioridade;

        const campos = [
            { elemento: inputNome, label: "Nome" },
            { elemento: selectClasse, label: "Classe" },
            { elemento: inputHoras, label: "Horas" },
            { elemento: selectPrioridade, label: "Prioridade" },
        ];

        campos.forEach((campo, index) => {
            setTimeout(() => {
                campo.elemento.style.transition = "all 0.3s ease";
                campo.elemento.style.backgroundColor = "#c8e6c9";
                campo.elemento.style.transform = "scale(1.02)";

                setTimeout(() => {
                    campo.elemento.style.backgroundColor = "#e8f5e9";
                    campo.elemento.style.transform = "scale(1)";

                    setTimeout(() => {
                        campo.elemento.style.backgroundColor = "";
                    }, 1500);
                }, 300);
            }, index * 100);
        });

        if (botaoEnviarPrompt) {
            botaoEnviarPrompt.innerHTML = '<i class="fas fa-plus"></i> Adicionar Atividade';
            botaoEnviarPrompt.classList.remove("modo-edicao");
        }

        mostrarMsgMessage("✅ Formulário preenchido pela IA! Revise e clique em 'Adicionar Atividade'.", "success");
    }

    botaoEnviarPrompt.addEventListener("click", async (e) => {
        e.preventDefault();
        await processarPrompt();
    });

    async function processarPrompt() {
        const promptText = textareaPrompt.value.trim();

        if (!promptText) {
            mostrarMsgMessage("Por favor, descreva sua atividade.", "error");
            return;
        }

        botaoEnviarPrompt.disabled = true;
        const iconOriginal = botaoEnviarPrompt.innerHTML;
        botaoEnviarPrompt.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            mostrarMsgMessage("🧠 Interpretando sua atividade (IA)...", "info");

            let dadosExtraidos = null;
            let usadoAzure = false;

            const azureResposta = await interpretarComAzure(promptText);
            if (azureResposta && (azureResposta.nome || azureResposta.classe || azureResposta.horas || azureResposta.prioridade)) {
                dadosExtraidos = validarDados({
                    nome: azureResposta.nome || "",
                    classe: azureResposta.classe || "",
                    horas: azureResposta.horas || 1,
                    prioridade: azureResposta.prioridade || "Média"
                });
                usadoAzure = true;
            }

            if (!dadosExtraidos) {
                mostrarMsgMessage("⚠️ IA indisponível ou resposta inválida. Utilizando análise local (fallback).", "info");
                dadosExtraidos = extrairDadosLocal(promptText);
            } else {
                mostrarMsgMessage("✅ Atividade interpretada pela IA do Azure.", "success");
            }

            if (!dadosExtraidos) {
                throw new Error("Não foi possível processar o prompt");
            }

            preencherFormularioInicial(dadosExtraidos);

            textareaPrompt.value = "";

            inputNome.focus();

            document.querySelector(".secao-formulario").scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        } catch (error) {
            console.error(error);
            mostrarMsgMessage("Não foi possível processar a atividade.", "error");
        } finally {
            botaoEnviarPrompt.disabled = false;
            botaoEnviarPrompt.innerHTML = iconOriginal;
        }
    }

    function extrairDadosLocal(prompt) {
        const promptLower = prompt.toLowerCase();
        const promptOriginal = prompt;

        let horas = 1;
        let horasEncontrada = false;

        const regexHorasPatterns = [
            { regex: /(\d+(?:[.,]\d+)?)\s*(?:horas?|hrs?|h)\b/i, desc: "X horas/h" },
            { regex: /(?:durante|por)\s+(\d+(?:[.,]\d+)?)\s*(?:horas?|h)?/i, desc: "durante/por X" },
            { regex: /(?:fiz|fui|passei|gastei|levei|demorei)\s+(\d+(?:[.,]\d+)?)\s*(?:horas?|h)?/i, desc: "verbo + X" },
            { regex: /(?:trabalhei|estudei|dormi|treinei|malhei|corri|joguei|assisti)\s+(\d+(?:[.,]\d+)?)\s*(?:horas?|h)?/i, desc: "atividade + X" },
            { regex: /(\d+(?:[.,]\d+)?)\s+de\s+(?:tempo|duração|duracao)/i, desc: "X de tempo" },
            { regex: /foram\s+(\d+(?:[.,]\d+)?)\s*(?:horas?|h)?/i, desc: "foram X" },
            { regex: /\b(\d+(?:[.,]\d+)?)\s*(?=\s*$)/i, desc: "apenas número final" },
        ];

        for (const pattern of regexHorasPatterns) {
            const match = promptOriginal.match(pattern.regex);
            if (match) {
                let valorHoras = parseFloat(match[1].replace(",", "."));

                if (valorHoras >= 0.1 && valorHoras <= 24) {
                    horas = valorHoras;
                    horasEncontrada = true;
                    break;
                } else if (valorHoras > 24) {
                    horas = 24;
                    horasEncontrada = true;
                    break;
                }
            }
        }

        let classe = "";
        const palavrasChaveClasses = {
            Trabalho: {
                palavras: [
                    "trabalh", "job", "serviço", "servico", "escritório", "escritorio",
                    "empresa", "corporativo", "profissional", "ocupação", "ocupacao",
                    "reunião", "reuniao", "meeting", "call", "video chamada", "videochamada",
                    "apresentação", "apresentacao", "sprint", "daily", "standup",
                    "projeto", "tarefa", "task", "demanda", "atividade", "entrega",
                    "documento", "relatório", "relatorio", "report", "planilha",
                    "excel", "slides", "powerpoint",
                    "email", "e-mail", "mensagem", "atendimento", "suporte", "chamado",
                    "ticket", "issue", "bug",
                    "cliente", "venda", "negociação", "negociacao", "contrato",
                    "proposta", "orçamento", "orcamento", "cotação", "cotacao",
                    "código", "codigo", "programação", "programacao", "desenvolv",
                    "codei", "programei", "implementei", "corrigi", "deploy",
                    "git", "github", "commit", "pull request", "code review",
                    "jira", "trello", "asana", "slack", "teams", "zoom",
                    "notion", "confluence",
                    "deadline", "prazo", "urgente", "board", "backlog",
                    "home office", "remoto", "presencial", "híbrido", "hibrido",
                ],
                peso: 1.5
            },

            Estudos: {
                palavras: [
                    "estud", "aula", "curso", "aprend", "leitura", "ler", "li",
                    "revisei", "revisao", "revisão", "pratiquei", "pratica", "prática",
                    "faculdade", "universidade", "escola", "colégio", "colegio",
                    "ead", "online", "presencial",
                    "prova", "exame", "teste", "avaliação", "avaliacao", "simulado",
                    "vestibular", "enem", "concurso",
                    "lição", "licao", "exercício", "exercicio", "questão", "questao",
                    "livro", "apostila", "resumo", "fichamento", "anotação", "anotacao",
                    "artigo", "paper", "tcc", "monografia", "dissertação", "dissertacao",
                    "videoaula", "vídeo aula", "tutorial", "documentação", "documentacao",
                    "udemy", "coursera", "alura", "youtube",
                    "matemática", "matematica", "cálculo", "calculo", "álgebra", "algebra",
                    "geometria", "trigonometria", "estatística", "estatistica",
                    "física", "fisica", "química", "quimica",
                    "história", "historia", "geografia", "filosofia", "sociologia",
                    "português", "portugues", "literatura", "redação", "redacao",
                    "inglês", "ingles", "espanhol", "francês", "frances", "alemão", "alemao",
                    "programação", "programacao", "algoritmo", "estrutura de dados",
                    "banco de dados", "web", "mobile",
                    "matéria", "materia", "conteúdo", "conteudo", "tópico", "topico",
                    "capítulo", "capitulo", "módulo", "modulo", "unidade",
                ],
                peso: 1.6
            },

            "Atividade Física": {
                palavras: [
                    "academia", "gym", "ginásio", "ginasio", "quadra", "piscina",
                    "parque", "praça", "praca", "rua", "praia", "trilha",
                    "exercício", "exercicio", "treino", "malhar", "malhei",
                    "treinei", "praticar", "pratiquei",
                    "musculação", "musculacao", "peso", "carga", "supino", "agachamento",
                    "leg press", "rosca", "flexão", "flexao", "barra",
                    "perna", "pernas", "braço", "bracos", "costas", "peito",
                    "ombro", "ombros", "abdômen", "abdomen", "glúteo", "gluteo",
                    "cardio", "aeróbico", "aerobico", "esteira", "elíptico", "eliptico",
                    "bicicleta", "bike", "spinning", "corrida", "correr", "corri",
                    "caminh", "caminhei", "cooper",
                    "futebol", "futsal", "basquete", "vôlei", "volei", "handebol",
                    "beachtennis", "beach", "tênis", "tenis",
                    "natação", "natacao", "nadar", "nadei", "lutar", "lutei",
                    "boxe", "muay thai", "jiu jitsu", "judô", "judo", "karatê", "karate",
                    "yoga", "pilates", "crossfit", "funcional", "hiit", "alongamento",
                    "stretching", "mobilidade", "flexibilidade",
                    "pedal", "pedalei", "ciclismo", "bike", "speed", "mountain bike",
                    "personal", "instrutor", "professor", "aula", "série", "serie",
                    "repetição", "repeticao", "rep", "reps", "set", "aquecimento",
                    "alongar", "descanso", "intervalo",
                ],
                peso: 1.8
            },

            Lazer: {
                palavras: [
                    "filme", "cinema", "série", "serie", "episódio", "episodio",
                    "temporada", "netflix", "prime", "disney", "hbo", "max",
                    "star+", "paramount", "globoplay", "streaming",
                    "assisti", "assistir", "assistindo", "vi", "ver", "vendo",
                    "novela", "desenho", "anime", "documentário", "documentario",
                    "jogo", "joguei", "jogando", "game", "gamer", "gameplay",
                    "playstation", "ps4", "ps5", "xbox", "nintendo", "switch",
                    "steam", "epic", "pc gaming",
                    "valorant", "lol", "league", "fortnite", "minecraft",
                    "fifa", "pes", "cod", "cs", "dota", "free fire",
                    "mobile legends", "among us", "fall guys",
                    "instagram", "insta", "tiktok", "youtube", "facebook", "face",
                    "twitter", "reddit", "whatsapp", "telegram", "discord",
                    "twitch", "stream", "navegando", "scrolling", "feed",
                    "passear", "passeio", "sair", "saí", "saindo", "rolê", "role",
                    "festa", "balada", "bar", "boteco", "pub", "restaurante",
                    "jantar", "almoço", "almoco", "lanche", "café", "cafe",
                    "shopping", "compras", "cinema", "teatro", "show", "concert",
                    "amigos", "amigo", "amiga", "namorada", "namorado", "crush",
                    "família", "familia", "pai", "mãe", "mae", "irmão", "irmao",
                    "primo", "tio", "avó", "avo", "visita", "encontro",
                    "diversão", "diversao", "hobby", "relaxar", "relaxei", "descontrair",
                    "violão", "violao", "guitarra", "teclado", "música", "musica",
                    "tocar", "cantar", "desenhar", "pintar", "arte", "artesanato",
                    "fotografia", "foto", "vídeo", "video",
                    "mangá", "manga", "quadrinho", "hq", "graphic novel",
                    "romance", "fantasia", "ficção", "ficcao",
                    "curti", "aproveitei", "diverti", "diversão", "diversao",
                    "descansando", "ócio", "ocio", "nada", "vadiando",
                ],
                peso: 1.3
            },

            Sono: {
                palavras: [
                    "dormi", "dormindo", "dormir", "cochilei", "cochilar",
                    "descansando", "descansei", "repousei", "adormeci",
                    "sono", "descanso", "cochilo", "soneca", "repouso",
                    "dormida", "noite",
                    "cama", "colchão", "colchao", "travesseiro", "lençol", "lencol",
                    "quarto", "tirei", "peguei no", "fui pra",
                    "cansado", "cansada", "exausto", "exausta", "preciso",
                    "recuperar", "descansar",
                    "madrugada", "manhã", "manha", "tarde", "noite",
                ],
                peso: 2.0
            },
        };

        let melhorPontuacao = 0;
        let pontuacoes = {};

        for (const [nomeClasse, config] of Object.entries(palavrasChaveClasses)) {
            let pontuacao = 0;
            let palavrasEncontradas = [];

            for (const palavra of config.palavras) {
                if (promptLower.includes(palavra)) {
                    const pontos = palavra.length * config.peso;
                    pontuacao += pontos;
                    palavrasEncontradas.push({ palavra, pontos: pontos.toFixed(1) });
                }
            }

            pontuacoes[nomeClasse] = {
                pontos: pontuacao,
                palavras: palavrasEncontradas
            };

            if (pontuacao > melhorPontuacao) {
                melhorPontuacao = pontuacao;
                classe = nomeClasse;
            }
        }

        if (!classe || melhorPontuacao === 0) {
            if (promptLower.match(/\b(fiz|fui|estava|tava|passei tempo)\b/)) {
                classe = "Lazer";
            } else if (promptLower.match(/\b(preciso|tenho que|devo|vou|preciso fazer)\b/)) {
                classe = "Trabalho";
            } else {
                classe = "Trabalho";
            }
        }

        let prioridade = "Média";
        const indicadoresPrioridade = {
            Alta: [
                "alta", "urgente", "importante", "prioridade alta", "super urgente",
                "muito urgente", "crítico", "critico", "emergência", "emergencia",
                "imediato", "agora", "hoje mesmo", "já", "ja", "asap",
                "o quanto antes", "logo", "pra ontem", "rapidão", "rapidao",
                "prazo curto", "deadline", "prazo apertado",
                "essencial", "fundamental", "vital", "crucial",
                "imprescindível", "imprescindivel", "necessário", "necessario",
                "obrigatório", "obrigatorio", "mandatório", "mandatorio",
            ],
            Baixa: [
                "baixa", "prioridade baixa", "não urgente", "nao urgente",
                "tranquilo", "tranquila", "suave", "leve",
                "pode esperar", "quando der", "quando puder", "sem pressa",
                "calma", "futuramente", "eventualmente", "talvez",
                "depois", "mais tarde", "um dia", "algum dia",
                "se possível", "se possivel", "se der", "opcional",
                "secundário", "secundario", "complementar",
            ],
        };

        let prioridadeScore = { Alta: 0, Baixa: 0 };
        let indicadoresEncontrados = { Alta: [], Baixa: [] };

        for (const [nivel, indicadores] of Object.entries(indicadoresPrioridade)) {
            for (const indicador of indicadores) {
                if (promptLower.includes(indicador)) {
                    const pontos = indicador.length * 2;
                    prioridadeScore[nivel] += pontos;
                    indicadoresEncontrados[nivel].push({ indicador, pontos });
                }
            }
        }

        if (prioridadeScore.Alta > prioridadeScore.Baixa && prioridadeScore.Alta > 0) {
            prioridade = "Alta";
        } else if (prioridadeScore.Baixa > 0) {
            prioridade = "Baixa";
        } else {
            prioridade = "Média";
        }

        let nomeAtividade = promptOriginal;

        for (const pattern of regexHorasPatterns) {
            nomeAtividade = nomeAtividade.replace(pattern.regex, "");
        }
        nomeAtividade = nomeAtividade
            .replace(/\b(?:durante|por|cerca de|aproximadamente|mais ou menos)\s*$/gi, "")
            .replace(/^\s*(?:durante|por|cerca de)\s+/gi, "");

        nomeAtividade = nomeAtividade.replace(/\b(?:porque|pq|pois|por causa de|por causa|por conta de|já que|ja que|visto que|dado que|por que|porquê)\b[\s\S]*$/gi, "");
        nomeAtividade = nomeAtividade.replace(/\bque\s+(?:é\s+)?(?:bom|ótimo|otimo|legal|bacana|massa|top|show|incrível|incrivel|ótima|otima)\b[\s\S]*$/gi, "");
        nomeAtividade = nomeAtividade.replace(/\bpara\s+(?:isso|melhorar|ajudar|treinar|estudar|praticar)\b[\s\S]*$/gi, "");

        const todosIndicadores = [...indicadoresPrioridade.Alta, ...indicadoresPrioridade.Baixa];
        for (const indicador of todosIndicadores) {
            const regex = new RegExp(`\\b${indicador.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
            nomeAtividade = nomeAtividade.replace(regex, "");
        }
        nomeAtividade = nomeAtividade
            .replace(/\b(?:prioridade|priority)\b/gi, "")
            .replace(/\b(?:com|de|é|e)\s+prioridade\s*/gi, "")
            .replace(/\b(?:muito|super|bastante|bem|pouco|meio|demais|extremamente)\s*$/gi, "")
            .replace(/^\s*(?:muito|super|bastante|bem|pouco|meio|demais|extremamente)\s+/gi, "")
            .replace(/\s+(?:muito|super|bastante|bem|pouco|meio|demais|extremamente)\s+/gi, " ");

        nomeAtividade = nomeAtividade
            .replace(/\b(?:hoje|ontem|amanhã|amanha|agora|já|logo|depois|antes|antigamente|atualmente)\b/gi, "")
            .replace(/\b(?:pela\s+)?(?:de\s+)?(?:da\s+)?(?:manhã|manha|tarde|noite|madrugada|dia)\b/gi, "")
            .replace(/\b(?:segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)(?:\s*feira)?\b/gi, "")
            .replace(/\b(?:semana|mês|mes|ano)\s+(?:passada|passado|que vem|atual)\b/gi, "")
            .replace(/\b(?:ontem|hoje)\s+(?:à|a)\s+(?:noite|tarde|manhã|manha)\b/gi, "");

        nomeAtividade = nomeAtividade
            .replace(/^\s*(?:fiz|fui|estava|tava|estou|to|tô|vou|irei|farei|preciso|devo|tenho)\s+/gi, "")
            .replace(/^\s*(?:tenho que|preciso fazer|vou fazer|quero fazer|devo fazer)\s+/gi, "")
            .replace(/^\s*(?:trabalhei|estudei|dormi|treinei|malhei|assisti|joguei|passei|gastei|programei|codei|desenvolvi)\s+(?:tempo\s+)?(?:em|no|na|com|sobre|para|pro|pra|por|durante|pela|pelo)?\s*/gi, "");

        nomeAtividade = nomeAtividade
            .replace(/^\s*(?:durante|por|no|na|nos|nas|do|da|dos|das|em|de|com|para|pra|pro|sobre|ao|à|aos|às|pelo|pela)\s+/gi, "")
            .replace(/\s+(?:durante|por|no|na|em|de|com|para|pra|pro|e|sobre|pelo|pela)\s*$/gi, "")
            .replace(/\s+(?:durante|por|pela|pelo)\s+/gi, " ")
            .replace(/\s+de\s+(?=[a-z])/gi, " ")
            .replace(/\s+(?:o|a|os|as|um|uma)\s+/gi, " ")
            .replace(/\s+(?:em|no|na)\s+(?:o|a)\s+/gi, " ");

        nomeAtividade = nomeAtividade
            .replace(/\b(?:atividade|tarefa|coisa|negócio|negocio|troço|troco)\s+(?:de|sobre|em|no|na)\s+/gi, "")
            .replace(/\b(?:fazer|fazer o|fazer a|fazendo|realizei|realizando)\s+/gi, "")
            .replace(/\b(?:em|usando|com|via|através|atraves)\s+(?=python|java|javascript|php|ruby|c\+\+|react|vue|angular)/gi, "");

        nomeAtividade = nomeAtividade
            .replace(/[@#$%&*]/g, "")
            .replace(/\s*,\s*(?:e|com|de|para|sobre|durante|por|pela|porque|pois)\s*/gi, " ")
            .replace(/\s*,\s*$/g, "")
            .replace(/^\s*,\s*/g, "");

        nomeAtividade = nomeAtividade
            .replace(/\s+/g, " ")
            .replace(/\s+([,;:.!?])/g, "$1")
            .trim()
            .replace(/^[,;:.!?\-\s]+|[,;:.!?\-\s]+$/g, "");

        const palavrasArray = nomeAtividade.split(" ");
        nomeAtividade = palavrasArray.filter((palavra, index) => {
            if (index === 0) return true;
            return palavra.toLowerCase() !== palavrasArray[index - 1].toLowerCase();
        }).join(" ");

        const palavrasProibidas = [
            "durante", "por", "pela", "pelo", "em", "de", "com", "para", "no", "na",
            "prioridade", "priority", "hoje", "ontem", "amanhã", "amanha",
            "manhã", "manha", "tarde", "noite", "madrugada",
            "muito", "super", "bastante", "bem", "pouco", "meio", "demais", "extremamente",
            "porque", "pq", "pois", "já que", "ja que", "visto que", "dado que",
            "que", "é", "e", "bom", "ótimo", "otimo", "legal", "bacana", "massa", "top", "show"
        ];

        for (const palavra of palavrasProibidas) {
            const regexInicio = new RegExp(`^${palavra}\\s+`, "gi");
            nomeAtividade = nomeAtividade.replace(regexInicio, "");
            const regexFinal = new RegExp(`\\s+${palavra}$`, "gi");
            nomeAtividade = nomeAtividade.replace(regexFinal, "");
            const regexIsolado = new RegExp(`^${palavra}$`, "gi");
            if (regexIsolado.test(nomeAtividade)) {
                nomeAtividade = "";
            }
        }

        nomeAtividade = nomeAtividade.trim();

        if (nomeAtividade.length > 0) {
            const palavras = nomeAtividade.split(" ");
            const tecnologias = {
                'python': 'Python', 'javascript': 'JavaScript', 'typescript': 'TypeScript',
                'java': 'Java', 'php': 'PHP', 'ruby': 'Ruby', 'html': 'HTML', 'css': 'CSS',
                'sass': 'SASS', 'react': 'React', 'vue': 'Vue', 'angular': 'Angular',
                'node': 'Node', 'nodejs': 'Node.js', 'mysql': 'MySQL', 'mongodb': 'MongoDB',
                'postgresql': 'PostgreSQL', 'git': 'Git', 'github': 'GitHub',
                'gitlab': 'GitLab', 'docker': 'Docker', 'kubernetes': 'Kubernetes',
                'aws': 'AWS', 'azure': 'Azure', 'api': 'API', 'rest': 'REST', 'graphql': 'GraphQL',
                'netflix': 'Netflix',
            };

            nomeAtividade = palavras
                .map((palavra, index) => {
                    if (!palavra) return "";
                    if (palavra.length <= 5 && palavra === palavra.toUpperCase() && palavra.match(/^[A-Z]+$/)) {
                        return palavra;
                    }
                    if (tecnologias[palavra.toLowerCase()]) {
                        return tecnologias[palavra.toLowerCase()];
                    }
                    if (index === 0) {
                        return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
                    }
                    if (/^(de|da|do|em|para|com|por|sobre|a|o|as|os)$/i.test(palavra)) {
                        return palavra.toLowerCase();
                    }
                    return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
                })
                .filter(p => p)
                .join(" ");
        }

        if (nomeAtividade.length > 100) {
            nomeAtividade = nomeAtividade.substring(0, 97) + "...";
        }

        if (nomeAtividade.length < 3) {
            const nomesInteligentesPorClasse = {
                Trabalho: [
                    "Tarefa Profissional",
                    "Atividade de Trabalho",
                    "Demanda",
                    "Projeto",
                    "Reunião",
                    "Desenvolvimento",
                ],
                Estudos: [
                    "Sessão de Estudos",
                    "Atividade Acadêmica",
                    "Revisão",
                    "Leitura",
                    "Pesquisa",
                    "Aprendizado",
                ],
                "Atividade Física": [
                    "Treino",
                    "Exercício Físico",
                    "Prática Esportiva",
                    "Academia",
                    "Atividade Física",
                ],
                Lazer: [
                    "Momento de Lazer",
                    "Entretenimento",
                    "Diversão",
                    "Descontração",
                    "Atividade Recreativa",
                ],
                Sono: [
                    "Descanso",
                    "Sono",
                    "Repouso",
                    "Recuperação",
                    "Período de Sono",
                ],
            };

            const opcoes = nomesInteligentesPorClasse[classe] || ["Atividade"];
            nomeAtividade = opcoes[Math.floor(Math.random() * opcoes.length)];
        }

        const resultado = {
            nome: nomeAtividade,
            classe: classe,
            horas: horas,
            prioridade: prioridade,
        };

        return validarDados(resultado);
    }

    function validarDados(dados) {
        const classesValidas = [
            "Trabalho",
            "Estudos",
            "Atividade Física",
            "Lazer",
            "Sono",
        ];
        const prioridadesValidas = ["Baixa", "Média", "Alta"];

        return {
            nome: dados.nome || "Atividade",
            classe: classesValidas.includes(dados.classe) ? dados.classe : "Trabalho",
            horas: Math.max(0.1, parseFloat(dados.horas) || 1),
            prioridade: prioridadesValidas.includes(dados.prioridade)
                ? dados.prioridade
                : "Média",
        };
    }

    if (textareaPrompt) {
        textareaPrompt.addEventListener("keydown", (e) => {
            if (
                (e.key === "Enter" && e.ctrlKey) ||
                (e.key === "Enter" && !e.shiftKey)
            ) {
                e.preventDefault();
                botaoEnviarPrompt.click();
            }
        });

        const exemplos = [
            "Trabalhei 5 horas no projeto do cliente, super urgente",
            "Estudei 3 horas para a prova de matemática",
            "Fiz 2 horas de academia pela manhã",
            "Assisti série no Netflix por 2 horas",
            "Dormi 8 horas ontem à noite",
            "Corri 1 hora no parque",
            "Joguei valorant durante 3 horas",
            "Programei em Python por 4 horas",
            "Revisei cálculo para o exame durante 2 horas",
            "Malhei na academia por 1.5 horas",
        ];

        let exemploIndex = 0;
        setInterval(() => {
            if (textareaPrompt.value === "") {
                exemploIndex = (exemploIndex + 1) % exemplos.length;
                textareaPrompt.placeholder = exemplos[exemploIndex];
            }
        }, 5000);
    }
});

const style = document.createElement("style");
style.textContent = `
    #notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
    }

    .notification {
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        margin-bottom: 10px;
        opacity: 0;
        transform: translateX(100%);
        transition: opacity 0.3s ease, transform 0.3s ease;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        white-space: pre-line;
        max-width: 350px;
    }

    .notification.show {
        opacity: 1;
        transform: translateX(0);
    }

    .notification.error {
        background-color: #dc3545;
    }

    .notification.success {
        background-color: #28a745;
    }

    .notification.info {
        background-color: #2196f3;
    }

    .input-prompt:focus {
        outline: none;
        border-color: #2196f3 !important;
        box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1) !important;
    }
`;
document.head.appendChild(style);
