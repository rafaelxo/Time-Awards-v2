document.addEventListener('DOMContentLoaded', () => {
    const btnFoto = document.getElementById('btn-foto');
    const btnAnexar = document.getElementById('btn-anexar');
    const textareaPrompt = document.querySelector('.input-prompt');

    function msg(texto, tipo = 'info') {
        if (typeof displayMessage === 'function') {
            displayMessage(texto, tipo);
        }
    }

    if (btnFoto) {
        btnFoto.addEventListener('click', async (e) => {
            e.preventDefault();
            abrirCameraAoVivo();
        });
    }

    async function abrirCameraAoVivo() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            msg('❌ Seu navegador não suporta acesso à câmera.\n\nUse Chrome, Edge ou Firefox atualizado.', 'error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            const overlay = document.createElement('div');
            overlay.id = 'camera-overlay';
            overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #000;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `;

            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;
            video.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
      `;

            const controles = document.createElement('div');
            controles.style.cssText = `
        position: absolute;
        bottom: 40px;
        display: flex;
        gap: 20px;
        z-index: 1000000;
      `;

            const btnCapturar = document.createElement('button');
            btnCapturar.innerHTML = '<i class="fa-solid fa-camera"></i> CAPTURAR';
            btnCapturar.style.cssText = `
        padding: 20px 40px;
        font-size: 18px;
        background: #16a34a;
        color: white;
        border: none;
        border-radius: 50px;
        font-weight: bold;
        box-shadow: 0 6px 25px rgba(0,0,0,0.5);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Poppins', sans-serif;
      `;

            const btnFechar = document.createElement('button');
            btnFechar.innerHTML = '<i class="fa-solid fa-times"></i>';
            btnFechar.style.cssText = `
        width: 60px;
        height: 60px;
        font-size: 24px;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 6px 25px rgba(0,0,0,0.5);
      `;

            controles.appendChild(btnCapturar);
            controles.appendChild(btnFechar);
            overlay.appendChild(video);
            overlay.appendChild(controles);
            document.body.appendChild(overlay);

            const fechar = () => {
                stream.getTracks().forEach(track => track.stop());
                overlay.remove();
            };

            btnFechar.onclick = fechar;

            btnCapturar.onclick = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);

                fechar();

                canvas.toBlob((blob) => {
                    processarOCR(blob);
                }, 'image/jpeg', 0.95);
            };

        } catch (err) {
            console.error('Erro ao abrir câmera:', err);

            let mensagem = '❌ Não foi possível abrir a câmera.\n\n';

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                mensagem += '🔒 Você negou a permissão.\n\nPermita o acesso à câmera nas configurações do navegador.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                mensagem += '📷 Nenhuma câmera encontrada.\n\nConecte uma webcam ou use um dispositivo com câmera.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                mensagem += '⚠️ Câmera está sendo usada por outro aplicativo.\n\nFeche outros apps e tente novamente.';
            } else {
                mensagem += `Erro: ${err.message}`;
            }

            msg(mensagem, 'error');
        }
    }

    if (btnAnexar) {
        btnAnexar.addEventListener('click', (e) => {
            e.preventDefault();
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) processarOCR(file);
            };
            input.click();
        });
    }

    async function processarOCR(fileOrBlob) {
        if (!window.Tesseract) {
            msg('❌ Biblioteca OCR não carregada. Recarregue a página.', 'error');
            return;
        }

        msg('🔍 Lendo texto da imagem... (~5-10s)', 'info');

        btnFoto.disabled = true;
        btnAnexar.disabled = true;
        const iconFoto = btnFoto.innerHTML;
        const iconAnexar = btnAnexar.innerHTML;
        btnFoto.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btnAnexar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const imagemOtimizada = await redimensionar(fileOrBlob, 1400);

            const { data: { text } } = await Tesseract.recognize(
                imagemOtimizada,
                'por+eng'
            );

            if (!text || text.trim().length < 3) {
                msg('⚠️ Não encontrei texto legível.\n\n✓ Fundo claro\n✓ Texto nítido\n✓ Boa luz', 'error');
                return;
            }

            const textoLimpo = text
                .split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0)
                .join('\n')
                .trim();

            textareaPrompt.value = textoLimpo;
            textareaPrompt.dispatchEvent(new Event('input', { bubbles: true }));

            textareaPrompt.style.transition = 'background-color 0.3s';
            textareaPrompt.style.backgroundColor = '#fef3c7';
            setTimeout(() => {
                textareaPrompt.style.backgroundColor = '';
            }, 2000);

            textareaPrompt.scrollIntoView({ behavior: 'smooth', block: 'center' });
            textareaPrompt.focus();

            const preview = textoLimpo.length > 80 ? textoLimpo.slice(0, 80) + '...' : textoLimpo;
            msg(`✅ Texto extraído!\n\n"${preview}"\n\n👉 Clique em ✈️ para processar`, 'success');

        } catch (err) {
            console.error('Erro OCR:', err);
            msg(`❌ Erro: ${err.message || 'Falha ao processar'}`, 'error');
        } finally {
            btnFoto.disabled = false;
            btnAnexar.disabled = false;
            btnFoto.innerHTML = iconFoto;
            btnAnexar.innerHTML = iconAnexar;
        }
    }

    function redimensionar(file, maxSize) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
                    const w = Math.round(img.width * ratio);
                    const h = Math.round(img.height * ratio);

                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);

                    resolve(canvas.toDataURL('image/jpeg', 0.92));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
});
