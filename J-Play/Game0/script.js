let shots = 0;
const maxShots = 3;
let used = [];
let prizesWon = [];

// 보상/꽝 배열 (게임 시작 시 섞임)
let prizes = ["따릉이","할리홀스","듀얼라이더","샤이보이","플바오","하리보테","적토마","핫가이","플레이보이","킹콩"];
prizes.sort(() => Math.random() - 0.5); // 실행할 때마다 섞임

function updateInfo() {
  document.getElementById('total').innerText = prizes.length;
  document.getElementById('shots').innerText = shots;
  document.getElementById('max').innerText = maxShots;
}

function shoot() {
  if (shots === 0) {
    fireLaser();
    shots++;
    updateInfo();
    checkFinalResult();
  }
}

function shootExtra() {
  if (shots < maxShots) {
    fireLaser();
    shots++;
    updateInfo();
    checkFinalResult();
  }
}

function fireLaser() {
  const slots = document.querySelectorAll('.slot');
  let available = [];
  for (let i=0; i<prizes.length; i++) {
    if (!used.includes(i)) available.push(i);
  }

  if (available.length === 0) {
    document.getElementById('result').innerText = "남은 칸 없음";
    return;
  }

  const winnerIndex = Math.floor(Math.random() * available.length);
  const winner = available[winnerIndex];
  used.push(winner);

  const prize = prizes[winner];
  slots[winner].innerText = prize; // 발사된 칸만 공개

  if (prize !== "꽝") {
    prizesWon.push(prize);
    slots[winner].classList.add('winner');
    document.getElementById('result').innerText = `당첨: ${prize}`;
  } else {
    slots[winner].classList.add('fail-effect');
    document.getElementById('result').innerText = "꽝입니다!";
  }
}

function checkFinalResult() {
  if (shots === maxShots) {
    if (prizesWon.length === 0) {
      document.getElementById('result').innerText = "이번 라운드 당첨자 없음 (모두 꽝)";
    }
  }
}

function showAllResults() {
  const slots = document.querySelectorAll('.slot');
  prizes.forEach((p, i) => {
    slots[i].innerText = p; // 모든 칸 공개
  });
}

updateInfo();