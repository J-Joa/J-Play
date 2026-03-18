let target = "", currentInput = "", len = 4, allowDup = true;

// 자리수 버튼 생성
const container = document.getElementById('length-buttons');
for(let i=4; i<=10; i++){
    let b = document.createElement('button');
    b.innerText = i;
    b.onclick = () => { len = i; updateStatus(); };
    container.appendChild(b);
}

function setDup(bool) { allowDup = bool; updateStatus(); }
function updateStatus() { document.getElementById('status-text').innerText = `${len}자리, 중복 ${allowDup ? '허용' : '불가'}`; }

function startGame() {
    target = allowDup ? [...Array(len)].map(() => Math.floor(Math.random()*10)).join('') 
                      : [...Array(10).keys()].sort(() => Math.random()-0.5).slice(0, len).join('');
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('sum-hint').innerText = target.split('').reduce((a, b) => a + parseInt(b), 0);
    console.log("정답:", target);
}

// 버튼 클릭음
const clickSound = new Audio('sounds/click.mp3');
// 정답음
const successSound = new Audio('sounds/success.mp3');

// 사운드 재생 함수 (오류 방지용)
function playSound(audio) {
    audio.pause();           // 재생 중이면 멈춤
    audio.currentTime = 0;   // 처음으로 되돌림
    audio.play().catch(e => console.log("사운드 재생 실패:", e)); 
}

// 버튼 누를 때마다
function inputNumber(num) {
    playSound(clickSound);
    // ... 기존 로직 ...
    if(currentInput.length < len) { currentInput += num; updateDisplay(); }
}

function BackSpace() { currentInput = currentInput.slice(0, -1); updateDisplay(); }

let failCount = 0;
const maxFail = 5; // 최대 5번까지 틀리면 정답 공개

function showMessage(msg, isResult = false) {
    const msgBox = document.getElementById('game-message');
    msgBox.innerText = msg;
    
    // 정답이나 정답공개인 경우 잠시 후 화면 리셋
    if (isResult) {
        setTimeout(() => {
            msgBox.innerText = "";
            location.reload(); // 정답/공개 후 게임 재시작
        }, 3000); // 3초 뒤 초기화
    }
}

function checkPassword() {
    let s = 0; // 스트라이크
    let b = 0; // 볼

    // 1. 스트라이크 판정 (위치와 숫자가 모두 같음)
    for (let i = 0; i < len; i++) {
        if (currentInput[i] === target[i]) {
            s++;
        }
    }

    // 2. 볼 판정 (숫자는 포함되지만 위치는 다름)
    for (let i = 0; i < len; i++) {
        // 스트라이크가 아닌 숫자들 중에서 target에 포함되는지 확인
        if (currentInput[i] !== target[i] && target.includes(currentInput[i])) {
            b++;
        }
    }

    // 결과 표시
    const feedbackText = `${s}S ${b}B (기회: ${maxFail - failCount})`;
    document.getElementById('feedback').innerText = feedbackText;
    
    // 정답 확인 및 기회 체크
    if (s === len) {
        playSound(successSound); // 정답 소리 재생!
        showMessage("정답입니다! 문이 열렸습니다!", true);
    } else {
        failCount++;
        if (failCount >= maxFail) {
            showMessage("실패! 정답은: " + target, true);
        } else {
            currentInput = "";
            updateDisplay();
        }
    }
}

function updateDisplay() { document.getElementById('display').innerText = "*".repeat(currentInput.length); }