const API_BASE_URL = 'http://localhost:6789';
const LOGIN_PAGE = '/modulos/login/login.html';

const CLASSE_NOMES = {
    1: 'Trabalho',
    2: 'Estudos',
    3: 'Atividade Física',
    4: 'Lazer',
    5: 'Sono',
};

const CLASSE_CORES = {
    'Trabalho': 'trabalho',
    'Estudos': 'estudos',
    'Atividade Física': 'atividade-fisica',
    'Lazer': 'lazer',
    'Sono': 'sono',
};

const METAS_DIARIAS = {
    Trabalho: 6,
    Estudos: 4,
    'Atividade Física': 2,
    Lazer: 4,
    Sono: 8,
};

let usuarioCorrente = null;
let todasAtividades = [];
let diaOffset = 0;

document.addEventListener('DOMContentLoaded', async () => {
    if (!verificarAutenticacao()) return;

    exibirSaudacao();
    configurarEventos();
    await carregarDados();
});

function verificarAtividadesHoje() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const atividadesHoje = todasAtividades.filter(atividade => {
        const dataAtividade = new Date(atividade.dataHora);
        dataAtividade.setHours(0, 0, 0, 0);
        return dataAtividade.getTime() === hoje.getTime();
    });

    return atividadesHoje.length > 0;
}

function exibirAlertaSemAtividadesHoje() {
    const alertaDiv = document.getElementById('sem-atividades-hoje');
    const formulario = document.getElementById('formulario-monitoramento');

    if (alertaDiv && formulario) {
        alertaDiv.style.display = 'flex';
        formulario.style.display = 'none';
    }
}

function ocultarAlertaSemAtividadesHoje() {
    const alertaDiv = document.getElementById('sem-atividades-hoje');
    const formulario = document.getElementById('formulario-monitoramento');

    if (alertaDiv && formulario) {
        alertaDiv.style.display = 'none';
        formulario.style.display = 'block';
    }
}

async function carregarDados() {
    try {
        const response = await fetch(`${API_BASE_URL}/atividades?usuarioId=${usuarioCorrente.id}`);
        if (!response.ok) throw new Error('Erro ao carregar atividades');

        todasAtividades = await response.json();

        if (diaOffset === 0 && !verificarAtividadesHoje()) {
            exibirAlertaSemAtividadesHoje();
            return;
        }

        ocultarAlertaSemAtividadesHoje();
        atualizarInterfaceDia();
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
}

function verificarAutenticacao() {
    const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (!usuarioCorrenteJSON) {
        window.location.href = LOGIN_PAGE;
        return false;
    }

    usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    return true;
}

function exibirSaudacao() {
    const textoSubtitulo = document.getElementById('texto-subtitulo');
    if (textoSubtitulo && usuarioCorrente) {
        textoSubtitulo.textContent = `${usuarioCorrente.nome || 'usuário'}, veja o fluxo do seu dia`;
    }
}

function configurarEventos() {
    const btnAnterior = document.getElementById('btn-dia-anterior');
    const btnProximo = document.getElementById('btn-dia-proximo');
    const btnCalendario = document.getElementById('btn-calendario');
    const btnVoltar = document.getElementById('voltar');
    const btnAtualizar = document.getElementById('atualizar');

    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            diaOffset--;
            atualizarInterfaceDia();
        });
    }

    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            if (diaOffset < 0) {
                diaOffset++;
                atualizarInterfaceDia();
            }
        });
    }

    if (btnCalendario) {
        btnCalendario.addEventListener('click', () => {
            abrirModalCalendario();
        });
    }

    const fecharCalendario = document.getElementById('fechar-calendario');
    const mesAnterior = document.getElementById('mes-anterior');
    const mesProximo = document.getElementById('mes-proximo');
    const btnHoje = document.getElementById('btn-hoje');

    if (fecharCalendario) {
        fecharCalendario.addEventListener('click', fecharModalCalendario);
    }

    if (mesAnterior) {
        mesAnterior.addEventListener('click', () => navegarMes(-1));
    }

    if (mesProximo) {
        mesProximo.addEventListener('click', () => navegarMes(1));
    }

    if (btnHoje) {
        btnHoje.addEventListener('click', () => {
            diaOffset = 0;
            fecharModalCalendario();
            atualizarInterfaceDia();
        });
    }

    const modalCalendario = document.getElementById('modal-calendario');
    if (modalCalendario) {
        modalCalendario.addEventListener('click', (e) => {
            if (e.target === modalCalendario) {
                fecharModalCalendario();
            }
        });
    }

    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            window.location.href = '/dashboard.html';
        });
    }

    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', async (e) => {
            e.preventDefault();
            await carregarDadosComBotao(btnAtualizar);
        });
    }
}

let mesCalendarioAtual = new Date().getMonth();
let anoCalendarioAtual = new Date().getFullYear();

function abrirModalCalendario() {
    const modal = document.getElementById('modal-calendario');
    if (modal) {
        const dataSelecionada = calcularDataSelecionada();
        mesCalendarioAtual = dataSelecionada.getMonth();
        anoCalendarioAtual = dataSelecionada.getFullYear();

        renderizarCalendario();
        modal.style.display = 'flex';
    }
}

function fecharModalCalendario() {
    const modal = document.getElementById('modal-calendario');
    if (modal) {
        modal.style.display = 'none';
    }
}

function navegarMes(direcao) {
    mesCalendarioAtual += direcao;
    if (mesCalendarioAtual > 11) {
        mesCalendarioAtual = 0;
        anoCalendarioAtual++;
    } else if (mesCalendarioAtual < 0) {
        mesCalendarioAtual = 11;
        anoCalendarioAtual--;
    }
    renderizarCalendario();
}

function renderizarCalendario() {
    const mesAnoTexto = document.getElementById('mes-ano-atual');
    const calendarioGrid = document.getElementById('calendario-grid');

    if (!mesAnoTexto || !calendarioGrid) return;

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    mesAnoTexto.textContent = `${meses[mesCalendarioAtual]} ${anoCalendarioAtual}`;

    calendarioGrid.innerHTML = '';

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    diasSemana.forEach(dia => {
        const divDia = document.createElement('div');
        divDia.className = 'calendario-dia-semana';
        divDia.textContent = dia;
        calendarioGrid.appendChild(divDia);
    });

    const primeiroDia = new Date(anoCalendarioAtual, mesCalendarioAtual, 1);
    const ultimoDia = new Date(anoCalendarioAtual, mesCalendarioAtual + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataSelecionada = calcularDataSelecionada();
    dataSelecionada.setHours(0, 0, 0, 0);

    for (let i = 0; i < diaSemanaInicio; i++) {
        const divVazio = document.createElement('div');
        divVazio.className = 'calendario-dia vazio';
        calendarioGrid.appendChild(divVazio);
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataAtual = new Date(anoCalendarioAtual, mesCalendarioAtual, dia);
        dataAtual.setHours(0, 0, 0, 0);

        const divDia = document.createElement('div');
        divDia.className = 'calendario-dia';
        divDia.textContent = dia;

        if (dataAtual.getTime() === hoje.getTime()) {
            divDia.classList.add('hoje');
        }

        if (dataAtual.getTime() === dataSelecionada.getTime()) {
            divDia.classList.add('selecionado');
        }

        if (dataAtual > hoje) {
            divDia.classList.add('futuro');
        } else {
            divDia.addEventListener('click', () => {
                selecionarData(dataAtual);
            });
        }

        calendarioGrid.appendChild(divDia);
    }
}

function selecionarData(data) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataComparacao = new Date(data);
    dataComparacao.setHours(0, 0, 0, 0);

    const diferencaDias = Math.floor((dataComparacao - hoje) / (1000 * 60 * 60 * 24));
    diaOffset = diferencaDias;

    fecharModalCalendario();
    atualizarInterfaceDia();
}

async function carregarDadosComBotao(botao = null) {
    try {
        if (botao) botao.disabled = true;

        const response = await fetch(`${API_BASE_URL}/atividades?usuarioId=${usuarioCorrente.id}`);
        if (!response.ok) throw new Error('Erro ao carregar atividades.');

        todasAtividades = await response.json();

        if (diaOffset === 0 && !verificarAtividadesHoje()) {
            exibirAlertaSemAtividadesHoje();
            return;
        }

        ocultarAlertaSemAtividadesHoje();
        atualizarInterfaceDia();
    } catch (error) {
        console.error('❌ Erro ao carregar atividades:', error);
        alert('Erro ao carregar atividades. Tente novamente!');
    } finally {
        if (botao) botao.disabled = false;
    }
}

function atualizarInterfaceDia() {
    const dataSelecionada = calcularDataSelecionada();
    atualizarTextoData(dataSelecionada);
    atualizarBotoesNavegacao();

    const atividadesDia = filtrarAtividadesDia(dataSelecionada);

    construirTimeline(atividadesDia);
    atualizarResumo(atividadesDia);
    atualizarMetas(atividadesDia);
    atualizarInsightsDiarios(atividadesDia, dataSelecionada);
    gerarSugestoes(atividadesDia);
}

function calcularDataSelecionada() {
    const data = new Date();
    data.setDate(data.getDate() + diaOffset);
    data.setHours(0, 0, 0, 0);
    return data;
}

function filtrarAtividadesDia(data) {
    return todasAtividades.filter(a => {
        const dataAtiv = getInicioDia(new Date(a.dataHora));
        return dataAtiv.toDateString() === data.toDateString();
    });
}

function getInicioDia(data) {
    const local = new Date(data);
    return new Date(local.getFullYear(), local.getMonth(), local.getDate());
}

function atualizarTextoData(data) {
    const textoData = document.getElementById('data-selecionada');
    if (!textoData) return;

    const opcoes = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    const dataFormatada = data.toLocaleDateString('pt-BR', opcoes);

    if (diaOffset === 0) {
        textoData.textContent = `Hoje (${dataFormatada})`;
    } else if (diaOffset === -1) {
        textoData.textContent = `Ontem (${dataFormatada})`;
    } else if (diaOffset === -2) {
        textoData.textContent = `Anteontem (${dataFormatada})`;
    } else {
        textoData.textContent = dataFormatada;
    }
}

function atualizarBotoesNavegacao() {
    const btnProximo = document.getElementById('btn-dia-proximo');
    if (btnProximo) {
        btnProximo.disabled = (diaOffset >= 0);
    }
}

function construirTimeline(atividades) {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    if (atividades.length === 0) {
        container.innerHTML = `
      <div class="timeline-vazia">
        <i class="fas fa-info-circle"></i>
        <span>Nenhuma atividade registrada para este dia</span>
      </div>
    `;
        return;
    }

    const atividadesOrdenadas = [...atividades].sort((a, b) => {
        return new Date(a.dataHora) - new Date(b.dataHora);
    });

    const timelineHTML = `
    <div class="timeline-linha">
      ${atividadesOrdenadas.map(atividade => renderizarItemTimeline(atividade)).join('')}
    </div>
  `;

    container.innerHTML = timelineHTML;
}

function renderizarItemTimeline(atividade) {
    const nomeClasse = CLASSE_NOMES[atividade.classe] || 'Outro';
    const corClasse = CLASSE_CORES[nomeClasse] || 'trabalho';
    const dataHora = new Date(atividade.dataHora);
    const horario = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const duracao = atividade.horasGastas || 0;
    const icone = obterIconeClasse(nomeClasse);

    return `
    <div class="timeline-item">
      <div class="timeline-horario">
        <i class="fas fa-clock"></i>
        ${horario}
      </div>
      <div class="timeline-bloco timeline-bloco-${corClasse}">
        <div class="timeline-titulo">
          <i class="fas ${icone}"></i>
          ${atividade.nome || nomeClasse}
        </div>
        <div class="timeline-descricao">${nomeClasse}</div>
        <div class="timeline-duracao">
          <span class="timeline-badge">
            <i class="fas fa-hourglass-half"></i>
            ${duracao.toFixed(2)}h
          </span>
        </div>
      </div>
    </div>
  `;
}

function obterIconeClasse(classe) {
    const icones = {
        'Trabalho': 'fa-briefcase',
        'Estudos': 'fa-book-open',
        'Atividade Física': 'fa-dumbbell',
        'Lazer': 'fa-gamepad',
        'Sono': 'fa-bed',
    };
    return icones[classe] || 'fa-circle';
}

function atualizarResumo(atividadesDia) {
    const tempoTotal = atividadesDia.reduce((sum, a) => sum + (a.horasGastas || 0), 0);

    const tempoUsoHoje = document.getElementById('tempo-uso-hoje');
    if (tempoUsoHoje) {
        tempoUsoHoje.value = `${tempoTotal.toFixed(2)} horas`;
    }

    const horasPorClasse = calcularHorasPorClasse(atividadesDia);
    let metasAtingidas = 0;
    const totalMetas = Object.keys(METAS_DIARIAS).length;

    Object.keys(METAS_DIARIAS).forEach(classe => {
        const realizado = horasPorClasse[classe] || 0;
        const meta = METAS_DIARIAS[classe];
        if (realizado >= meta) metasAtingidas++;
    });

    const metasAtingidasInput = document.getElementById('metas-atingidas');
    if (metasAtingidasInput) {
        metasAtingidasInput.value = `${metasAtingidas}/${totalMetas} metas`;
    }

    const horasRestantes = 24 - tempoTotal;
    const horasRestantesInput = document.getElementById('horas-restantes');
    if (horasRestantesInput) {
        horasRestantesInput.value = `${Math.max(0, horasRestantes).toFixed(2)} horas`;
    }
}

function calcularHorasPorClasse(atividades) {
    const horas = {};
    Object.keys(METAS_DIARIAS).forEach(classe => {
        horas[classe] = 0;
    });

    atividades.forEach(a => {
        const classe = CLASSE_NOMES[a.classe];
        if (horas.hasOwnProperty(classe)) {
            horas[classe] += a.horasGastas || 0;
        }
    });

    return horas;
}

function atualizarMetas(atividadesDia) {
    const horasPorClasse = calcularHorasPorClasse(atividadesDia);

    const metas = {
        'Trabalho': { elementoTexto: 'meta-trabalho', elementoBarra: 'progresso-trabalho' },
        'Estudos': { elementoTexto: 'meta-estudo', elementoBarra: 'progresso-estudo' },
        'Atividade Física': { elementoTexto: 'meta-atividade-fisica', elementoBarra: 'progresso-atividade-fisica' },
        'Lazer': { elementoTexto: 'meta-lazer', elementoBarra: 'progresso-lazer' },
        'Sono': { elementoTexto: 'meta-sono', elementoBarra: 'progresso-sono' },
    };

    Object.keys(metas).forEach(classe => {
        const { elementoTexto, elementoBarra } = metas[classe];
        const realizado = horasPorClasse[classe] || 0;
        const meta = METAS_DIARIAS[classe];
        const metaCumprida = realizado >= meta;

        const elTexto = document.getElementById(elementoTexto);
        if (elTexto) {
            elTexto.textContent = `Meta: ${meta.toFixed(2)}h | Realizado: ${realizado.toFixed(2)}h ${metaCumprida ? '(Meta atingida!)' : ''}`;
            elTexto.classList.toggle('meta-atingida', metaCumprida);
        }

        const elBarra = document.getElementById(elementoBarra);
        if (elBarra) {
            const progresso = meta > 0 ? Math.min((realizado / meta) * 100, 100) : 0;
            elBarra.style.width = `${progresso.toFixed(2)}%`;
            elBarra.classList.toggle('progresso-completo', metaCumprida);
        }
    });
}

function gerarSugestoes(atividadesDia) {
    const container = document.getElementById('container-sugestoes');
    if (!container) return;

    const horasPorClasse = calcularHorasPorClasse(atividadesDia);
    const sugestoes = [];

    Object.keys(METAS_DIARIAS).forEach(classe => {
        const realizado = horasPorClasse[classe] || 0;
        const meta = METAS_DIARIAS[classe];
        const faltam = meta - realizado;

        if (faltam > 0) {
            sugestoes.push({
                tipo: 'alerta',
                icone: 'fa-exclamation-triangle',
                texto: `Faltam ${faltam.toFixed(1)}h para atingir a meta de ${classe}`
            });
        } else {
            sugestoes.push({
                tipo: 'positiva',
                icone: 'fa-check-circle',
                texto: `Meta de ${classe} atingida! Parabéns!`
            });
        }
    });

    if (sugestoes.length === 0) {
        container.innerHTML = `
      <div class="sugestao-item">
        <i class="fas fa-info-circle"></i>
        <span>Continue registrando suas atividades!</span>
      </div>
    `;
        return;
    }

    const sugestoesExibir = sugestoes.slice(0, 5);

    container.innerHTML = sugestoesExibir.map(sugestao => `
    <div class="sugestao-item sugestao-${sugestao.tipo}">
      <i class="fas ${sugestao.icone}"></i>
      <span>${sugestao.texto}</span>
    </div>
  `).join('');
}

function atualizarInsightsDiarios(atividadesDia, dataSelecionada) {
    const containerInsights = document.getElementById("container-insights");
    if (!containerInsights) return;

    const horasDia = calcularHorasPorClasse(atividadesDia);
    const insights = [];

    Object.keys(METAS_DIARIAS).forEach(classe => {
        const realizado = horasDia[classe] || 0;
        const meta = METAS_DIARIAS[classe];

        if (realizado >= meta) {
            insights.push({
                tipo: "positivo",
                icone: "fa-trophy",
                texto: `Meta de ${classe} cumprida com ${realizado.toFixed(1)}h!`
            });
        } else if (realizado > 0 && realizado < meta * 0.5) {
            insights.push({
                tipo: "neutro",
                icone: "fa-info-circle",
                texto: `${classe}: apenas ${((realizado / meta) * 100).toFixed(0)}% da meta diária`
            });
        }
    });

    const totalDia = atividadesDia.reduce((sum, a) => sum + (a.horasGastas || 0), 0);
    if (totalDia > 0) {
        const categoriaMaisUsada = Object.keys(horasDia).reduce((a, b) =>
            horasDia[a] > horasDia[b] ? a : b
        );
        const percentual = ((horasDia[categoriaMaisUsada] / totalDia) * 100).toFixed(0);

        if (percentual > 50) {
            insights.push({
                tipo: "neutro",
                icone: "fa-chart-pie",
                texto: `${categoriaMaisUsada} dominou seu dia com ${percentual}% do tempo`
            });
        }
    }

    if (totalDia > 18) {
        insights.push({
            tipo: "negativo",
            icone: "fa-exclamation-triangle",
            texto: `Você registrou ${totalDia.toFixed(1)}h hoje. Lembre-se de descansar!`
        });
    } else if (totalDia > 12) {
        insights.push({
            tipo: "positivo",
            icone: "fa-fire",
            texto: `Dia produtivo com ${totalDia.toFixed(1)}h de atividades registradas!`
        });
    } else if (totalDia < 4 && totalDia > 0) {
        insights.push({
            tipo: "neutro",
            icone: "fa-battery-quarter",
            texto: `Apenas ${totalDia.toFixed(1)}h registradas hoje. Há mais atividades?`
        });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataSelecionada.getTime() === hoje.getTime()) {
        const metasNaoAtingidas = Object.keys(METAS_DIARIAS).filter(classe => {
            const realizado = horasDia[classe] || 0;
            return realizado < METAS_DIARIAS[classe];
        });

        if (metasNaoAtingidas.length > 0 && metasNaoAtingidas.length <= 2) {
            insights.push({
                tipo: "neutro",
                icone: "fa-lightbulb",
                texto: `Ainda dá tempo! Faltam metas em: ${metasNaoAtingidas.join(", ")}`
            });
        }
    }

    const insightsExibir = insights.slice(0, 5);

    if (insightsExibir.length === 0) {
        containerInsights.innerHTML = `
      <div class="insight-item insight-neutro">
        <i class="fas fa-info-circle"></i>
        <span>Registre atividades para ver insights do dia!</span>
      </div>
    `;
        return;
    }

    containerInsights.innerHTML = insightsExibir.map(insight => `
    <div class="insight-item insight-${insight.tipo}">
      <i class="fas ${insight.icone}"></i>
      <span>${insight.texto}</span>
    </div>
  `).join('');
}

function calcularHorasPorClasse(atividades) {
    const horasPorClasse = {};
    Object.keys(METAS_DIARIAS).forEach(classe => {
        horasPorClasse[classe] = 0;
    });

    atividades.forEach(a => {
        const nomeClasse = CLASSE_NOMES[a.classe];
        if (horasPorClasse.hasOwnProperty(nomeClasse)) {
            horasPorClasse[nomeClasse] += a.horasGastas || 0;
        }
    });

    return horasPorClasse;
}
