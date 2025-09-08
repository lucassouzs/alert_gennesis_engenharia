// Horários de alerta (7h, 12h, 13h e 17h)
const ALERT_TIMES = [
    { hour: 6, minute: 50, message: "Hora de bater o ponto de entrada. Bom trabalho!" },
    { hour: 11, minute: 50, message: "Hora de bater o ponto e aproveitar sua pausa para o almoço. Bom apetite!" },
    { hour: 12, minute: 50, message: "Não esqueça de bater o ponto de volta ao trabalho. Boa tarde!" },
    { hour: 16, minute: 50, message: "Hora de bater o ponto de saída. Bom descanso!" }
];

// Elementos DOM
const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const normalMessage = document.getElementById('normal-message');
const alertMessage = document.getElementById('alert-message');
const specificMessage = document.getElementById('specific-message');
const timerElement = document.getElementById('timer');
const alarmSound = document.getElementById('alarm-sound');
const stopAlarmButton = document.getElementById('stop-alarm');
const body = document.body;

// Variáveis de controle
let alarmTimeout;
let countdownInterval;
let audioInitialized = false;

// Inicializa o áudio para permitir reprodução automática
function initAudio() {
    if (audioInitialized) return;
    
    // Toca e pausa imediatamente para "destravar" o áudio
    alarmSound.volume = 0.01; // Volume quase mudo
    const playPromise = alarmSound.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Pausa imediatamente após iniciar
            setTimeout(() => {
                alarmSound.pause();
                alarmSound.currentTime = 0;
                alarmSound.volume = 1.0; // Restaura volume normal
                audioInitialized = true;
            }, 100);
        }).catch(error => {
            console.log("Inicialização de áudio falhou:", error);
            alarmSound.volume = 1.0;
            audioInitialized = true;
        });
    }
}

// Atualiza o relógio
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR');
    const date = now.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    timeElement.textContent = time;
    dateElement.textContent = date.charAt(0).toUpperCase() + date.slice(1);
    
    checkForAlerts(now);
}

// Verifica se é hora de exibir alerta
function checkForAlerts(now) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Verifica cada horário de alerta
    for (const alertTime of ALERT_TIMES) {
        if (currentHour === alertTime.hour && 
            currentMinute === alertTime.minute && 
            currentSecond === 0) {
            
            showAlert(alertTime.message);
            break;
        }
    }
}

// Toca o alarme por 10 segundos
function playAlarm() {
    // Para e reinicia o áudio
    alarmSound.pause();
    alarmSound.currentTime = 0;
    
    // Configura o áudio para tocar em loop
    alarmSound.loop = true;
    
    // Tenta tocar o áudio com uma promessa
    const playPromise = alarmSound.play();
    
    // Se a reprodução for bloqueada, tenta novamente após pequeno delay
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Tentativa de reprodução automática impedida. Tentando novamente...");
            
            // Tenta novamente após um pequeno delay
            setTimeout(() => {
                alarmSound.play().catch(e => {
                    console.log("Segunda tentativa falhou:", e);
                    
                    // Força a reprodução silenciando e dessilenciando
                    alarmSound.muted = true;
                    const forcedPlay = alarmSound.play();
                    
                    if (forcedPlay !== undefined) {
                        forcedPlay.then(() => {
                            alarmSound.muted = false;
                        }).catch(e => {
                            console.log("Não foi possível reproduzir o áudio automaticamente");
                        });
                    }
                });
            }, 300);
        });
    }
    
    // Para o alarme automaticamente após 10 segundos
    alarmTimeout = setTimeout(() => {
        stopAlarm();
    }, 10000);
}

// Para o alarme
function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.loop = false;
    
    // Limpa o timeout do alarme se existir
    if (alarmTimeout) {
        clearTimeout(alarmTimeout);
    }
}

// Exibe o alerta
function showAlert(message) {
    specificMessage.textContent = message;
    alertMessage.classList.add('active');
    normalMessage.style.opacity = '0';
    normalMessage.style.pointerEvents = 'none';
    
    // Altera o fundo para vermelho
    body.style.background = 'linear-gradient(135deg, #8A0303, #B20600, #FF0000)';
    
    // Toca o alarme por 10 segundos
    playAlarm();
    
    // Inicia contagem regressiva de 20 minutos (1200 segundos)
    let secondsLeft = 1200;
    
    countdownInterval = setInterval(() => {
        secondsLeft--;
        
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            hideAlert();
        }
    }, 1000);
}

// Esconde o alerta
function hideAlert() {
    alertMessage.classList.remove('active');
    normalMessage.style.opacity = '1';
    normalMessage.style.pointerEvents = 'auto';
    
    // Para o alarme
    stopAlarm();
    
    // Restaura o gradiente original
    body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';
}

// Inicialização
function init() {
    initAudio(); // Inicializa o áudio para reprodução automática
    updateClock();
    setInterval(updateClock, 1000);
    
    // Verifica se há uma logo personalizada no localStorage
    const customLogo = localStorage.getItem('companyLogo');
    if (customLogo) {
        document.getElementById('company-logo').src = customLogo;
    }
    
    // Configura o botão de parar alarme
    stopAlarmButton.addEventListener('click', stopAlarm);
}

// Inicia a aplicação
document.addEventListener('DOMContentLoaded', init);

// Para desenvolvimento: força um alerta ao pressionar a tecla 'A'
document.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') {
        showAlert("Mensagem de teste do alerta de ponto!");
    }
    
    // Para o alarme com a tecla 'S'
    if (e.key === 's' || e.key === 'S') {
        stopAlarm();
    }
});