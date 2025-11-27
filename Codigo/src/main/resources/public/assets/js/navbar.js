function gerarNavBar() {
    const navbar = document.querySelector('.sidebar');
    navbar.innerHTML = `
        <div class="sidebar-header">
            <a href="/dashboard.html">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    class="logo-icone">
                    <circle cx="12" cy="12" r="10" stroke="#4285F4" stroke-width="2" />
                    <path d="M12 6V12L16 16" stroke="#4285F4" stroke-width="2" stroke-linecap="round" />
                </svg>
                <h1 class="logo-texto">TimeAwards</h1>
            </a>
        </div>

        <nav class="sidebar-nav">
            <a href="/dashboard.html">
                <div class="nav-item">
                    <i class="fas fa-chart-line nav-icone"></i>
                    <span>Dashboard</span>
                </div>
            </a>
            <a href="/modulos/monitoramento/monitoramento.html">
                <div class="nav-item">
                    <i class="fas fa-lightbulb nav-icone"></i>
                    <span>Monitoramento</span>
                </div>
            </a>
            <a href="/modulos/atividades/atividades.html">
                <div class="nav-item">
                    <i class="fas fa-plus nav-icone"></i>
                    <span>Atividades</span>
                </div>
            </a>
            <a href="/modulos/recomendacoes/recomendacoes.html">
                <div class="nav-item">
                    <i class="fas fa-th-large nav-icone"></i>
                    <span>Recomendações</span>
                </div>
            </a>
            <a href="/modulos/perfil/perfil.html">
                <div class="nav-item">
                    <i class="fas fa-user nav-icone"></i>
                    <span>Perfil</span>
                </div>
            </a>
            <a href="#" id="btnLogout">
                <div class="nav-item">
                    <i class="fas fa-sign-out-alt nav-icone"></i>
                    <span>Sair</span>
                </div>
            </a>
        </nav>
    `;

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }
}

function logout() {
    sessionStorage.clear();
    localStorage.removeItem('authToken');

    window.location.href = 'http://localhost:6789/modulos/login/login.html';
}

function marcaAtivo() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const pagina = window.location.href;

    navItems.forEach(item => {
        const link = item.parentElement.getAttribute('href');
        if (!link) {
            item.classList.remove('active');
            return;
        }

        const linkUrl = new URL(link, window.location.origin).href;
        if (pagina === linkUrl || (link.includes('index.html') && pagina.endsWith('/'))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

$(document).ready(function () {
    gerarNavBar();
    marcaAtivo();
});
