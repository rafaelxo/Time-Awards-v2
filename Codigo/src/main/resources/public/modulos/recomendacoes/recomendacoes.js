document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE_URL = "http://localhost:6789";
    const usuarioCorrenteJSON = sessionStorage.getItem("usuarioCorrente");
    if (!usuarioCorrenteJSON) {
        window.location.href = "/modulos/login/login.html";
        return;
    }

    const usuario = JSON.parse(usuarioCorrenteJSON);

    const subtituloEl = document.getElementById("texto-subtitulo");
    if (subtituloEl) {
        subtituloEl.textContent = `${usuario.nome}, trouxemos para você recomendações personalizadas`;
    }

    const container = document.getElementById("container-recomendacoes");

    const CLASSE_NOMES = {
        1: 'Trabalho',
        2: 'Estudos',
        3: 'Atividade Física',
        4: 'Lazer',
        5: 'Sono',
    };

    const METAS_DIARIAS = {
        'Trabalho': 6,
        'Estudos': 4,
        'Atividade Física': 2,
        'Lazer': 4,
        'Sono': 8,
    };

    const atualizarResumoDia = async () => {
        try {
            const url = "http://localhost:6789/atividades?usuarioId=" + usuario.id;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            if (!response.ok) throw new Error('Erro ao carregar atividades');

            const todasAtividades = await response.json();

            const hoje = new Date();
            const anoHoje = hoje.getFullYear();
            const mesHoje = hoje.getMonth();
            const diaHoje = hoje.getDate();

            const atividadesDia = todasAtividades.filter(a => {
                const dataAtividade = new Date(a.dataHora);
                return dataAtividade.getFullYear() === anoHoje &&
                    dataAtividade.getMonth() === mesHoje &&
                    dataAtividade.getDate() === diaHoje;
            });

            const tempoTotal = atividadesDia.reduce((sum, a) => sum + (a.horasGastas || 0), 0);

            const tempoUsoHoje = document.getElementById('tempo-uso-hoje');
            if (tempoUsoHoje) {
                tempoUsoHoje.value = `${tempoTotal.toFixed(2)} horas`;
            }

            const horasPorClasse = {};
            Object.keys(METAS_DIARIAS).forEach(classe => {
                horasPorClasse[classe] = 0;
            });

            atividadesDia.forEach(a => {
                const classe = CLASSE_NOMES[a.classe];
                if (Object.prototype.hasOwnProperty.call(horasPorClasse, classe)) {
                    horasPorClasse[classe] += a.horasGastas || 0;
                }
            });

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

        } catch (error) {
            console.error('Erro ao atualizar resumo do dia:', error);
        }
    };

    const gerarRecomendacoesIA = async () => {
        const usuarioId = usuario.id;

        if (!usuarioId) {
            alert('Usuário não identificado. Faça login novamente.');
            window.location.href = '/modulos/login/login.html';
            return;
        }

        const btnGerar = document.querySelector('.botao-enviar');
        if (!btnGerar) {
            console.error('Botão .botao-enviar não encontrado');
            return;
        }

        const textoOriginal = btnGerar.innerHTML;
        btnGerar.disabled = true;
        btnGerar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';

        try {
            const url = "http://localhost:6789/recomendacoes/gerar?usuarioId=" + usuarioId;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                cache: 'no-cache'
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Resposta do servidor não é JSON válido");
            }

            const data = await response.json();

            if (response.ok && data.success) {
                alert("✅ " + data.total + " recomendações geradas com sucesso!");
                await carregarRecomendacoes();
            } else {
                alert("❌ Erro: " + (data.message || "Erro desconhecido"));
            }
        } catch (error) {
            console.error("Erro ao gerar recomendações:", error);
            alert("❌ Erro ao conectar com o servidor. Verifique se a aplicação está rodando na porta 6789.");
        } finally {
            btnGerar.disabled = false;
            btnGerar.innerHTML = textoOriginal;
        }
    };

    const carregarRecomendacoes = async () => {
        try {
            const url = "http://localhost:6789/recomendacoes?usuarioId=" + usuario.id;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error("Erro " + response.status + ": " + response.statusText);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Resposta do servidor não é JSON válido");
            }

            const recomendacoes = await response.json();
            container.innerHTML = "";

            const recomendacoesVisiveis = (recomendacoes || []).filter(r => !r.status);

            if (!recomendacoesVisiveis || recomendacoesVisiveis.length === 0) {
                container.innerHTML = "\n          <div class=\"mensagem-vazia\">\n            <i class=\"fas fa-lightbulb fa-3x\"></i>\n            <p>Nenhuma recomendação disponível.</p>\n            <small>Clique em \"Gerar Recomendações\" para criar sugestões personalizadas.</small>\n          </div>\n        ";
                return;
            } recomendacoesVisiveis.forEach((rec, i) => {
                const div = document.createElement("div");
                const relevanciaClass = rec.relevancia === 3 ? "alto" : rec.relevancia === 2 ? "moderado" : "leve";
                const relevanciaTexto = rec.relevancia === 3 ? "Alta" : rec.relevancia === 2 ? "Média" : "Baixa";

                div.className = "recomendacao-card " + relevanciaClass;

                const headerDiv = document.createElement("div");
                headerDiv.style.display = "flex";
                headerDiv.style.justifyContent = "space-between";
                headerDiv.style.alignItems = "start";
                headerDiv.style.marginBottom = "0.5rem";

                const titulo = document.createElement("h5");
                titulo.style.margin = "0";
                titulo.style.color = "#333";
                titulo.textContent = rec.titulo;

                const badge = document.createElement("span");
                badge.className = "badge badge-" + relevanciaClass;
                badge.style.fontSize = "0.75rem";
                badge.style.padding = "0.25rem 0.5rem";
                badge.textContent = relevanciaTexto;

                headerDiv.appendChild(titulo);
                headerDiv.appendChild(badge);

                const descricao = document.createElement("p");
                descricao.style.color = "#666";
                descricao.style.marginBottom = "1rem";
                descricao.textContent = rec.descricao;

                const botao = document.createElement("button");
                botao.className = "btn-concluir";
                botao.setAttribute("data-id", String(rec.id || i));
                botao.disabled = rec.status;
                botao.textContent = rec.status ? "✓ Concluído" : "Marcar como concluído";

                div.appendChild(headerDiv);
                div.appendChild(descricao);
                div.appendChild(botao);

                container.appendChild(div);
            });

            const botoesArray = Array.from(document.querySelectorAll(".btn-concluir"));
            botoesArray.forEach(function (btn) {
                btn.addEventListener("click", async function (e) {
                    e.preventDefault();
                    const id = e.target.getAttribute("data-id");

                    btn.disabled = true;
                    btn.textContent = "✓ Concluído";

                    try {
                        const form = new URLSearchParams();
                        const usuarioId = usuario.id;
                        form.append('usuarioId', usuarioId);
                        form.append('status', 'true');

                        const resp = await fetch(`${API_BASE_URL}/recomendacoes/${id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: form.toString(),
                        });

                        if (!resp.ok) {
                            const text = await resp.text();
                            throw new Error(text || ('Status ' + resp.status));
                        }

                        const card = btn.closest('.recomendacao-card');
                        if (card && card.parentNode) {
                            card.parentNode.removeChild(card);
                        }

                        try { alert('✅ Recomendação marcada como concluída!'); } catch (e) { }

                        if (!container.querySelector('.recomendacao-card')) {
                            await carregarRecomendacoes();
                        }
                    } catch (err) {
                        console.error('Erro ao marcar recomendação como concluída:', err);
                        btn.disabled = false;
                        btn.textContent = 'Marcar como concluído';
                        alert('Erro ao marcar como concluído. Tente novamente.');
                    }
                });
            });

        } catch (error) {
            console.error('Erro ao carregar recomendações:', error);
            container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #d32f2f;">
          <i class="fas fa-exclamation-triangle fa-2x" style="margin-bottom: 1rem;"></i>
          <p>Erro ao carregar recomendações.</p>
          <p style="font-size: 0.875rem;">${error.message}</p>
        </div>
      `;
        }
    };

    const btnGerar = document.querySelector(".botao-enviar");
    const btnVoltar = document.querySelector(".botao-voltar");

    if (btnGerar) {
        btnGerar.addEventListener("click", async (e) => {
            e.preventDefault();
            await gerarRecomendacoesIA();
        });
    }

    if (btnVoltar) {
        btnVoltar.addEventListener("click", () => {
            window.location.href = "/dashboard.html";
        });
    }

    await atualizarResumoDia();
    await carregarRecomendacoes();
});
