const API_BASE_URL = "http://localhost:6789";
const LOGIN_PAGE = "/modulos/login/login.html";

const METAS_POR_CLASSE = {
    Trabalho: 6,
    Estudos: 4,
    "Atividade Física": 2,
    Lazer: 4,
    Sono: 8,
};

const CLASSE_MAP = {
    Trabalho: 1,
    Estudos: 2,
    "Atividade Física": 3,
    Lazer: 4,
    Sono: 5,
};

const CLASSE_NOMES = {
    1: "Trabalho",
    2: "Estudos",
    3: "Atividade Física",
    4: "Lazer",
    5: "Sono",
};

const PRIORIDADE_MAP = {
    Baixa: 1,
    Média: 2,
    Alta: 3,
};

const PRIORIDADE_NOMES = {
    1: "Baixa",
    2: "Média",
    3: "Alta",
};

const CORES_PRIORIDADE = {
    Baixa: "#10b981",
    Média: "#f59e0b",
    Alta: "#ef4444",
};

let usuarioCorrente = null;
let atividadeEmEdicao = null;

const elementos = {
    inputNome: null,
    selectClasse: null,
    inputHoras: null,
    selectPrioridade: null,
    formulario: null,
    botaoCancelar: null,
    botaoAdicionar: null,
    tabelaAtividades: null,
    saudacao: null,
};

document.addEventListener("DOMContentLoaded", () => {
    if (!verificarAutenticacao()) return;
    inicializarElementos();
    exibirSaudacao();
    configurarEventos();
    carregarAtividades();
});

function verificarAutenticacao() {
    const usuarioJSON = sessionStorage.getItem("usuarioCorrente");
    if (!usuarioJSON) {
        window.location.href = LOGIN_PAGE;
        return false;
    }
    usuarioCorrente = JSON.parse(usuarioJSON);
    return true;
}

function exibirSaudacao() {
    if (elementos.saudacao && usuarioCorrente) {
        const nome = usuarioCorrente.nome || "usuário";
        elementos.saudacao.textContent = `${nome}, gerencie suas atividades diárias`;
    }
}

function inicializarElementos() {
    elementos.inputNome = document.querySelector("#nome input.input-formulario");
    elementos.selectClasse = document.querySelector(
        "#classe select.input-formulario"
    );
    elementos.inputHoras = document.querySelector(
        "#horas input.input-formulario"
    );
    elementos.selectPrioridade = document.querySelector(
        "#prioridade select.input-formulario"
    );
    elementos.formulario = document.getElementById("formulario");
    elementos.botaoCancelar = document.querySelector(".botao-voltar");
    elementos.botaoAdicionar = document.querySelector(".botao-enviar");
    elementos.tabelaAtividades = document.getElementById("tabela-atividades");
    elementos.saudacao = document.getElementById("texto-subtitulo");
}

function exibirMensagem(mensagem, tipo = "info") {
    if (typeof displayMessage === "function") {
        displayMessage(mensagem, tipo);
    } else {
        alert(mensagem);
    }
}

function limparFormulario() {
    if (elementos.formulario) {
        elementos.formulario.reset();
    }
    const estavaModoEdicao = atividadeEmEdicao !== null;
    atividadeEmEdicao = null;
    if (elementos.botaoAdicionar) {
        elementos.botaoAdicionar.innerHTML =
            '<i class="fas fa-plus"></i> Adicionar Atividade';
        elementos.botaoAdicionar.classList.remove("modo-edicao");
    }
    if (estavaModoEdicao) {
        carregarAtividades();
    }
}

function coletarDadosFormulario() {
    const nomeAtividade = elementos.inputNome.value.trim();
    const classeNome = elementos.selectClasse.value;
    const horasGastas = parseFloat(elementos.inputHoras.value) || 0;
    const metaHoras = METAS_POR_CLASSE[classeNome] || 0;
    const prioridadeNome = elementos.selectPrioridade.value;

    return {
        usuarioId: usuarioCorrente.id,
        nomeAtividade,
        classe: CLASSE_MAP[classeNome] || 1,
        horasGastas: Number(horasGastas.toFixed(2)),
        metaHoras: Math.round(metaHoras),
        prioridade: PRIORIDADE_MAP[prioridadeNome] || 2,
    };
}

function validarFormulario() {
    const dados = coletarDadosFormulario();

    if (!dados.nomeAtividade) {
        exibirMensagem("⚠️ Por favor, preencha o nome da atividade.", "error");
        elementos.inputNome.focus();
        return false;
    }

    if (!elementos.selectClasse.value) {
        exibirMensagem("⚠️ Por favor, selecione a classe da atividade.", "error");
        elementos.selectClasse.focus();
        return false;
    }

    if (!elementos.inputHoras.value || dados.horasGastas <= 0) {
        exibirMensagem(
            "⚠️ Por favor, informe as horas gastas (deve ser maior que zero).",
            "error"
        );
        elementos.inputHoras.focus();
        return false;
    }

    if (!elementos.selectPrioridade.value) {
        exibirMensagem(
            "⚠️ Por favor, selecione a prioridade da atividade.",
            "error"
        );
        elementos.selectPrioridade.focus();
        return false;
    }

    return true;
}

async function salvarAtividade(dados) {
    try {
        elementos.botaoAdicionar.disabled = true;
        elementos.botaoAdicionar.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        const formData = new URLSearchParams();
        formData.append("usuarioId", dados.usuarioId);
        formData.append("nomeAtividade", dados.nomeAtividade);
        formData.append("classe", dados.classe);
        formData.append("horasGastas", Number(dados.horasGastas).toFixed(2));
        formData.append("metaHoras", dados.metaHoras);
        formData.append("prioridade", dados.prioridade);

        try {
            console.debug('POST /atividades body ->', formData.toString());
        } catch (e) {
            console.debug('POST /atividades formData build error', e);
        }

        const response = await fetch(`${API_BASE_URL}/atividades`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao salvar atividade: ${errorText}`);
        }

        exibirMensagem("✅ Atividade adicionada com sucesso!", "success");
        limparFormulario();
        await carregarAtividades();
    } catch (error) {
        console.error("❌ Erro ao salvar atividade:", error);
        exibirMensagem(`❌ Erro ao salvar atividade: ${error.message}`, "error");
    } finally {
        elementos.botaoAdicionar.disabled = false;
        elementos.botaoAdicionar.innerHTML =
            '<i class="fas fa-plus"></i> Adicionar Atividade';
    }
}

async function atualizarAtividade(id, dados) {
    try {
        elementos.botaoAdicionar.disabled = true;
        elementos.botaoAdicionar.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Atualizando...';

        const formData = new URLSearchParams();
        formData.append("usuarioId", dados.usuarioId);
        formData.append("nomeAtividade", dados.nomeAtividade);
        formData.append("classe", dados.classe);
        formData.append("horasGastas", Number(dados.horasGastas).toFixed(2));
        formData.append("metaHoras", dados.metaHoras);
        formData.append("prioridade", dados.prioridade);

        try {
            console.debug(`PUT /atividades/${id} body ->`, formData.toString());
        } catch (e) {
            console.debug('PUT /atividades formData build error', e);
        }

        const response = await fetch(`${API_BASE_URL}/atividades/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao atualizar atividade: ${errorText}`);
        }

        exibirMensagem("✅ Atividade atualizada com sucesso!", "success");
        limparFormulario();
        await carregarAtividades();
    } catch (error) {
        console.error("❌ Erro ao atualizar atividade:", error);
        exibirMensagem(`❌ Erro ao atualizar atividade: ${error.message}`, "error");
    } finally {
        elementos.botaoAdicionar.disabled = false;
        elementos.botaoAdicionar.innerHTML =
            '<i class="fas fa-edit"></i> Atualizar Atividade';
        elementos.botaoAdicionar.classList.add("modo-edicao");
    }
}

async function deletarAtividade(id) {
    if (
        !confirm(
            "❌ Tem certeza que deseja excluir esta atividade?\n\nEsta ação não pode ser desfeita."
        )
    ) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/atividades/${id}?usuarioId=${usuarioCorrente.id}`,
            {
                method: "DELETE",
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao deletar atividade: ${errorText}`);
        }

        exibirMensagem("✅ Atividade excluída com sucesso!", "success");

        if (atividadeEmEdicao && atividadeEmEdicao.id === id) {
            limparFormulario();
        }

        await carregarAtividades();
    } catch (error) {
        console.error("❌ Erro ao deletar atividade:", error);
        exibirMensagem(`❌ Erro ao deletar atividade: ${error.message}`, "error");
    }
}

function preencherFormularioParaEdicao(atividade) {
    const formulario = document.getElementById('formulario');
    if (formulario) {
        const inputs = formulario.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = false;
            input.style.opacity = '1';
            input.style.cursor = '';
        });
    }

    elementos.inputNome.value = atividade.nomeAtividade || "";
    elementos.selectClasse.value = CLASSE_NOMES[atividade.classe] || "";
    elementos.inputHoras.value = atividade.horasGastas || 0;
    elementos.selectPrioridade.value =
        PRIORIDADE_NOMES[atividade.prioridade] || "";

    atividadeEmEdicao = atividade;

    elementos.botaoAdicionar.innerHTML =
        '<i class="fas fa-edit"></i> Atualizar Atividade';
    elementos.botaoAdicionar.classList.add("modo-edicao");
    elementos.botaoAdicionar.disabled = false;
    elementos.botaoAdicionar.style.opacity = '1';
    elementos.botaoAdicionar.style.cursor = 'pointer';

    animarCamposFormulario();
    elementos.formulario.scrollIntoView({ behavior: "smooth", block: "start" });

    exibirMensagem(
        '✏️ Modo de edição ativado! Altere os campos e clique em "Atualizar Atividade"',
        "info"
    );
}

function animarCamposFormulario() {
    const campos = [
        elementos.inputNome,
        elementos.selectClasse,
        elementos.inputHoras,
        elementos.selectPrioridade,
    ];

    campos.forEach((campo, index) => {
        setTimeout(() => {
            campo.style.transition = "all 0.3s ease";
            campo.style.backgroundColor = "#fff3cd";
            campo.style.transform = "scale(1.02)";

            setTimeout(() => {
                campo.style.backgroundColor = "#f9fafb";
                campo.style.transform = "scale(1)";
            }, 300);
        }, index * 100);
    });
}

async function carregarAtividades() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/atividades?usuarioId=${usuarioCorrente.id}`
        );

        if (!response.ok) {
            throw new Error("Erro ao carregar atividades.");
        }

        const atividades = await response.json();
        verificarLimite24Horas(atividades);
        renderizarAtividades(atividades);
    } catch (error) {
        console.error("❌ Erro ao carregar atividades:", error);
        exibirErroCarregamento();
    }
}

function verificarLimite24Horas(atividades) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const atividadesHoje = atividades.filter(atividade => {
        const dataAtividade = new Date(atividade.dataHora);
        dataAtividade.setHours(0, 0, 0, 0);
        return dataAtividade.getTime() === hoje.getTime();
    });

    const totalHorasHoje = atividadesHoje.reduce((total, atividade) => {
        return total + (parseFloat(atividade.horasGastas) || 0);
    }, 0);

    if (totalHorasHoje >= 24) {
        bloquearFormulario(totalHorasHoje);
    } else {
        desbloquearFormulario();
    }
}

function bloquearFormulario(totalHoras) {
    const formulario = document.getElementById('formulario');
    if (!formulario) return;

    const inputs = formulario.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.disabled = true;
        input.style.opacity = '0.5';
        input.style.cursor = 'not-allowed';
    });

    const botoesFormulario = formulario.querySelectorAll('.botao');
    botoesFormulario.forEach(botao => {
        if (!botao.classList.contains('modo-edicao')) {
            botao.disabled = true;
            botao.style.opacity = '0.5';
            botao.style.cursor = 'not-allowed';
        }
    });

    let alertaBloqueio = document.getElementById('alerta-24horas');
    if (!alertaBloqueio) {
        alertaBloqueio = document.createElement('div');
        alertaBloqueio.id = 'alerta-24horas';
        alertaBloqueio.className = 'alerta-bloqueio';
        alertaBloqueio.innerHTML = `
            <div class="icone-alerta">
                <i class="fas fa-clock"></i>
            </div>
            <h3>Limite de 24 horas atingido!</h3>
            <p>Você já cadastrou <strong>${totalHoras.toFixed(1)} horas</strong> de atividades para hoje.</p>
            <p>O cadastro de <strong>novas atividades</strong> foi bloqueado. Volte amanhã para continuar!</p>
            <p style="margin-top: 1rem; color: #059669; font-weight: 500;">
                <i class="fas fa-info-circle"></i> Você ainda pode editar ou excluir atividades existentes.
            </p>
        `;
        formulario.insertBefore(alertaBloqueio, formulario.firstChild);
    }
}

function desbloquearFormulario() {
    const formulario = document.getElementById('formulario');
    if (!formulario) return;

    const inputs = formulario.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
        input.disabled = false;
        input.style.opacity = '1';
        input.style.cursor = '';
    });

    const alertaBloqueio = document.getElementById('alerta-24horas');
    if (alertaBloqueio) {
        alertaBloqueio.remove();
    }
}

function exibirErroCarregamento() {
    if (!elementos.tabelaAtividades) return;

    const tbody = elementos.tabelaAtividades.querySelector("tbody");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #dc2626; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Erro ao carregar atividades. Verifique sua conexão.
                </td>
            </tr>
        `;
    }
}

function renderizarAtividades(atividades) {
    if (!elementos.tabelaAtividades) {
        console.error("❌ Tabela de atividades não encontrada");
        return;
    }

    const tbody = elementos.tabelaAtividades.querySelector("tbody");
    if (!tbody) {
        console.error("❌ tbody não encontrado na tabela");
        return;
    }

    tbody.innerHTML = "";

    if (!atividades || atividades.length === 0) {
        exibirMensagemVazio(tbody);
        return;
    }

    atividades.forEach((atividade) => criarLinhaAtividade(atividade, tbody));
}

function exibirMensagemVazio(tbody) {
    tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: #6b7280;">
                <i class="fas fa-inbox"></i>
                <br><br>
                Nenhuma atividade encontrada.
                <br>
                <small>Adicione sua primeira atividade usando o formulário acima!</small>
            </td>
        </tr>
    `;
}

function criarLinhaAtividade(atividade, tbody) {
    const tr = document.createElement("tr");
    const classeNome = CLASSE_NOMES[atividade.classe] || "-";
    const prioridadeNome = PRIORIDADE_NOMES[atividade.prioridade] || "-";
    const dataFormatada = formatarData(atividade.dataHora);
    const corPrioridade = CORES_PRIORIDADE[prioridadeNome] || "#6b7280";

    tr.innerHTML = `
        <td>${atividade.nomeAtividade || "-"}</td>
        <td><span class="badge-classe">${classeNome}</span></td>
        <td><strong>${atividade.horasGastas || 0}h</strong></td>
        <td>
            <span style="color: ${corPrioridade}; font-weight: 600;">
                ● ${prioridadeNome}
            </span>
        </td>
        <td><small>${dataFormatada}</small></td>
        <td class="acoes-tabela">
            <button class="btn-editar" title="Editar atividade" data-id="${atividade.id
        }">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-deletar" title="Excluir atividade" data-id="${atividade.id
        }">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(tr);
    configurarBotoesAcao(tr, atividade);
}

function configurarBotoesAcao(tr, atividade) {
    const btnEditar = tr.querySelector(".btn-editar");
    const btnDeletar = tr.querySelector(".btn-deletar");

    if (btnEditar) {
        btnEditar.addEventListener("click", (e) => {
            e.preventDefault();
            preencherFormularioParaEdicao(atividade);
        });
    }

    if (btnDeletar) {
        btnDeletar.addEventListener("click", (e) => {
            e.preventDefault();
            deletarAtividade(atividade.id);
        });
    }
}

function formatarData(dataHora) {
    if (!dataHora) return "-";

    try {
        return new Date(dataHora).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "-";
    }
}

function configurarEventos() {
    if (elementos.botaoCancelar) {
        elementos.botaoCancelar.addEventListener("click", handleCancelar);
    }

    if (elementos.botaoAdicionar) {
        elementos.botaoAdicionar.addEventListener("click", handleSubmit);
    }
}

function handleCancelar() {
    if (atividadeEmEdicao) {
        limparFormulario();
        exibirMensagem("Edição cancelada", "info");
    } else {
        window.location.href = "/dashboard.html";
    }
}

function handleSubmit(e) {
    e.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const dados = coletarDadosFormulario();

    if (atividadeEmEdicao) {
        atualizarAtividade(atividadeEmEdicao.id, dados);
    } else {
        salvarAtividade(dados);
    }
}
