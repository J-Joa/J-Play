let currentCount = 0;
let targetCount = 0;
let urgentStartCount = 0;
let isGameOver = true;
let players = [];
let currentPlayerIndex = 0;

const sfx = {
    tick: new Audio('sounds/tick.mp3'),
    danger: new Audio('sounds/danger.mp3'),
    boom: new Audio('sounds/boom.mp3')
};

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}

function saveSettings() {
    const listText = document.getElementById('player-list-input').value;
    players = listText.split('\n').map(n => n.trim()).filter(n => n !== "");
    
    currentPlayerIndex = 0;
    updatePlayerListUI();
    toggleSettings();
    document.getElementById('status-message').innerText = "명단 저장 완료! 게임을 시작하세요.";
}

function shufflePlayers() {
    players.sort(() => Math.random() - 0.5);
    updatePlayerListUI();
}

function updatePlayerListUI() {
    const ul = document.getElementById('player-ul');
    const nameDisplay = document.getElementById('player-name');
    ul.innerHTML = "";

    players.forEach((name, index) => {
        const li = document.createElement('li');
        li.innerText = name;
        if (index === currentPlayerIndex) {
            li.classList.add('active-player');
            nameDisplay.innerText = name;
            li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        ul.appendChild(li);
    });
}

function startGame() {
    if (players.length === 0) {
        alert("톱니바퀴를 눌러 참가자를 먼저 등록해주세요!");
        return;
    }
    
    currentCount = 0;
    currentPlayerIndex = 0;
    isGameOver = false;

    // 1. 벌칙 숫자 결정: 20 ~ 80 사이 랜덤
    const inputVal = document.getElementById('target-input').value;
    targetCount = inputVal ? parseInt(inputVal) : Math.floor(Math.random() * 61) + 20;
    
    // 2. 긴박 시점 결정: 벌칙 숫자 4 ~ 12단계 전 중 랜덤
    const gap = Math.floor(Math.random() * 9) + 4;
    urgentStartCount = targetCount - gap;

    console.log("목표:", targetCount, "긴박시점:", urgentStartCount); // 테스트용 로그

    // 초기 UI
    document.getElementById('counter-display').innerText = currentCount;
    document.getElementById('dynamite-img').src = 'dynamite_idle.png';
    document.getElementById('explosion-img').style.display = 'none';
    document.getElementById('status-message').innerText = "폭탄 돌리기 시작!";
    document.getElementById('status-message').style.color = "#00ffcc";
    
    updatePlayerListUI();
}

function addCount(val) {
    if (isGameOver) return;

    currentCount += val;
    document.getElementById('counter-display').innerText = currentCount;
    
    if (currentCount >= targetCount) {
        explode();
    } else {
        // 순서 넘기기
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updatePlayerListUI();
        
        // 연출 변화 체크
        if (currentCount >= urgentStartCount) {
            sfx.danger.play();
            document.getElementById('dynamite-img').src = 'dynamite_urgent.png';
            document.getElementById('status-message').innerText = "조심하세요! 곧 터집니다!";
            document.getElementById('status-message').style.color = "#ffff00";
        } else {
            sfx.tick.play();
        }
    }
}

function explode() {
    isGameOver = true;
    sfx.boom.play();
    document.getElementById('explosion-img').style.display = 'block';
    document.getElementById('counter-display').innerText = "BOOM!";
    document.getElementById('status-message').innerText = `폭발! [${players[currentPlayerIndex]}]님 당첨!`;
    document.getElementById('status-message').style.color = "#ff3300";
}