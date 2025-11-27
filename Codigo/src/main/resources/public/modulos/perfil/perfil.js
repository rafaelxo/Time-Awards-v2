const API_URL = "http://localhost:6789/usuarios";
const FOTO_PADRAO = "/assets/imagens/anonimo.png";

let senhaOriginal = "";
let dadosUsuarioCompletos = null;

const apiRequest = async (url, method, data = null) => {
    try {
        const options = {
            method,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        };

        if (data && method !== "GET") {
            const formData = new URLSearchParams();
            Object.keys(data).forEach((key) => {
                if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            options.body = formData.toString();
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erro na requisição:", error);
        displayMessage(
            `Erro ao comunicar com o servidor: ${error.message}`,
            "error"
        );
        return null;
    }
};

const sanitizeInput = (value) => (value ? value.toString().trim() : "");

const displayMessage = (message, type = "error") => {
    const container = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.className = `notification ${type} show`;
    notification.textContent = message;
    container.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

const validateLogin = (login) => {
    if (!login) {
        return {
            valid: false,
            message: "O campo de login não pode estar vazio.",
            field: "login",
        };
    }
    if (login.length < 5) {
        return {
            valid: false,
            message: "O login deve ter no mínimo 5 caracteres.",
            field: "login",
        };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(login)) {
        return {
            valid: false,
            message: "O login deve conter apenas letras, números ou sublinhado (_).",
            field: "login",
        };
    }
    return { valid: true };
};

const validatePassword = (senha) => {
    if (!senha) {
        return {
            valid: false,
            message: "O campo de senha não pode estar vazio.",
            field: "senha",
        };
    }
    if (senha.length < 8) {
        return {
            valid: false,
            message: "A senha deve ter no mínimo 8 caracteres.",
            field: "senha",
        };
    }
    if (!/[A-Z]/.test(senha)) {
        return {
            valid: false,
            message: "A senha deve conter pelo menos uma letra maiúscula.",
            field: "senha",
        };
    }
    if (!/[a-z]/.test(senha)) {
        return {
            valid: false,
            message: "A senha deve conter pelo menos uma letra minúscula.",
            field: "senha",
        };
    }
    if (!/[0-9]/.test(senha)) {
        return {
            valid: false,
            message: "A senha deve conter pelo menos um número.",
            field: "senha",
        };
    }
    if (!/[!@#$%^&*]/.test(senha)) {
        return {
            valid: false,
            message:
                "A senha deve conter pelo menos um caractere especial (!@#$%^&*).",
            field: "senha",
        };
    }
    return { valid: true };
};

const validateEmail = (email) => {
    if (!email) {
        return {
            valid: false,
            message: "O campo de email não pode estar vazio.",
            field: "email",
        };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|br)$/;
    if (!emailRegex.test(email)) {
        return {
            valid: false,
            message: "O email deve ser válido (ex.: usuario@dominio.com).",
            field: "email",
        };
    }
    return { valid: true };
};

const validateNome = (nome) => {
    if (!nome) {
        return {
            valid: false,
            message: "O campo de nome não pode estar vazio.",
            field: "nome",
        };
    }
    if (nome.length < 3) {
        return {
            valid: false,
            message: "O nome completo deve ter no mínimo 3 caracteres.",
            field: "nome",
        };
    }
    return { valid: true };
};

const carregarDadosUsuario = async () => {
    const usuarioCorrenteJSON = sessionStorage.getItem("usuarioCorrente");
    if (!usuarioCorrenteJSON) {
        window.location.href = "/modulos/login/login.html";
        return;
    }

    const usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    if (!usuarioCorrente.id) {
        displayMessage("Erro nos dados do usuário. Faça login novamente.", "error");
        sessionStorage.removeItem("usuarioCorrente");
        window.location.href = "/modulos/login/login.html";
        return;
    }

    const saudacao = document.getElementById("texto-subtitulo");
    if (saudacao) {
        saudacao.textContent = `${usuarioCorrente.nome || "usuário"
            }, visualize suas credenciais`;
    }

    try {
        const usuario = await apiRequest(`${API_URL}/${usuarioCorrente.id}`, "GET");
        if (!usuario || !usuario.success) throw new Error("Usuário não encontrado");

        dadosUsuarioCompletos = usuario;
        senhaOriginal = "";
        preencherFormulario(usuario);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        displayMessage(
            "Erro ao carregar dados do perfil: " + error.message,
            "error"
        );
    }
};

const preencherFormulario = (usuario) => {
    preencherCampo("nome", usuario.nome);
    preencherCampo("login", usuario.login);
    preencherCampo("email", usuario.email);
    preencherCampo("telefone", usuario.telefone);
    preencherCampoSenha();
    atualizarCabecalho(usuario.nome, usuario.login);

    const interruptorNotificacao = document.getElementById("notificacao-diaria");
    if (interruptorNotificacao) {
        if (usuario.notificacoes === true || usuario.notificacoes === 1) {
            interruptorNotificacao.classList.add("active");
        } else {
            interruptorNotificacao.classList.remove("active");
        }
    }
};

const preencherCampo = (id, valor) => {
    const campo = document.getElementById(id);
    if (campo) campo.value = valor || "";
};

const preencherCampoSenha = () => {
    const campoSenha = document.getElementById("senha");
    if (campoSenha) {
        campoSenha.value = "";
        campoSenha.placeholder = "Digite uma nova senha para alterar";
    }
};

const atualizarCabecalho = (nome, login) => {
    const nomeElement = document.querySelector(".nome-perfil");
    const cargoElement = document.querySelector(".cargo-perfil");

    if (nomeElement) nomeElement.textContent = nome || "Nome não informado";
    if (cargoElement) cargoElement.textContent = `@${login}` || "Usuário";
};

const salvarPerfil = async (event) => {
    event.preventDefault();
    const salvarButton = document.getElementById("botao-salvar");
    salvarButton.disabled = true;
    limparErros();

    const dadosFormulario = coletarDadosFormulario();

    if (!validarFormulario(dadosFormulario)) {
        displayMessage("Corrija os erros no formulário antes de salvar.", "error");
        salvarButton.disabled = false;
        return;
    }

    const usuarioCorrente = JSON.parse(sessionStorage.getItem("usuarioCorrente"));

    const interruptorNotificacao = document.getElementById("notificacao-diaria");
    const notificacoesHabilitadas = interruptorNotificacao
        ? interruptorNotificacao.classList.contains("active")
        : false;

    const dadosParaEnviar = {
        nome: dadosFormulario.nome,
        login: dadosFormulario.login,
        email: dadosFormulario.email,
        telefone: dadosFormulario.telefone,
        senha: dadosFormulario.senha,
        notificacoes: notificacoesHabilitadas,
    };

    const resultado = await apiRequest(
        `${API_URL}/${usuarioCorrente.id}`,
        "PUT",
        dadosParaEnviar
    );

    if (resultado && resultado.success) {
        sessionStorage.setItem(
            "usuarioCorrente",
            JSON.stringify({
                id: usuarioCorrente.id,
                login: dadosParaEnviar.login,
                email: dadosParaEnviar.email,
                nome: dadosParaEnviar.nome,
            })
        );
        displayMessage("Perfil atualizado com sucesso!", "success");

        setTimeout(() => {
            window.location.href = "/dashboard.html";
        }, 1500);
    } else {
        displayMessage("Erro ao salvar perfil. Tente novamente.", "error");
    }

    salvarButton.disabled = false;
};

const coletarDadosFormulario = () => {
    const campoSenha = document.getElementById("senha");
    let senhaFinal = "";
    if (campoSenha && campoSenha.value.trim() !== "") {
        senhaFinal = campoSenha.value.trim();
    }

    return {
        nome: sanitizeInput(document.getElementById("nome")?.value),
        login: sanitizeInput(document.getElementById("login")?.value),
        senha: senhaFinal,
        email: sanitizeInput(document.getElementById("email")?.value),
        telefone: sanitizeInput(document.getElementById("telefone")?.value),
    };
};

const validarFormulario = (dados) => {
    let isValid = true;

    if (!validarCampo("nome", dados.nome)) isValid = false;
    if (!validarCampo("email", dados.email)) isValid = false;
    if (!validarCampo("login", dados.login)) isValid = false;
    if (dados.telefone && !validarCampo("telefone", dados.telefone))
        isValid = false;

    const campoSenha = document.getElementById("senha");
    if (campoSenha && campoSenha.value.trim() !== "") {
        if (!validarCampo("senha", campoSenha.value.trim())) isValid = false;
    }

    return isValid;
};

const validarCampo = (campo, valor) => {
    const erroDiv = document.getElementById(`erro-${campo}`);
    const inputElement = document.getElementById(campo);
    if (erroDiv) erroDiv.style.display = "none";
    if (inputElement) inputElement.classList.remove("invalid");

    switch (campo) {
        case "nome":
            const nomeValidation = validateNome(valor);
            if (!nomeValidation.valid) {
                mostrarErro(campo, nomeValidation.message);
                return false;
            }
            break;
        case "email":
            const emailValidation = validateEmail(valor);
            if (!emailValidation.valid) {
                mostrarErro(campo, emailValidation.message);
                return false;
            }
            break;
        case "login":
            const loginValidation = validateLogin(valor);
            if (!loginValidation.valid) {
                mostrarErro(campo, loginValidation.message);
                return false;
            }
            break;
        case "senha":
            if (valor && valor.trim() !== "") {
                const passwordValidation = validatePassword(valor);
                if (!passwordValidation.valid) {
                    mostrarErro(campo, passwordValidation.message);
                    return false;
                }
            }
            break;
        case "telefone":
            if (valor && !/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(valor)) {
                mostrarErro(campo, "Telefone inválido (ex.: (31) 99999-9999)");
                return false;
            }
            break;
    }
    return true;
};

const mostrarErro = (campo, mensagem) => {
    const erroDiv = document.getElementById(`erro-${campo}`);
    const inputElement = document.getElementById(campo);
    if (erroDiv) {
        erroDiv.textContent = mensagem;
        erroDiv.style.display = "block";
    }
    if (inputElement) inputElement.classList.add("invalid");
};

const limparErros = () => {
    document
        .querySelectorAll(".mensagem-erro")
        .forEach((erro) => (erro.style.display = "none"));
    document
        .querySelectorAll(".invalid")
        .forEach((campo) => campo.classList.remove("invalid"));
};

document.addEventListener("DOMContentLoaded", () => {
    const usuarioCorrenteJSON = sessionStorage.getItem("usuarioCorrente");
    if (!usuarioCorrenteJSON) {
        window.location.href = "/modulos/login/login.html";
        return;
    }

    const formulario = document.getElementById("formulario");
    if (formulario) {
        formulario.addEventListener("submit", salvarPerfil);
    }

    const botaoVoltar = document.getElementById("botao-voltar");
    if (botaoVoltar) {
        botaoVoltar.addEventListener("click", () => {
            if (confirm("Deseja voltar? Alterações não salvas serão perdidas!")) {
                window.location.href = "/dashboard.html";
            }
        });
    }

    const botaoLimpar = document.getElementById("botao-limpar");
    if (botaoLimpar) {
        botaoLimpar.addEventListener("click", () => {
            if (confirm("Deseja limpar todos os campos?")) {
                formulario.reset();
                limparErros();
                carregarDadosUsuario();
            }
        });
    }

    const campoNome = document.getElementById("nome");
    if (campoNome) {
        campoNome.addEventListener("input", () => {
            const nomeElement = document.querySelector(".nome-perfil");
            if (nomeElement) {
                nomeElement.textContent = campoNome.value || "Nome não informado";
            }
        });
    }

    ["nome", "email", "login", "telefone", "senha"].forEach((campo) => {
        const input = document.getElementById(campo);
        if (input) {
            input.addEventListener("blur", () => {
                const valor = input.value.trim();
                if (campo === "senha" && valor === "") return;
                validarCampo(campo, valor);
            });
        }
    });

    const interruptorNotificacao = document.getElementById("notificacao-diaria");
    if (interruptorNotificacao) {
        interruptorNotificacao.addEventListener("click", async () => {
            const estaAtivo = !interruptorNotificacao.classList.contains("active");
            interruptorNotificacao.classList.toggle("active");

            const usuarioCorrente = JSON.parse(
                sessionStorage.getItem("usuarioCorrente")
            );
            if (!usuarioCorrente || !usuarioCorrente.id) {
                displayMessage(
                    "Erro ao identificar usuário. Faça login novamente.",
                    "error"
                );
                return;
            }

            try {
                interruptorNotificacao.style.pointerEvents = "none";
                interruptorNotificacao.style.opacity = "0.6";

                const resultado = await apiRequest(
                    `${API_URL}/${usuarioCorrente.id}/notificacoes`,
                    "PUT",
                    { notificacoes: estaAtivo }
                );

                if (resultado && resultado.success) {
                    const mensagem = estaAtivo
                        ? "✅ Notificações ativadas com sucesso!"
                        : "🔕 Notificações desativadas com sucesso!";
                    displayMessage(mensagem, "success");

                    if (dadosUsuarioCompletos) {
                        dadosUsuarioCompletos.notificacoes = estaAtivo;
                    }
                } else {
                    interruptorNotificacao.classList.toggle("active");
                    displayMessage(
                        "Erro ao atualizar preferência de notificações.",
                        "error"
                    );
                }
            } catch (error) {
                console.error("Erro ao atualizar notificações:", error);
                interruptorNotificacao.classList.toggle("active");
                displayMessage("Erro ao comunicar com o servidor.", "error");
            } finally {
                interruptorNotificacao.style.pointerEvents = "auto";
                interruptorNotificacao.style.opacity = "1";
            }
        });
    }

    carregarDadosUsuario();
});
