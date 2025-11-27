const API_BASE_URL = "http://localhost:6789";
const LOGIN_PAGE = "/modulos/login/login.html";

const CLASSE_NOMES = {
    1: "Trabalho",
    2: "Estudos",
    3: "Atividade Física",
    4: "Lazer",
    5: "Sono",
};

const METAS_POR_CLASSE = {
    Trabalho: 6,
    Estudos: 4,
    "Atividade Física": 2,
    Lazer: 4,
    Sono: 8,
};

const CORES_POR_CLASSE = {
    Trabalho: "#3b82f6",
    Estudos: "#0acf55ff",
    "Atividade Física": "#f59e0b",
    Lazer: "#ff3e24ff",
    Sono: "#41f2ffff",
};

let usuarioCorrente = null;
let chartRosca = null;
let chartComparativo = null;
let chartLinha = null;
let semanaAtual = 0;
let todasAtividades = [];

function parseDataSegura(dataHora) {
    if (!dataHora) return new Date(0);

    if (dataHora.includes("T")) {
        return new Date(dataHora);
    }

    const dataCorrigida = dataHora.replace(" ", "T");
    return new Date(dataCorrigida);
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!verificarAutenticacao()) return;
    exibirSaudacao();
    configurarEventos();
    await carregarDashboard();
});

function calcularDadosRelatorio(atividades, inicio, fim) {
    const tempoTotal = atividades.reduce(
        (total, a) => total + (a.horasGastas || 0),
        0
    );

    const porCategoria = {};
    atividades.forEach((a) => {
        const categoria = CLASSE_NOMES[a.classe] || "Outros";
        porCategoria[categoria] =
            (porCategoria[categoria] || 0) + (a.horasGastas || 0);
    });

    const categoriaDestaque = Object.keys(porCategoria).reduce(
        (a, b) => (porCategoria[a] > porCategoria[b] ? a : b),
        "Nenhuma"
    );

    const { inicio: inicioAnterior, fim: fimAnterior } =
        calcularInicioFimSemana(-1);
    const atividadesAnterior = filtrarAtividadesPorPeriodo(
        todasAtividades,
        inicioAnterior,
        fimAnterior
    );
    const tempoAnterior = atividadesAnterior.reduce(
        (total, a) => total + (a.horasGastas || 0),
        0
    );

    let comparacao = "Sem dados da semana anterior";
    if (tempoAnterior > 0) {
        const diferenca = tempoTotal - tempoAnterior;
        const percentual = ((diferenca / tempoAnterior) * 100).toFixed(1);
        comparacao =
            diferenca > 0
                ? `+${percentual}% em relação à semana anterior`
                : `${percentual}% em relação à semana anterior`;
    }

    const porDia = {};
    atividades.forEach((a) => {
        const data = parseDataSegura(a.dataHora).toLocaleDateString("pt-BR");
        porDia[data] = (porDia[data] || 0) + (a.horasGastas || 0);
    });
    const melhorDia =
        Object.keys(porDia).length > 0
            ? Object.keys(porDia).reduce((a, b) => (porDia[a] > porDia[b] ? a : b))
            : "Nenhum";

    const periodoFormatado = `${inicio.toLocaleDateString(
        "pt-BR"
    )} - ${fim.toLocaleDateString("pt-BR")}`;

    return {
        periodo: periodoFormatado,
        tempoTotal: tempoTotal,
        comparacao: comparacao,
        melhorDia: melhorDia,
        categoriaDestaque: categoriaDestaque,
        insight: `Continue assim! Você está mantendo uma rotina consistente.`,
    };
}



function verificarAutenticacao() {
    const usuarioJSON = sessionStorage.getItem("usuarioCorrente");

    if (!usuarioJSON) {
        console.error("❌ Usuário não autenticado");
        window.location.href = LOGIN_PAGE;
        return false;
    }

    usuarioCorrente = JSON.parse(usuarioJSON);
    return true;
}

function exibirSaudacao() {
    const subtitulo = document.getElementById("texto-subtitulo");
    if (subtitulo && usuarioCorrente) {
        const nome = usuarioCorrente.nome || "usuário";
        subtitulo.textContent = `${nome}, veja sua evolução semanal`;
    }
}

function configurarEventos() {
    const btnAnterior = document.getElementById("btn-semana-anterior");
    const btnProxima = document.getElementById("btn-semana-proxima");

    if (btnAnterior) {
        btnAnterior.addEventListener("click", () => {
            semanaAtual--;
            atualizarDashboardSemana();
        });
    }

    if (btnProxima) {
        btnProxima.addEventListener("click", () => {
            if (semanaAtual < 0) {
                semanaAtual++;
                atualizarDashboardSemana();
            }
        });
    }
}

async function carregarDashboard() {
    try {
        const url = `${API_BASE_URL}/atividades?usuarioId=${usuarioCorrente.id}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        todasAtividades = await response.json();

        if (!todasAtividades || todasAtividades.length === 0) {
            console.warn("⚠️ Nenhuma atividade encontrada");
            exibirMensagemSemDados();
            return;
        }

        atualizarDashboardSemana();
    } catch (error) {
        console.error("❌ Erro:", error);
        alert(`Erro ao carregar dados: ${error.message}`);
    }
}

function atualizarDashboardSemana() {
    const { inicio, fim } = calcularInicioFimSemana(semanaAtual);
    atualizarTextoPeriodo(inicio, fim);
    atualizarBotoesNavegacao();

    const atividadesSemana = filtrarAtividadesPorPeriodo(
        todasAtividades,
        inicio,
        fim
    );

    const { inicio: inicioAnterior, fim: fimAnterior } = calcularInicioFimSemana(
        semanaAtual - 1
    );
    const atividadesSemanaAnterior = filtrarAtividadesPorPeriodo(
        todasAtividades,
        inicioAnterior,
        fimAnterior
    );

    atualizarComparacaoSemanal(atividadesSemana, atividadesSemanaAnterior);
    atualizarEstatisticasSemana(atividadesSemana);
    atualizarProgressoMetas(atividadesSemana);
    atualizarGraficoRosca(atividadesSemana);
    atualizarGraficoComparativo(atividadesSemana, atividadesSemanaAnterior);

    const ultimas8Semanas = calcularHorasPorSemana(todasAtividades, 8);
    atualizarGraficoLinha(ultimas8Semanas);
}

function calcularInicioFimSemana(offsetSemanas) {
    const agora = new Date();
    const diaSemana = agora.getDay();

    const diasAteProximoSabado = diaSemana === 6 ? 0 : 6 - diaSemana;

    const sabado = new Date(agora);
    sabado.setDate(agora.getDate() + diasAteProximoSabado + offsetSemanas * 7);
    sabado.setHours(23, 59, 59, 999);

    const domingo = new Date(sabado);
    domingo.setDate(sabado.getDate() - 6);
    domingo.setHours(0, 0, 0, 0);

    return { inicio: domingo, fim: sabado };
}

function filtrarAtividadesPorPeriodo(atividades, inicio, fim) {
    return atividades.filter((a) => {
        const dataAtiv = parseDataSegura(a.dataHora);
        return dataAtiv >= inicio && dataAtiv <= fim;
    });
}

function atualizarTextoPeriodo(inicio, fim) {
    const textoPeriodo = document.getElementById("periodo-selecionado");
    if (!textoPeriodo) return;

    const opcoes = { day: "2-digit", month: "2-digit" };
    const dataInicio = inicio.toLocaleDateString("pt-BR", opcoes);
    const dataFim = fim.toLocaleDateString("pt-BR", opcoes);

    if (semanaAtual === 0) {
        textoPeriodo.textContent = `Semana Atual (${dataInicio} - ${dataFim})`;
    } else if (semanaAtual === -1) {
        textoPeriodo.textContent = `Semana Anterior (${dataInicio} - ${dataFim})`;
    } else {
        textoPeriodo.textContent = `${Math.abs(
            semanaAtual
        )} semana(s) atrás (${dataInicio} - ${dataFim})`;
    }
}

function atualizarBotoesNavegacao() {
    const btnProxima = document.getElementById("btn-semana-proxima");
    if (btnProxima) {
        btnProxima.disabled = semanaAtual >= 0;
    }
}

function exibirMensagemSemDados() {
    const kpiTempo = document.getElementById("kpi-tempo-total");
    if (kpiTempo) kpiTempo.textContent = "0.00 horas (cadastre atividades)";

    const kpiMetas = document.getElementById("kpi-metas-atingidas");
    if (kpiMetas) kpiMetas.textContent = "0/5 metas";

    const kpiComparacao = document.getElementById("kpi-comparacao");
    if (kpiComparacao) kpiComparacao.textContent = "Sem dados anteriores";
}

function calcularHorasPorClasse(atividades) {
    const horasPorClasse = {};
    Object.keys(METAS_POR_CLASSE).forEach((classe) => {
        horasPorClasse[classe] = 0;
    });

    atividades.forEach((a) => {
        const nomeClasse = CLASSE_NOMES[a.classe];
        if (horasPorClasse.hasOwnProperty(nomeClasse)) {
            horasPorClasse[nomeClasse] += a.horasGastas || 0;
        }
    });

    return horasPorClasse;
}

function atualizarComparacaoSemanal(
    atividadesSemana,
    atividadesSemanaAnterior
) {
    const tempoAtual = atividadesSemana.reduce(
        (sum, a) => sum + (a.horasGastas || 0),
        0
    );
    const tempoAnterior = atividadesSemanaAnterior.reduce(
        (sum, a) => sum + (a.horasGastas || 0),
        0
    );

    const totalSemanaAtual = document.getElementById("total-semana-atual");
    if (totalSemanaAtual) {
        totalSemanaAtual.textContent = `${tempoAtual.toFixed(1)}h`;
    }

    let diferencaPercentual = 0;
    if (tempoAnterior > 0) {
        diferencaPercentual = ((tempoAtual - tempoAnterior) / tempoAnterior) * 100;
    }

    const diferencaSemanal = document.getElementById("diferenca-semanal");
    if (diferencaSemanal) {
        const sinal = diferencaPercentual >= 0 ? "+" : "";
        diferencaSemanal.textContent = `${sinal}${diferencaPercentual.toFixed(1)}%`;
    }

    const totalSemanaAnterior = document.getElementById("total-semana-anterior");
    if (totalSemanaAnterior) {
        totalSemanaAnterior.textContent = `${tempoAnterior.toFixed(1)}h`;
    }
}

function atualizarEstatisticasSemana(atividadesSemana) {
    const horasPorDia = {};
    const diasSemana = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
    ];

    atividadesSemana.forEach((a) => {
        const data = parseDataSegura(a.dataHora);
        const dia = diasSemana[data.getDay()];
        horasPorDia[dia] = (horasPorDia[dia] || 0) + (a.horasGastas || 0);
    });

    const diasComHoras = Object.entries(horasPorDia);

    if (diasComHoras.length === 0) {
        document.getElementById("melhor-dia").textContent = "Sem dados";
        document.getElementById("pior-dia").textContent = "Sem dados";
        document.getElementById("media-diaria").textContent = "0.0h";
        return;
    }

    const melhorDia = diasComHoras.reduce((max, dia) =>
        dia[1] > max[1] ? dia : max
    );
    const piorDia = diasComHoras.reduce((min, dia) =>
        dia[1] < min[1] ? dia : min
    );

    const totalHoras = atividadesSemana.reduce(
        (sum, a) => sum + (a.horasGastas || 0),
        0
    );
    const mediaDiaria = totalHoras / 7;

    document.getElementById("melhor-dia").textContent = `${melhorDia[0]
        } (${melhorDia[1].toFixed(1)}h)`;
    document.getElementById("pior-dia").textContent = `${piorDia[0]
        } (${piorDia[1].toFixed(1)}h)`;
    document.getElementById("media-diaria").textContent = `${mediaDiaria.toFixed(
        1
    )}h`;
}

function atualizarProgressoMetas(atividadesSemana) {
    const horasPorClasse = calcularHorasPorClasse(atividadesSemana);

    const metasSemana = {};
    Object.keys(METAS_POR_CLASSE).forEach((classe) => {
        metasSemana[classe] = METAS_POR_CLASSE[classe] * 7;
    });

    let metasAtingidas = 0;
    const metasPorCategoria = {
        Trabalho: false,
        Estudos: false,
        "Atividade Física": false,
        Lazer: false,
        Sono: false,
    };

    Object.keys(metasSemana).forEach((classe) => {
        const meta = metasSemana[classe];
        const realizado = horasPorClasse[classe] || 0;
        if (realizado >= meta) {
            metasAtingidas++;
            metasPorCategoria[classe] = true;
        }
    });

    const percentual = (metasAtingidas / 5) * 100;
    document.getElementById("metas-atingidas-count").textContent = metasAtingidas;
    document.getElementById(
        "metas-percentual"
    ).textContent = `${percentual.toFixed(0)}%`;

    const progressFill = document.getElementById("metas-progress-fill");
    if (progressFill) {
        progressFill.style.width = `${percentual}%`;
    }

    document
        .getElementById("meta-trabalho")
        .classList.toggle("atingida", metasPorCategoria["Trabalho"]);
    document
        .getElementById("meta-estudos")
        .classList.toggle("atingida", metasPorCategoria["Estudos"]);
    document
        .getElementById("meta-atividade")
        .classList.toggle("atingida", metasPorCategoria["Atividade Física"]);
    document
        .getElementById("meta-lazer")
        .classList.toggle("atingida", metasPorCategoria["Lazer"]);
    document
        .getElementById("meta-sono")
        .classList.toggle("atingida", metasPorCategoria["Sono"]);
}

function atualizarGraficoComparativo(
    atividadesSemana,
    atividadesSemanaAnterior
) {
    const horasSemana = calcularHorasPorClasse(atividadesSemana);
    const horasSemanaAnterior = calcularHorasPorClasse(atividadesSemanaAnterior);

    const labels = Object.keys(METAS_POR_CLASSE);
    const dadosAtual = labels.map((classe) => horasSemana[classe] || 0);
    const dadosAnterior = labels.map(
        (classe) => horasSemanaAnterior[classe] || 0
    );

    const ctx = document.getElementById("canvas-comparativo");
    if (!ctx) return;

    if (chartComparativo) {
        chartComparativo.destroy();
    }

    chartComparativo = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Semana Atual",
                    data: dadosAtual,
                    backgroundColor: "#3b82f6",
                    borderRadius: 8,
                    borderWidth: 0,
                },
                {
                    label: "Semana Anterior",
                    data: dadosAnterior,
                    backgroundColor: "#9ca3af",
                    borderRadius: 8,
                    borderWidth: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        font: { size: 12, family: "Poppins" },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || "";
                            const value = context.parsed.y || 0;
                            return `${label}: ${value.toFixed(2)}h`;
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `${value}h`,
                    },
                },
            },
        },
    });
}

function calcularHorasPorSemana(atividades, numSemanas) {
    const hoje = new Date();
    const semanas = [];

    for (let i = numSemanas - 1; i >= 0; i--) {
        const fimSemana = new Date(hoje);
        fimSemana.setDate(hoje.getDate() - i * 7);
        fimSemana.setHours(23, 59, 59, 999);

        const inicioSemana = new Date(fimSemana);
        inicioSemana.setDate(fimSemana.getDate() - 6);
        inicioSemana.setHours(0, 0, 0, 0);

        const horasSemana = atividades
            .filter((a) => {
                const dataAtiv = parseDataSegura(a.dataHora);
                return dataAtiv >= inicioSemana && dataAtiv <= fimSemana;
            })
            .reduce((sum, a) => sum + (a.horasGastas || 0), 0);

        semanas.push({
            label: `S${numSemanas - i}`,
            horas: horasSemana,
        });
    }

    return semanas;
}

function atualizarGraficoLinha(semanas) {
    const labels = semanas.map((s) => s.label);
    const valores = semanas.map((s) => s.horas);

    const ctx = document.getElementById("canvas-linha");
    if (!ctx) return;

    if (chartLinha) {
        chartLinha.destroy();
    }

    chartLinha = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Horas Totais",
                    data: valores,
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        font: { size: 12, family: "Poppins" },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(2)}h`,
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `${value}h`,
                    },
                },
            },
        },
    });
}

function atualizarGraficoRosca(atividades) {
    const horasPorClasse = calcularHorasPorClasse(atividades);

    const labels = Object.keys(horasPorClasse);
    const valores = labels.map((classe) => horasPorClasse[classe]);
    const cores = labels.map((classe) => CORES_POR_CLASSE[classe]);

    const ctx = document.getElementById("canvas-rosca");
    if (!ctx) return;

    if (chartRosca) {
        chartRosca.destroy();
    }

    chartRosca = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [
                {
                    data: valores,
                    backgroundColor: cores,
                    borderWidth: 2,
                    borderColor: "#fff",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        padding: 15,
                        font: { size: 12, family: "Poppins" },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || "";
                            const value = context.parsed || 0;
                            return `${label}: ${value.toFixed(2)}h`;
                        },
                    },
                },
            },
        },
    });
}
