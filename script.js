// Horários de alerta (7h, 12h, 13h e 17h)
const ALERT_TIMES = [
    { hour: 6, minute: 50, message: "Hora de bater o ponto de entrada. Bom trabalho!" },
    { hour: 11, minute: 50, message: "Hora de bater o ponto e aproveitar sua pausa para o almoço. Bom apetite!" },
    { hour: 22, minute: 56, message: "Não esqueça de bater o ponto de volta ao trabalho. Boa tarde!" },
    { hour: 22, minute: 57, message: "Hora de bater o ponto de saída. Bom descanso!" }
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

// Inicializa o áudio após interação do usuário
function initAudio() {
    if (audioInitialized) return;

    try {
        // Toca um áudio baixinho e pausa logo em seguida
        alarmSound.volume = 0.01;
        const playPromise = alarmSound.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                setTimeout(() => {
                    alarmSound.pause();
                    alarmSound.currentTime = 0;
                    alarmSound.volume = 1.0; // restaura volume
                    audioInitialized = true;
                    console.log("Áudio desbloqueado com sucesso.");
                }, 100);
            }).catch(err => {
                console.log("Falha ao tentar desbloquear áudio:", err);
            });
        }
    } catch (error) {
        console.error("Erro ao inicializar áudio:", error);
    }
}

// Garante desbloqueio no primeiro clique ou tecla
function enableAudioOnInteraction() {
    if (!audioInitialized) {
        initAudio();
    }
    // Remove listeners depois de desbloquear
    document.removeEventListener('click', enableAudioOnInteraction);
    document.removeEventListener('keydown', enableAudioOnInteraction);
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
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.loop = true;

    const playPromise = alarmSound.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Reprodução automática impedida, tentando novamente...");
            setTimeout(() => {
                alarmSound.play().catch(e => {
                    console.log("Falha ao reproduzir som:", e);
                });
            }, 300);
        });
    }
    
    alarmTimeout = setTimeout(() => {
        stopAlarm();
    }, 10000);
}

// Para o alarme
function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alarmSound.loop = false;
    
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
    
    body.style.background = 'linear-gradient(135deg, #8A0303, #B20600, #FF0000)';
    
    playAlarm();
    
    let secondsLeft = 15;
    
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
    
    stopAlarm();
    
    body.style.background = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';
}

// Inicialização
function init() {
    updateClock();
    setInterval(updateClock, 1000);

    // Desbloqueia áudio na primeira interação
    document.addEventListener('click', enableAudioOnInteraction);
    document.addEventListener('keydown', enableAudioOnInteraction);
    
    const customLogo = localStorage.getItem('companyLogo');
    if (customLogo) {
        document.getElementById('company-logo').src = customLogo;
    }
    
    stopAlarmButton.addEventListener('click', stopAlarm);
}

document.addEventListener('DOMContentLoaded', init);

// Força um alerta no modo dev
document.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') {
        showAlert("Mensagem de teste do alerta de ponto!");
    }
    if (e.key === 's' || e.key === 'S') {
        stopAlarm();
    }
});
