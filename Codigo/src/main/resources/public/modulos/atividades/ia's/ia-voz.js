const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    document.addEventListener('DOMContentLoaded', () => {
        const botaoMic = document.getElementById('btn-mic');
        if (botaoMic) {
            botaoMic.disabled = true;
            botaoMic.style.opacity = '0.5';
            botaoMic.style.cursor = 'not-allowed';
            botaoMic.title = 'Reconhecimento de voz não suportado neste navegador';
        }
    });

    alert('⚠️ Seu navegador não suporta reconhecimento de voz.');
} else {
    document.addEventListener('DOMContentLoaded', () => {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const botaoMic = document.getElementById('btn-mic');
        const campoTexto = document.querySelector('.input-prompt');
        let ouvindo = false;

        botaoMic.addEventListener('click', (e) => {
            e.preventDefault();

            if (!ouvindo) {
                try {
                    recognition.start();
                    ouvindo = true;
                    botaoMic.classList.add('gravando');

                    if (typeof displayMessage === 'function') {
                        displayMessage('🎙️ Gravando... \n❗ Clique novamente para parar', 'info');
                    }
                } catch (error) {
                    if (typeof displayMessage === 'function') {
                        displayMessage('Erro ao iniciar gravação: ' + error.message, 'error');
                    } else {
                        alert('Erro ao iniciar gravação: ' + error.message);
                    }
                }
            } else {
                try {
                    recognition.stop();
                    ouvindo = false;
                    botaoMic.classList.remove('gravando');

                    if (typeof displayMessage === 'function') {
                        displayMessage('✅ Gravação finalizada!', 'success');
                    }
                } catch (error) {
                    console.error('❌ Erro ao parar gravação:', error);
                }
            }
        });

        recognition.addEventListener('result', (event) => {
            const resultado = event.results[event.results.length - 1];
            const texto = resultado[0].transcript.trim();
            const confianca = (resultado[0].confidence * 100).toFixed(1);

            campoTexto.value += (campoTexto.value ? ' ' : '') + texto;
        });

        recognition.addEventListener('end', () => {
            if (ouvindo) {
                try {
                    recognition.start();
                } catch (error) {
                    console.error('❌ Erro ao reiniciar:', error);
                    ouvindo = false;
                    botaoMic.classList.remove('gravando');
                }
            }
        });

        recognition.addEventListener('error', (event) => {
            console.error('❌ Erro no reconhecimento:', event.error);
            console.error('Detalhes completos:', event);

            let mensagem = 'Erro no reconhecimento de voz';

            switch (event.error) {
                case 'no-speech':
                    mensagem = '🔇 Nenhuma fala detectada. Tente novamente.';
                    break;
                case 'audio-capture':
                    mensagem = '🎤 Microfone não encontrado ou sem permissão.';
                    break;
                case 'not-allowed':
                    mensagem = '🚫 Permissão de microfone negada. Permita nas configurações do navegador.';
                    break;
                case 'network':
                    mensagem = '🌐 Erro de rede. Verifique sua conexão.';
                    break;
                case 'aborted':
                    mensagem = '⏹️ Reconhecimento abortado.';
                    break;
                case 'service-not-allowed':
                    mensagem = '🔒 Serviço de reconhecimento não permitido. Use HTTPS ou localhost.';
                    break;
            }

            if (typeof displayMessage === 'function') {
                displayMessage(mensagem, 'error');
            } else {
                alert(mensagem);
            }

            ouvindo = false;
            botaoMic.classList.remove('gravando');
        });
    });
}
