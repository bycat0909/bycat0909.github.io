const elements = {
  setupScreen: document.querySelector('#setup-screen'), gameScreen: document.querySelector('#game-screen'), reportScreen: document.querySelector('#report-screen'),
  grade: document.querySelector('#grade'), questionCount: document.querySelector('#question-count'), gradeDescription: document.querySelector('#grade-description'),
  startButton: document.querySelector('#start-button'), progress: document.querySelector('#progress'), correctCount: document.querySelector('#correct-count'),
  wrongCount: document.querySelector('#wrong-count'), gradeBadge: document.querySelector('#grade-badge'), left: document.querySelector('#left'),
  right: document.querySelector('#right'), operator: document.querySelector('#operator'), answer: document.querySelector('#answer'),
  submitButton: document.querySelector('#submit-button'), giveUpButton: document.querySelector('#give-up-button'), nextButton: document.querySelector('#next-button'),
  message: document.querySelector('#message'), time: document.querySelector('#time'), totalTime: document.querySelector('#total-time'),
  reportCorrect: document.querySelector('#report-correct'), reportUnsolved: document.querySelector('#report-unsolved'), reportBody: document.querySelector('#report-body'),
  unsolvedSection: document.querySelector('#unsolved-section'), unsolvedList: document.querySelector('#unsolved-list'), restartButton: document.querySelector('#restart-button'),
  printButton: document.querySelector('#print-button')
};

const gradeRules = {
  1: { operations: ['+', '−'], description: '20 이하의 수로 덧셈과 뺄셈을 연습해요.', addMax: 20 },
  2: { operations: ['+', '−', '×'], description: '100 이하의 덧셈·뺄셈과 구구단을 연습해요.', addMax: 100, multiply: [[2, 9], [2, 9]] },
  3: { operations: ['+', '−', '×', '÷'], description: '세 자리 수 계산과 한 자리 수 곱셈·나눗셈을 연습해요.', addMax: 1000, multiply: [[10, 99], [2, 9]], divide: [[2, 20], [2, 9]] },
  4: { operations: ['+', '−', '×', '÷'], description: '네 자리 수 계산과 두 자리 수가 포함된 곱셈·나눗셈을 연습해요.', addMax: 10000, multiply: [[10, 999], [10, 99]], divide: [[10, 99], [2, 9]] },
  5: { operations: ['+', '−', '×', '÷'], description: '여섯 자리 수 계산과 큰 수의 곱셈·나눗셈에 도전해요.', addMax: 1000000, multiply: [[100, 999], [10, 99]], divide: [[10, 999], [10, 99]] },
  6: { operations: ['+', '−', '×', '÷'], description: '일곱 자리 수와 여러 자리 곱셈·나눗셈으로 실력을 다져요.', addMax: 10000000, multiply: [[1000, 9999], [100, 999]], divide: [[100, 999], [10, 99]] }
};

const state = { grade: 3, totalQuestions: 10, currentIndex: 0, correctCount: 0, totalWrongAttempts: 0, currentWrongAttempts: 0, problemStartedAt: 0, problem: null, records: [], answered: false };

function randomInteger(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFrom(items) { return items[randomInteger(0, items.length - 1)]; }
function expression(problem) { return `${problem.left} ${problem.operator} ${problem.right}`; }
function formatSeconds(milliseconds) { return `${(milliseconds / 1000).toFixed(1)}초`; }

function createProblem() {
  const rule = gradeRules[state.grade];
  const operator = randomFrom(rule.operations);
  if (operator === '+') {
    const answer = randomInteger(2, rule.addMax);
    const left = randomInteger(1, answer - 1);
    return { left, right: answer - left, operator, answer };
  }
  if (operator === '−') {
    const left = randomInteger(1, rule.addMax);
    const right = randomInteger(0, left);
    return { left, right, operator, answer: left - right };
  }
  if (operator === '×') {
    const left = randomInteger(...rule.multiply[0]);
    const right = randomInteger(...rule.multiply[1]);
    return { left, right, operator, answer: left * right };
  }
  const answer = randomInteger(...rule.divide[0]);
  const right = randomInteger(...rule.divide[1]);
  return { left: answer * right, right, operator, answer };
}

function updateGradeDescription() { elements.gradeDescription.textContent = gradeRules[Number(elements.grade.value)].description; }
function renderProgress() {
  elements.progress.textContent = `${state.currentIndex + 1} / ${state.totalQuestions}`;
  elements.correctCount.textContent = state.correctCount;
  elements.wrongCount.textContent = state.totalWrongAttempts;
}
function showScreen(screen) {
  elements.setupScreen.hidden = screen !== 'setup'; elements.gameScreen.hidden = screen !== 'game'; elements.reportScreen.hidden = screen !== 'report';
}
function startSession() {
  state.grade = Number(elements.grade.value); state.totalQuestions = Number(elements.questionCount.value); state.currentIndex = 0;
  state.correctCount = 0; state.totalWrongAttempts = 0; state.currentWrongAttempts = 0; state.records = []; state.answered = false;
  elements.gradeBadge.textContent = `${state.grade}학년 · ${gradeRules[state.grade].description}`;
  showScreen('game'); loadProblem();
}
function loadProblem() {
  state.problem = createProblem(); state.currentWrongAttempts = 0; state.problemStartedAt = performance.now(); state.answered = false;
  elements.left.textContent = state.problem.left; elements.right.textContent = state.problem.right; elements.operator.textContent = state.problem.operator;
  elements.answer.value = ''; elements.answer.disabled = false; elements.submitButton.hidden = false; elements.giveUpButton.hidden = false;
  elements.nextButton.hidden = true; elements.message.textContent = '횟수 제한 없이 답을 제출할 수 있어요.'; elements.message.className = 'message'; elements.time.textContent = '';
  renderProgress(); elements.answer.focus();
}
function recordProblem(solved) {
  const elapsedMilliseconds = performance.now() - state.problemStartedAt;
  state.records.push({ number: state.currentIndex + 1, expression: expression(state.problem), answer: state.problem.answer, elapsedMilliseconds, wrongAttempts: state.currentWrongAttempts, solved });
  state.answered = true; elements.answer.disabled = true; elements.submitButton.hidden = true; elements.giveUpButton.hidden = true; elements.nextButton.hidden = false;
  elements.nextButton.innerHTML = state.currentIndex === state.totalQuestions - 1 ? '결과 보기 <span aria-hidden="true">📊</span>' : '다음 문제 <span aria-hidden="true">➡️</span>';
  elements.time.textContent = `⏱️ 이 문제를 푸는 데 ${formatSeconds(elapsedMilliseconds)} 걸렸어요.`;
  renderProgress(); elements.nextButton.focus();
}
function submitAnswer() {
  if (state.answered) return;
  const value = elements.answer.value.trim();
  if (value === '' || !Number.isInteger(Number(value)) || Number(value) < 0) { elements.message.textContent = '0 이상의 정수를 입력해 주세요.'; elements.answer.focus(); return; }
  if (Number(value) === state.problem.answer) {
    state.correctCount += 1; elements.message.textContent = '정답이에요! 정말 잘했어요! 🎉'; elements.message.className = 'message success'; recordProblem(true); return;
  }
  state.currentWrongAttempts += 1; state.totalWrongAttempts += 1; renderProgress();
  elements.message.textContent = `${state.currentWrongAttempts}번째 오답이에요. 천천히 다시 생각해 보세요!`;
  elements.message.className = 'message'; elements.answer.select();
}
function giveUpProblem() {
  if (state.answered || !window.confirm('이 문제를 포기하고 다음으로 넘어갈까요?')) return;
  elements.message.textContent = `정답은 ${state.problem.answer}이에요. 다음에 다시 도전해요!`;
  elements.message.className = 'message'; recordProblem(false);
}
function goNext() {
  if (!state.answered) return;
  if (state.currentIndex === state.totalQuestions - 1) { showReport(); return; }
  state.currentIndex += 1; loadProblem();
}
function appendCell(row, value, className = '') {
  const cell = document.createElement('td'); cell.textContent = value; if (className) cell.className = className; row.appendChild(cell);
}
function showReport() {
  showScreen('report'); elements.reportBody.replaceChildren(); elements.unsolvedList.replaceChildren();
  const totalMilliseconds = state.records.reduce((sum, record) => sum + record.elapsedMilliseconds, 0);
  const unsolved = state.records.filter(record => !record.solved);
  elements.totalTime.textContent = formatSeconds(totalMilliseconds); elements.reportCorrect.textContent = `${state.correctCount}개`; elements.reportUnsolved.textContent = `${unsolved.length}개`;
  state.records.forEach(record => {
    const row = document.createElement('tr'); appendCell(row, record.number); appendCell(row, `${record.expression} =`); appendCell(row, formatSeconds(record.elapsedMilliseconds));
    appendCell(row, `${record.wrongAttempts}회`); appendCell(row, record.answer); appendCell(row, record.solved ? '정답' : '포기', record.solved ? 'result-correct' : 'result-give-up'); elements.reportBody.appendChild(row);
  });
  elements.unsolvedSection.hidden = unsolved.length === 0;
  unsolved.forEach(record => { const item = document.createElement('li'); item.textContent = `${record.expression} = ${record.answer}`; elements.unsolvedList.appendChild(item); });
  elements.restartButton.focus();
}
function restart() { showScreen('setup'); updateGradeDescription(); elements.startButton.focus(); }

elements.grade.addEventListener('change', updateGradeDescription); elements.startButton.addEventListener('click', startSession);
elements.submitButton.addEventListener('click', submitAnswer); elements.giveUpButton.addEventListener('click', giveUpProblem); elements.nextButton.addEventListener('click', goNext);
elements.restartButton.addEventListener('click', restart); elements.printButton.addEventListener('click', () => window.print());
elements.answer.addEventListener('keydown', event => { if (event.key === 'Enter') submitAnswer(); });
updateGradeDescription(); showScreen('setup');
