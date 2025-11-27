const LOGIN_URL = "/modulos/login/login.html";
let RETURN_URL = "/dashboard.html";
const API_URL = "http://localhost:6789/usuarios";
const LOGIN_API_URL = "http://localhost:6789/login";

var usuarioCorrente = {};

const STORAGE_KEY_USER = "timeawards_user";
const STORAGE_KEY_REMEMBER = "timeawards_remember";

let autoLoginTimeout = null;

function initLoginApp() {
    const pagina = window.location.pathname;
    if (pagina !== LOGIN_URL) {
        sessionStorage.setItem("returnURL", pagina);
        RETURN_URL = pagina;

        const rememberedUser = localStorage.getItem(STORAGE_KEY_USER);
        const usuarioCorrenteJSON = sessionStorage.getItem("usuarioCorrente");

        if (usuarioCorrenteJSON) {
            usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
        } else if (rememberedUser) {
            usuarioCorrente = JSON.parse(rememberedUser);
            sessionStorage.setItem("usuarioCorrente", rememberedUser);
        } else {
            window.location.href = LOGIN_URL;
        }

        document.addEventListener("DOMContentLoaded", () => {
            showUserInfo("userInfo");
        });
    } else {
        const returnURL = sessionStorage.getItem("returnURL");
        RETURN_URL = returnURL || "/dashboard.html";

        checkRememberedSession();
    }
}

function checkRememberedSession() {
    const rememberedUser = localStorage.getItem(STORAGE_KEY_USER);
    const rememberFlag = localStorage.getItem(STORAGE_KEY_REMEMBER);

    if (rememberedUser && rememberFlag === "true") {
        try {
            const user = JSON.parse(rememberedUser);
            usuarioCorrente = user;
            sessionStorage.setItem("usuarioCorrente", rememberedUser);

            const autoLoginMessage = document.getElementById("auto-login-message");
            const autoLoginText = document.getElementById("auto-login-text");
            if (autoLoginMessage && autoLoginText) {
                autoLoginText.textContent = `Entrando como ${user.nome}...`;
                autoLoginMessage.style.display = "flex";
            }

            setTimeout(() => {
                if (typeof showToast === "function") {
                    showToast(`Bem-vindo de volta, ${user.nome}!`, "success");
                }
            }, 100);

            autoLoginTimeout = setTimeout(() => {
                window.location.href = RETURN_URL || "/dashboard.html";
            }, 2000);
        } catch (e) {
            console.error("Erro ao recuperar sessão salva:", e);
            clearRememberedSession();
        }
    }
}

function cancelAutoLogin() {
    if (autoLoginTimeout) {
        clearTimeout(autoLoginTimeout);
        autoLoginTimeout = null;
    }

    clearRememberedSession();
    sessionStorage.removeItem("usuarioCorrente");

    const autoLoginMessage = document.getElementById("auto-login-message");
    if (autoLoginMessage) {
        autoLoginMessage.style.display = "none";
    }

    if (typeof showToast === "function") {
        showToast("Sessão anterior removida. Faça login novamente.", "success");
    }

    const usernameField = document.getElementById("username");
    const passwordField = document.getElementById("password");
    const rememberField = document.getElementById("rememberMe");
    if (usernameField) usernameField.value = "";
    if (passwordField) passwordField.value = "";
    if (rememberField) rememberField.checked = false;
}
function saveRememberedSession(user, remember) {
    if (remember) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_REMEMBER, "true");
    } else {
        clearRememberedSession();
    }
}

function clearRememberedSession() {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_REMEMBER);
}

function validateLogin(login) {
    login = login ? login.trim() : "";

    if (!login)
        return {
            valid: false,
            message: "O campo de login não pode estar vazio.",
            field: "login",
        };
    if (login.length < 5)
        return {
            valid: false,
            message: "O login deve ter no mínimo 5 caracteres.",
            field: "login",
        };
    if (login.length > 50)
        return {
            valid: false,
            message: "O login deve ter no máximo 50 caracteres.",
            field: "login",
        };
    if (!/^[a-zA-Z0-9_]+$/.test(login))
        return {
            valid: false,
            message: "O login deve conter apenas letras, números ou sublinhado (_).",
            field: "login",
        };
    return { valid: true };
}

function validatePassword(senha) {
    senha = senha ? senha.trim() : "";

    if (!senha)
        return {
            valid: false,
            message: "O campo de senha não pode estar vazio.",
            field: "senha",
        };
    if (senha.length < 8)
        return {
            valid: false,
            message: "A senha deve ter no mínimo 8 caracteres.",
            field: "senha",
        };
    if (senha.length > 128)
        return {
            valid: false,
            message: "A senha deve ter no máximo 128 caracteres.",
            field: "senha",
        };
    if (!/[A-Z]/.test(senha))
        return {
            valid: false,
            message: "A senha deve conter pelo menos uma letra maiúscula.",
            field: "senha",
        };
    if (!/[a-z]/.test(senha))
        return {
            valid: false,
            message: "A senha deve conter pelo menos uma letra minúscula.",
            field: "senha",
        };
    if (!/[0-9]/.test(senha))
        return {
            valid: false,
            message: "A senha deve conter pelo menos um número.",
            field: "senha",
        };
    if (!/[!@#$%^&*]/.test(senha))
        return {
            valid: false,
            message:
                "A senha deve conter pelo menos um caractere especial (!@#$%^&*).",
            field: "senha",
        };
    if (/\s/.test(senha))
        return {
            valid: false,
            message: "A senha não pode conter espaços.",
            field: "senha",
        };
    return { valid: true };
}

function validateEmail(email) {
    email = email ? email.trim().toLowerCase() : "";

    if (!email)
        return {
            valid: false,
            message: "O campo de email não pode estar vazio.",
            field: "email",
        };
    if (email.length > 100)
        return {
            valid: false,
            message: "O email deve ter no máximo 100 caracteres.",
            field: "email",
        };
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|br)$/;
    if (!emailRegex.test(email))
        return {
            valid: false,
            message: "O email deve ser válido (ex.: usuario@dominio.com).",
            field: "email",
        };
    return { valid: true };
}

function validateNome(nome) {
    nome = nome ? nome.trim() : "";

    if (!nome)
        return {
            valid: false,
            message: "O campo de nome não pode estar vazio.",
            field: "nome",
        };
    if (nome.length < 3)
        return {
            valid: false,
            message: "O nome completo deve ter no mínimo 3 caracteres.",
            field: "nome",
        };
    if (nome.length > 100)
        return {
            valid: false,
            message: "O nome completo deve ter no máximo 100 caracteres.",
            field: "nome",
        };
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome))
        return {
            valid: false,
            message: "O nome deve conter apenas letras.",
            field: "nome",
        };
    return { valid: true };
}

function validateTelefone(telefone) {
    telefone = telefone ? telefone.trim().replace(/[\s\-\(\)]/g, "") : "";

    if (!telefone)
        return {
            valid: false,
            message: "O campo de telefone não pode estar vazio.",
            field: "telefone",
        };
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(telefone))
        return {
            valid: false,
            message: "Telefone deve conter apenas números e ter de 10 a 15 dígitos.",
            field: "telefone",
        };
    return { valid: true };
}

async function loginUser(login, senha, remember = false) {
    login = login ? login.trim() : "";
    senha = senha ? senha.trim() : "";

    const loginValidation = validateLogin(login);
    if (!loginValidation.valid)
        return {
            success: false,
            message: loginValidation.message,
            field: loginValidation.field,
        };

    const passwordValidation = validatePassword(senha);
    if (!passwordValidation.valid)
        return {
            success: false,
            message: passwordValidation.message,
            field: passwordValidation.field,
        };

    try {
        const params = new URLSearchParams();
        params.append("login", login);
        params.append("senha", senha);

        const response = await fetch(LOGIN_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });

        let data = {};
        try {
            data = await response.json();
        } catch (e) {
            console.error("Erro ao parsear resposta JSON:", e);
            data = {};
        }

        if (response.ok && data.success) {
            usuarioCorrente = { id: data.id, nome: data.nome, login: login };

            sessionStorage.setItem(
                "usuarioCorrente",
                JSON.stringify(usuarioCorrente)
            );

            saveRememberedSession(usuarioCorrente, remember);

            return { success: true, message: "Login realizado com sucesso!" };
        } else {
            return {
                success: false,
                message: data.message || "Login ou senha inválidos.",
                field: "login",
            };
        }
    } catch (error) {
        console.error("Erro ao autenticar:", error);
        return {
            success: false,
            message: "Erro ao autenticar. Verifique sua conexão e tente novamente.",
            field: "geral",
        };
    }
}

function logoutUser() {
    sessionStorage.removeItem("usuarioCorrente");
    clearRememberedSession();
    window.location = LOGIN_URL;
}

async function addUser(nome, login, email, telefone, senha, senha2) {
    nome = nome ? nome.trim() : "";
    login = login ? login.trim() : "";
    email = email ? email.trim().toLowerCase() : "";
    telefone = telefone ? telefone.trim().replace(/[\s\-\(\)]/g, "") : "";
    senha = senha ? senha.trim() : "";
    senha2 = senha2 ? senha2.trim() : "";

    const nomeValidation = validateNome(nome);
    if (!nomeValidation.valid)
        return {
            success: false,
            message: nomeValidation.message,
            field: nomeValidation.field,
        };

    const loginValidation = validateLogin(login);
    if (!loginValidation.valid)
        return {
            success: false,
            message: loginValidation.message,
            field: loginValidation.field,
        };

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid)
        return {
            success: false,
            message: emailValidation.message,
            field: emailValidation.field,
        };

    const telefoneValidation = validateTelefone(telefone);
    if (!telefoneValidation.valid)
        return {
            success: false,
            message: telefoneValidation.message,
            field: telefoneValidation.field,
        };

    const passwordValidation = validatePassword(senha);
    if (!passwordValidation.valid)
        return {
            success: false,
            message: passwordValidation.message,
            field: passwordValidation.field,
        };

    if (senha !== senha2)
        return {
            success: false,
            message: "As senhas informadas não conferem.",
            field: "senha2",
        };

    try {
        const params = new URLSearchParams();
        params.append("nome", nome);
        params.append("login", login);
        params.append("senha", senha);
        params.append("email", email);
        params.append("telefone", telefone);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });

        let data = {};
        try {
            data = await response.json();
        } catch (e) {
            console.error("Erro ao parsear resposta JSON:", e);
            data = {};
        }

        if (response.ok && data.success) {
            return { success: true, message: "Usuário registrado com sucesso!" };
        } else {
            const field = data.field || "geral";
            return {
                success: false,
                message: data.message || "Erro ao registrar usuário.",
                field: field,
            };
        }
    } catch (error) {
        console.error("Erro ao inserir usuário:", error);
        return {
            success: false,
            message:
                "Erro ao inserir usuário. Verifique sua conexão e tente novamente.",
            field: "geral",
        };
    }
}

function showUserInfo(element) {
    const elemUser = document.getElementById(element);
    if (elemUser && usuarioCorrente.nome && usuarioCorrente.login) {
        elemUser.innerHTML = `${usuarioCorrente.nome} (${usuarioCorrente.login})
            <a onclick="logoutUser()">❌</a>`;
    }
}

function displayMessage(message, type = "error") {
    const container = document.getElementById("notification-container");
    const notification = document.createElement("div");
    notification.className = `notification ${type} show`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

initLoginApp();
