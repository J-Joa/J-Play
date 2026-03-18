const { Engine, Render, Runner, Bodies, Composite, Body, World } = Matter;

let engine, render, runner, capsules = [];
let PENALTY_LIST = [];
let currentResult = "";
let isSpinning = false;

// 1124.jpg 기준 유리 통 위치
const machineCenterX = 225; 
const machineCenterY = 230; 
const machineRadius = 175;  

function initPhysics() {
    engine = Engine.create();
    
    // 물리 엔진 정밀도 향상 (캡슐 겹침으로 인한 멈춤 방지)
    engine.positionIterations = 15;
    engine.velocityIterations = 15;

    const container = document.getElementById('machine-wrap');
    render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: 450,
            height: 500,
            wireframes: false,
            background: 'transparent'
        }
    });

    const segments = 72; 
    const walls = [];
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        walls.push(Bodies.rectangle(
            machineCenterX + Math.cos(angle) * machineRadius, 
            machineCenterY + Math.sin(angle) * machineRadius, 
            120, 50, { // 벽을 더 두껍게 해서 절대 못 나가게 함
                isStatic: true, 
                angle: angle + Math.PI / 2, 
                render: { visible: false },
                restitution: 0.1
            }
        ));
    }
    const ceiling = Bodies.rectangle(machineCenterX, machineCenterY - 150, 450, 100, { isStatic: true, render: { visible: false } });

    Composite.add(engine.world, [...walls, ceiling]);
    Render.run(render);
    runner = Runner.create();
    Runner.run(runner, engine);
}

function updatePenalties() {
    const input = document.getElementById('penalty-input').value;
    if (!input.trim()) return;

    const rawItems = input.split(',').map(item => item.trim()).filter(v => v !== "");
    let finalItems = [];
    rawItems.forEach(item => {
        if (item.includes('*')) {
            const [name, countStr] = item.split('*');
            const count = parseInt(countStr);
            if (!isNaN(count)) for (let i = 0; i < count; i++) finalItems.push(name.trim());
            else finalItems.push(item);
        } else finalItems.push(item);
    });

    PENALTY_LIST = finalItems;
    
    capsules.forEach(c => World.remove(engine.world, c));
    capsules = [];

    // 개수가 많아지면 크기를 줄여 압박 해소
    let capsuleSize = PENALTY_LIST.length > 80 ? 12 : (PENALTY_LIST.length > 40 ? 16 : 20);
    let spriteScale = PENALTY_LIST.length > 80 ? 0.07 : (PENALTY_LIST.length > 40 ? 0.09 : 0.12);

    PENALTY_LIST.forEach(() => {
        const c = Bodies.circle(
            machineCenterX + (Math.random()-0.5)*120, 
            machineCenterY + (Math.random()-0.5)*60, 
            capsuleSize, { 
                render: { sprite: { texture: 'capsule_closed.png', xScale: spriteScale, yScale: spriteScale } },
                restitution: 0.4, // 적당한 탄성
                friction: 0.05,
                density: 0.001
            }
        );
        capsules.push(c);
    });
    
    Composite.add(engine.world, capsules);
    document.getElementById('status-message').innerText = `총 ${PENALTY_LIST.length}개 준비 완료!`;
}

// ... 상단 변수 및 initPhysics 동일 ...

// ★ 섞기 기능 대폭 강화: 무중력 점프 & 랜덤 회전
function shufflePenalties() {
    if (PENALTY_LIST.length === 0 || capsules.length === 0) return;
    
    // 리스트 데이터 자체를 먼저 무작위로 섞음
    PENALTY_LIST.sort(() => Math.random() - 0.5);
    
    // 중력을 잠시 0으로 만듦 (0.5초 동안)
    engine.gravity.y = 0;
    
    capsules.forEach(c => {
        // 1. 강제로 물리 연산 활성화
        Body.setStatic(c, false);
        
        // 2. 위쪽 방향으로 확 떠오르게 하는 힘 (폭발 효과)
        const jumpForce = (Math.random() * 0.05 + 0.02) * c.mass;
        // 3. 좌우로 흩어지는 힘
        const sideForce = (Math.random() - 0.5) * 0.04 * c.mass;
        
        Body.applyForce(c, c.position, { 
            x: sideForce, 
            y: -jumpForce // 마이너스 방향이 위쪽
        });

        // 4. 회전력 추가 (캡슐이 뱅글뱅글 돌게 함)
        Body.setAngularVelocity(c, (Math.random() - 0.5) * 0.5);
    });

    // 0.5초 후에 중력을 다시 원래대로(1) 복구
    setTimeout(() => {
        engine.gravity.y = 1;
        document.getElementById('status-message').innerText = "캡슐을 시원하게 섞었습니다!";
    }, 500);

    document.getElementById('status-message').innerText = "캡슐 섞는 중...";
}

function rotateLever() {
    if (isSpinning || PENALTY_LIST.length === 0) return;
    isSpinning = true;
    
    document.getElementById('machine-lever').style.transform = "rotate(360deg)";
    currentResult = PENALTY_LIST.pop();

    if (capsules.length > 0) {
        const c = capsules.pop();
        World.remove(engine.world, c);
    }

    setTimeout(() => {
        document.getElementById('machine-lever').style.transform = "rotate(0deg)";
        showCapsule();
    }, 1200);
}

function showCapsule() {
    document.getElementById('result-display').style.display = "flex";
    document.getElementById('capsule-wrap').classList.add('dropping');
    document.getElementById('status-message').innerText = `남은 캡슐: ${PENALTY_LIST.length}개`;
}

function openCapsule() {
    const img = document.getElementById('display-capsule');
    const content = document.getElementById('capsule-content');
    if (img.src.includes("capsule_open.png")) return;
    img.src = "capsule_open.png";
    content.innerText = currentResult;
    content.style.display = "block";
    document.getElementById('button-group').style.display = "flex";
}

function resetGame() {
    document.getElementById('result-display').style.display = "none";
    document.getElementById('capsule-wrap').classList.remove('dropping');
    document.getElementById('display-capsule').src = "capsule_closed.png";
    document.getElementById('capsule-content').style.display = "none";
    document.getElementById('button-group').style.display = "none";
    isSpinning = false;
}

function startNewGame() {
    PENALTY_LIST = [];
    document.getElementById('penalty-input').value = "";
    document.getElementById('status-message').innerText = "내용을 입력하고 저장해주세요.";
    resetGame();
    capsules.forEach(c => World.remove(engine.world, c));
    capsules = [];
}

window.onload = initPhysics;