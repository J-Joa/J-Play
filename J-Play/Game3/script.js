let mode = 5;
let timeLeft = 30.00;
let isPaused = true;
let isGameOver = false;
let timerInterval;
let rewards = [];
let selectedIndex = -1;

// 사운드 로드
const sfx = {
    snip: new Audio('sounds/snip.mp3'),
    spark: new Audio('sounds/spark.mp3'),
    win: new Audio('sounds/win.mp3'),
    boom: new Audio('sounds/boom.mp3'),
    fail: new Audio('sounds/fail.mp3'),
    tension: new Audio('sounds/tension.mp3')
};

function initGame(m) {
    mode = m;
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    // 제이방 룰셋 세팅
    if (mode === 4) {
        rewards = ["baemin.png", "retry.png", "ggwang.png", "ggwang.png"];
    } else {
        rewards = ["baemin.png", "retry.png", "ggwang.png", "ggwang.png", "penalty.png"];
    }
    rewards.sort(() => Math.random() - 0.5);
    
    createButtons();
    isPaused = false;
    startTimer();
}

function createButtons() {
    const panel = document.getElementById('button-panel');
    panel.innerHTML = '';
    rewards.forEach((res, i) => {
        const btn = document.createElement('button');
        btn.className = 'wire-btn';
        btn.innerHTML = `<span class="btn-text">${i + 1}번</span><img src="${res}" class="small-res">`;
        btn.onclick = () => handleButtonClick(i, btn);
        panel.appendChild(btn);
    });
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (!isPaused && !isGameOver) {
            timeLeft -= 0.01;
            if (timeLeft <= 0) {
                timeLeft = 0;
                endGame("시간 초과! 폭발!", "penalty.png");
                sfx.boom.play();
            }
            document.getElementById('timer').innerText = timeLeft.toFixed(2);
        }
    }, 10);
}

function handleButtonClick(index, btn) {
    if (isPaused) return;

    // 게임 종료 후 나머지 결과 확인 모드
    if (isGameOver) {
        if (!btn.classList.contains('revealed')) {
            btn.classList.add('revealed');
            btn.querySelector('.btn-text').style.display = 'none';
            sfx.snip.play();
        }
        return;
    }

    // 게임 진행 중 선택
    cutWire(index, btn);
}

function cutWire(index, btn) {
    isPaused = true; // 결과 나올 때까지 일시정지
    sfx.snip.play();
    sfx.spark.play();
    sfx.tension.play();
    
    btn.disabled = true;
    btn.style.borderColor = "#ff0000";

    const svg = document.getElementById('signal-svg');
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const startX = (index * (800 / mode)) + (400 / mode);
    
    line.setAttribute("x1", startX); line.setAttribute("y1", "550");
    line.setAttribute("x2", "400"); line.setAttribute("y2", "300");
    line.setAttribute("class", "signal-line running");
    svg.appendChild(line);

    setTimeout(() => {
        sfx.spark.pause(); sfx.spark.currentTime = 0;
        sfx.tension.pause(); sfx.tension.currentTime = 0;
        applyResult(index);
        svg.innerHTML = '';
    }, 2500);
}

function applyResult(index) {
    const resultFile = rewards[index];
    const overlay = document.getElementById('message-overlay');
    const popup = document.getElementById('result-popup');

    isGameOver = true;
    popup.src = resultFile;
    popup.classList.add('show');

    if (resultFile === "baemin.png") {
        sfx.win.play();
        overlay.innerText = "배민 당첨!";
    } else if (resultFile === "penalty.png") {
        sfx.boom.play();
        document.getElementById('bomb-board').classList.add('bomb-shake');
        overlay.innerText = "벌렉!";
    } else if (resultFile === "retry.png") {
        // sfx.fail.play();
        overlay.innerText = "다시 하기! 한 번 더 가요!";
    } else {
        sfx.fail.play();
        overlay.innerText = "꽝! 다음 기회에...";
    }
    
    document.getElementById('guide-text').innerText = "다른 번호들도 눌러서 확인해보세요!";
    isPaused = false; // 버튼 클릭 가능하게 해제
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').innerText = isPaused ? "재개" : "일시정지";
}

function resetGame() {
    location.reload();
}