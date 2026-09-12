const elements = {
  setupScreen: document.querySelector('#setup-screen'), gameScreen: document.querySelector('#game-screen'), reportScreen: document.querySelector('#report-screen'),
  grade: document.querySelector('#grade'), questionCount: document.querySelector('#question-count'), gradeDescription: document.querySelector('#grade-description'),
  startButton: document.querySelector('#start-button'), progress: document.querySelector('#progress'), correctCount: document.querySelector('#correct-count'),
  wrongCount: document.querySelector('#wrong-count'), gradeBadge: document.querySelector('#grade-badge'), questionText: document.querySelector('#question-text'),
  answer: document.querySelector('#answer'), answerHelp: document.querySelector('#answer-help'), submitButton: document.querySelector('#submit-button'),
  giveUpButton: document.querySelector('#give-up-button'), nextButton: document.querySelector('#next-button'), message: document.querySelector('#message'),
  time: document.querySelector('#time'), totalTime: document.querySelector('#total-time'), reportCorrect: document.querySelector('#report-correct'),
  reportUnsolved: document.querySelector('#report-unsolved'), reportBody: document.querySelector('#report-body'), unsolvedSection: document.querySelector('#unsolved-section'),
  unsolvedList: document.querySelector('#unsolved-list'), restartButton: document.querySelector('#restart-button'), printButton: document.querySelector('#print-button')
};

const gradeRules = {
  1: { topics: '덧셈 · 뺄셈', description: '20 이하의 수로 덧셈과 뺄셈을 연습해요.' },
  2: { topics: '구구단 · 곱셈 · 덧셈 · 뺄셈', description: '세 자리 수의 덧셈·뺄셈과 구구단, 곱셈을 연습해요.' },
  3: { topics: '나눗셈 · 분수 · 소수 · 분수의 덧셈과 뺄셈', description: '나눗셈과 분수·소수의 뜻, 분수 계산을 연습해요.' },
  4: { topics: '분수의 곱셈 · 분수의 나눗셈', description: '분수의 곱셈과 나눗셈을 기약분수로 계산해요.' },
  5: { topics: '공약수 · 최대공약수 · 공배수 · 최소공배수 · 혼합계산 · 약수 · 배수', description: '약수와 배수의 관계를 익히고 자연수의 혼합계산을 연습해요.' },
  6: { topics: '역연산 · 미지수 x · 비율 · 백분율', description: '역연산으로 미지수를 구하고 비와 백분율을 연습해요.' }
};

const state = { grade: 3, totalQuestions: 10, currentIndex: 0, correctCount: 0, totalWrongAttempts: 0, currentWrongAttempts: 0, problemStartedAt: 0, problem: null, records: [], answered: false };

function randomInteger(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFrom(items) { return items[randomInteger(0, items.length - 1)]; }
function gcd(a, b) { while (b) [a, b] = [b, a % b]; return Math.abs(a); }
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
function fraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}
function fractionText(value) { return value.denominator === 1 ? String(value.numerator) : `${value.numerator}/${value.denominator}`; }
function formatSeconds(milliseconds) { return `${(milliseconds / 1000).toFixed(1)}초`; }
function numberProblem(topic, question, answerValue, help = '숫자로 답을 입력하세요.') { return { topic, question, answerValue, answerText: String(answerValue), type: 'number', help }; }
function fractionProblem(topic, question, numerator, denominator) {
  const answer = fraction(numerator, denominator);
  return { topic, question, answerValue: answer, answerText: fractionText(answer), type: 'fraction', help: '분수는 3/4처럼 입력하세요. 같은 값을 나타내는 분수도 정답이에요.' };
}
function ratioProblem(question, left, right) {
  const divisor = gcd(left, right); const answer = { left: left / divisor, right: right / divisor };
  return { topic: '비율', question, answerValue: answer, answerText: `${answer.left}:${answer.right}`, type: 'ratio', help: '비는 2:3처럼 입력하세요.' };
}

function createGrade1Problem() {
  const operation = randomFrom(['+', '−']);
  if (operation === '+') { const answer = randomInteger(2, 20); const left = randomInteger(1, answer - 1); return numberProblem('덧셈', `${left} + ${answer - left} = ?`, answer); }
  const left = randomInteger(1, 20); const right = randomInteger(0, left); return numberProblem('뺄셈', `${left} − ${right} = ?`, left - right);
}
function createGrade2Problem() {
  const topic = randomFrom(['덧셈', '뺄셈', '구구단', '곱셈']);
  if (topic === '덧셈') { const a = randomInteger(10, 499); const b = randomInteger(10, 999 - a); return numberProblem(topic, `${a} + ${b} = ?`, a + b); }
  if (topic === '뺄셈') { const a = randomInteger(20, 999); const b = randomInteger(1, a); return numberProblem(topic, `${a} − ${b} = ?`, a - b); }
  if (topic === '구구단') { const a = randomInteger(2, 9); const b = randomInteger(2, 9); return numberProblem(topic, `${a} × ${b} = ?`, a * b); }
  const a = randomInteger(10, 99); const b = randomInteger(2, 9); return numberProblem(topic, `${a} × ${b} = ?`, a * b);
}
function createGrade3Problem() {
  const topic = randomFrom(['나눗셈', '분수', '소수', '분수의 덧셈', '분수의 뺄셈']);
  if (topic === '나눗셈') { const answer = randomInteger(2, 99); const divisor = randomInteger(2, 9); return numberProblem(topic, `${answer * divisor} ÷ ${divisor} = ?`, answer); }
  if (topic === '분수') { const denominator = randomInteger(3, 12); const numerator = randomInteger(1, denominator - 1); const factor = randomInteger(2, 5); return fractionProblem(topic, `${numerator * factor}/${denominator * factor}를 기약분수로 나타내세요.`, numerator, denominator); }
  if (topic === '소수') {
    const scale = randomFrom([10, 100]); const a = randomInteger(1, scale * 3); const b = randomInteger(1, scale * 3);
    return numberProblem(topic, `${a / scale} + ${b / scale} = ?`, (a + b) / scale, '소수로 답을 입력하세요.');
  }
  const denominator = randomInteger(3, 12);
  if (topic === '분수의 덧셈') { const a = randomInteger(1, denominator - 1); const b = randomInteger(1, denominator - 1); return fractionProblem(topic, `${a}/${denominator} + ${b}/${denominator} = ?`, a + b, denominator); }
  const a = randomInteger(2, denominator - 1); const b = randomInteger(1, a); return fractionProblem(topic, `${a}/${denominator} − ${b}/${denominator} = ?`, a - b, denominator);
}
function createGrade4Problem() {
  const topic = randomFrom(['분수의 곱셈', '분수의 나눗셈']);
  const aDenominator = randomInteger(2, 12); const aNumerator = randomInteger(1, aDenominator);
  const bDenominator = randomInteger(2, 12); const bNumerator = randomInteger(1, bDenominator);
  if (topic === '분수의 곱셈') return fractionProblem(topic, `${aNumerator}/${aDenominator} × ${bNumerator}/${bDenominator} = ?`, aNumerator * bNumerator, aDenominator * bDenominator);
  return fractionProblem(topic, `${aNumerator}/${aDenominator} ÷ ${bNumerator}/${bDenominator} = ?`, aNumerator * bDenominator, aDenominator * bNumerator);
}
function divisorCount(value) { let count = 0; for (let i = 1; i <= value; i += 1) if (value % i === 0) count += 1; return count; }
function commonDivisorCount(a, b) { return divisorCount(gcd(a, b)); }
function createGrade5Problem() {
  const topic = randomFrom(['공약수', '최대공약수', '공배수', '최소공배수', '자연수의 혼합계산', '약수', '배수']);
  const a = randomInteger(4, 48); const b = randomInteger(4, 48);
  if (topic === '공약수') return numberProblem(topic, `${a}와 ${b}의 공약수는 모두 몇 개인가요?`, commonDivisorCount(a, b));
  if (topic === '최대공약수') return numberProblem(topic, `${a}와 ${b}의 최대공약수를 구하세요.`, gcd(a, b));
  if (topic === '공배수') { const order = randomInteger(2, 5); return numberProblem(topic, `${a}와 ${b}의 ${order}번째 공배수를 구하세요.`, lcm(a, b) * order); }
  if (topic === '최소공배수') return numberProblem(topic, `${a}와 ${b}의 최소공배수를 구하세요.`, lcm(a, b));
  if (topic === '약수') { const value = randomInteger(8, 60); return numberProblem(topic, `${value}의 약수는 모두 몇 개인가요?`, divisorCount(value)); }
  if (topic === '배수') { const value = randomInteger(2, 15); const order = randomInteger(3, 10); return numberProblem(topic, `${value}의 ${order}번째 배수를 구하세요.`, value * order); }
  const first = randomInteger(5, 30); const second = randomInteger(2, 12); const third = randomInteger(2, 9);
  return numberProblem(topic, `${first} + ${second} × ${third} = ?`, first + second * third);
}
function createGrade6Problem() {
  const topic = randomFrom(['역연산', '미지수 x', '비율', '백분율']);
  if (topic === '역연산') {
    const answer = randomInteger(2, 100); const amount = randomInteger(2, 40); const add = Math.random() < 0.5;
    return numberProblem(topic, `어떤 수에 ${amount}을(를) ${add ? '더했더니' : '곱했더니'} ${add ? answer + amount : answer * amount}이 되었습니다. 어떤 수인가요?`, answer);
  }
  if (topic === '미지수 x') { const x = randomInteger(2, 30); const coefficient = randomInteger(2, 9); const constant = randomInteger(1, 20); return numberProblem(topic, `${coefficient} × x + ${constant} = ${coefficient * x + constant}일 때, x의 값은?`, x); }
  if (topic === '비율') { const factor = randomInteger(2, 9); const left = randomInteger(1, 9); const right = randomInteger(1, 9); return ratioProblem(`${left * factor}:${right * factor}을 가장 간단한 자연수의 비로 나타내세요.`, left, right); }
  const denominator = randomFrom([10, 20, 25, 50, 100]); const numerator = randomInteger(1, denominator); const percent = (numerator / denominator) * 100;
  return numberProblem(topic, `${denominator}개 중 ${numerator}개는 몇 %인가요?`, percent, '숫자만 입력하세요. 예: 25');
}
function createProblem() { return [null, createGrade1Problem, createGrade2Problem, createGrade3Problem, createGrade4Problem, createGrade5Problem, createGrade6Problem][state.grade](); }

function parseFraction(value) {
  const match = value.replace(/\s/g, '').match(/^(-?\d+)\/(\d+)$/);
  if (!match || Number(match[2]) === 0) return null;
  return fraction(Number(match[1]), Number(match[2]));
}
function isCorrect(value, problem) {
  const normalized = value.trim().replace(/,/g, '');
  if (problem.type === 'number') return normalized !== '' && Number.isFinite(Number(normalized)) && Math.abs(Number(normalized) - problem.answerValue) < 1e-9;
  if (problem.type === 'fraction') {
    const parsed = parseFraction(normalized);
    if (parsed) return parsed.numerator === problem.answerValue.numerator && parsed.denominator === problem.answerValue.denominator;
    return normalized !== '' && Number.isFinite(Number(normalized)) && Math.abs(Number(normalized) - problem.answerValue.numerator / problem.answerValue.denominator) < 1e-9;
  }
  const match = normalized.match(/^(\d+)\s*[:/]\s*(\d+)$/);
  return Boolean(match) && Number(match[2]) !== 0 && Number(match[1]) * problem.answerValue.right === Number(match[2]) * problem.answerValue.left;
}
function updateGradeDescription() { const rule = gradeRules[Number(elements.grade.value)]; elements.gradeDescription.textContent = `${rule.topics} — ${rule.description}`; }
function renderProgress() { elements.progress.textContent = `${state.currentIndex + 1} / ${state.totalQuestions}`; elements.correctCount.textContent = state.correctCount; elements.wrongCount.textContent = state.totalWrongAttempts; }
function showScreen(screen) { elements.setupScreen.hidden = screen !== 'setup'; elements.gameScreen.hidden = screen !== 'game'; elements.reportScreen.hidden = screen !== 'report'; }
function startSession() {
  state.grade = Number(elements.grade.value); state.totalQuestions = Number(elements.questionCount.value); state.currentIndex = 0; state.correctCount = 0;
  state.totalWrongAttempts = 0; state.currentWrongAttempts = 0; state.records = []; state.answered = false;
  elements.gradeBadge.textContent = `${state.grade}학년 · ${gradeRules[state.grade].topics}`; showScreen('game'); loadProblem();
}
function loadProblem() {
  state.problem = createProblem(); state.currentWrongAttempts = 0; state.problemStartedAt = performance.now(); state.answered = false;
  elements.questionText.textContent = state.problem.question; elements.answerHelp.textContent = state.problem.help; elements.answer.value = ''; elements.answer.disabled = false;
  elements.submitButton.hidden = false; elements.giveUpButton.hidden = false; elements.nextButton.hidden = true; elements.message.textContent = '횟수 제한 없이 답을 제출할 수 있어요.';
  elements.message.className = 'message'; elements.time.textContent = ''; renderProgress(); elements.answer.focus();
}
function recordProblem(solved) {
  const elapsedMilliseconds = performance.now() - state.problemStartedAt;
  state.records.push({ number: state.currentIndex + 1, question: state.problem.question, answer: state.problem.answerText, topic: state.problem.topic, elapsedMilliseconds, wrongAttempts: state.currentWrongAttempts, solved });
  state.answered = true; elements.answer.disabled = true; elements.submitButton.hidden = true; elements.giveUpButton.hidden = true; elements.nextButton.hidden = false;
  elements.nextButton.innerHTML = state.currentIndex === state.totalQuestions - 1 ? '결과 보기 <span aria-hidden="true">📊</span>' : '다음 문제 <span aria-hidden="true">➡️</span>';
  elements.time.textContent = `⏱️ 이 문제를 푸는 데 ${formatSeconds(elapsedMilliseconds)} 걸렸어요.`; renderProgress(); elements.nextButton.focus();
}
function submitAnswer() {
  if (state.answered) return;
  const value = elements.answer.value;
  if (value.trim() === '') { elements.message.textContent = '답을 입력해 주세요.'; elements.answer.focus(); return; }
  if (isCorrect(value, state.problem)) { state.correctCount += 1; elements.message.textContent = '정답이에요! 정말 잘했어요! 🎉'; elements.message.className = 'message success'; recordProblem(true); return; }
  state.currentWrongAttempts += 1; state.totalWrongAttempts += 1; renderProgress(); elements.message.textContent = `${state.currentWrongAttempts}번째 오답이에요. 답의 형식과 계산을 다시 확인해 보세요!`; elements.message.className = 'message'; elements.answer.select();
}
function giveUpProblem() {
  if (state.answered || !window.confirm('이 문제를 포기하고 다음으로 넘어갈까요?')) return;
  elements.message.textContent = `정답은 ${state.problem.answerText}이에요. 다음에 다시 도전해요!`; elements.message.className = 'message'; recordProblem(false);
}
function goNext() { if (!state.answered) return; if (state.currentIndex === state.totalQuestions - 1) { showReport(); return; } state.currentIndex += 1; loadProblem(); }
function appendCell(row, value, className = '') { const cell = document.createElement('td'); cell.textContent = value; if (className) cell.className = className; row.appendChild(cell); }
function showReport() {
  showScreen('report'); elements.reportBody.replaceChildren(); elements.unsolvedList.replaceChildren();
  const totalMilliseconds = state.records.reduce((sum, record) => sum + record.elapsedMilliseconds, 0); const unsolved = state.records.filter(record => !record.solved);
  elements.totalTime.textContent = formatSeconds(totalMilliseconds); elements.reportCorrect.textContent = `${state.correctCount}개`; elements.reportUnsolved.textContent = `${unsolved.length}개`;
  state.records.forEach(record => { const row = document.createElement('tr'); appendCell(row, record.number); appendCell(row, `[${record.topic}] ${record.question}`); appendCell(row, formatSeconds(record.elapsedMilliseconds)); appendCell(row, `${record.wrongAttempts}회`); appendCell(row, record.answer); appendCell(row, record.solved ? '정답' : '포기', record.solved ? 'result-correct' : 'result-give-up'); elements.reportBody.appendChild(row); });
  elements.unsolvedSection.hidden = unsolved.length === 0; unsolved.forEach(record => { const item = document.createElement('li'); item.textContent = `[${record.topic}] ${record.question} 정답: ${record.answer}`; elements.unsolvedList.appendChild(item); }); elements.restartButton.focus();
}
function restart() { showScreen('setup'); updateGradeDescription(); elements.startButton.focus(); }

elements.grade.addEventListener('change', updateGradeDescription); elements.startButton.addEventListener('click', startSession); elements.submitButton.addEventListener('click', submitAnswer);
elements.giveUpButton.addEventListener('click', giveUpProblem); elements.nextButton.addEventListener('click', goNext); elements.restartButton.addEventListener('click', restart);
elements.printButton.addEventListener('click', () => window.print()); elements.answer.addEventListener('keydown', event => { if (event.key === 'Enter') submitAnswer(); });
updateGradeDescription(); showScreen('setup');
