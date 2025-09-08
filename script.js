// Horários de alerta
const ALERT_TIMES = [
    { hour: 6, minute: 50, message: "Hora de bater o ponto de entrada. Bom trabalho!" },
    { hour: 11, minute: 50, message: "Hora de bater o ponto e aproveitar sua pausa para o almoço. Bom apetite!" },
    { hour: 13, minute: 0, message: "Hora de bater o ponto de volta ao trabalho. Boa tarde!" },
    { hour: 16, minute: 44, message: "Hora de bater o ponto de saída. Bom descanso!" }
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
const enableSoundButton = document.getElementById('enable-sound');
const body = document.body;

// Variáveis de controle
let alarmTimeout;
let countdownInterval;
let soundEnabled = false; // controle da permissão de som

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
    if (!soundEnabled) {
        console.log("Som não habilitado pelo usuário.");
        return;
    }

    alarmSound.loop = true;
    const playPromise = alarmSound.play();

    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Reprodução automática bloqueada pelo navegador.");
        });
    }

    alarmTimeout = setTimeout(() => {
        stopAlarm();
    }, 10000); // 10 segundos
}

// Para o alarme
function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    
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
    
    let secondsLeft = 1200; // 20 minutos
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
    
    const customLogo = localStorage.getItem('companyLogo');
    if (customLogo) {
        document.getElementById('company-logo').src = customLogo;
    }
    
    stopAlarmButton.addEventListener('click', stopAlarm);

    // Habilitar som
    enableSoundButton.addEventListener('click', () => {
        alarmSound.play().then(() => {
            alarmSound.pause();
            alarmSound.currentTime = 0;
            soundEnabled = true;
            enableSoundButton.style.display = "none";
            alert("Som ativado! Agora os alertas vão tocar.");
        }).catch(err => {
            console.log("Erro ao habilitar som:", err);
        });
    });
}

// Inicia a aplicação
document.addEventListener('DOMContentLoaded', init);

// Para desenvolvimento: teclas rápidas
document.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') {
        showAlert("Mensagem de teste do alerta de ponto!");
    }
    if (e.key === 's' || e.key === 'S') {
        stopAlarm();
    }
});
