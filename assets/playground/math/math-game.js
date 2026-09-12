const elements = {
  left: document.querySelector('#left'), right: document.querySelector('#right'), operator: document.querySelector('#operator'),
  answer: document.querySelector('#answer'), submitButton: document.querySelector('#submit-button'), nextButton: document.querySelector('#next-button'),
  message: document.querySelector('#message'), time: document.querySelector('#time'), chances: document.querySelector('#chances'),
  correctCount: document.querySelector('#correct-count'), wrongCount: document.querySelector('#wrong-count'),
  firstDigits: document.querySelector('#first-digits'), secondDigits: document.querySelector('#second-digits')
};

const MAX_ATTEMPTS = 3;
const state = { problem: null, remainingAttempts: MAX_ATTEMPTS, correctCount: 0, wrongCount: 0, startedAt: 0, finished: false };

function randomInteger(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function numberWithDigits(digits) {
  const min = digits === 1 ? 0 : 10 ** (digits - 1);
  return randomInteger(min, (10 ** digits) - 1);
}
function createProblem() {
  let left = numberWithDigits(Number(elements.firstDigits.value));
  let right = numberWithDigits(Number(elements.secondDigits.value));
  const operator = Math.random() < 0.5 ? '+' : '−';
  if (operator === '−' && right > left) [left, right] = [right, left];
  return { left, right, operator, answer: operator === '+' ? left + right : left - right };
}
function renderScore() {
  elements.chances.textContent = state.remainingAttempts;
  elements.correctCount.textContent = state.correctCount;
  elements.wrongCount.textContent = state.wrongCount;
}
function loadProblem() {
  state.problem = createProblem(); state.remainingAttempts = MAX_ATTEMPTS; state.startedAt = performance.now(); state.finished = false;
  elements.left.textContent = state.problem.left; elements.right.textContent = state.problem.right; elements.operator.textContent = state.problem.operator;
  elements.answer.value = ''; elements.answer.disabled = false; elements.submitButton.hidden = false; elements.nextButton.hidden = true;
  elements.message.textContent = '천천히 계산하고 답을 적어 보세요.'; elements.message.classList.remove('success'); elements.time.textContent = '';
  renderScore(); elements.answer.focus();
}
function finishProblem(correct) {
  state.finished = true; elements.answer.disabled = true; elements.submitButton.hidden = true; elements.nextButton.hidden = false;
  elements.time.textContent = `⏱️ 푸는 데 ${((performance.now() - state.startedAt) / 1000).toFixed(1)}초 걸렸어요.`;
  if (correct) {
    state.correctCount += 1; elements.message.textContent = '정답이에요! 정말 잘했어요! 🎉'; elements.message.classList.add('success');
  } else {
    state.wrongCount += 1; elements.message.textContent = `아쉬워요. 정답은 ${state.problem.answer}이에요.`; elements.message.classList.remove('success');
  }
  renderScore(); elements.nextButton.focus();
}
function submitAnswer() {
  if (state.finished) return;
  const value = elements.answer.value.trim();
  if (value === '' || !Number.isInteger(Number(value)) || Number(value) < 0) {
    elements.message.textContent = '0 이상의 정수를 입력해 주세요.'; elements.answer.focus(); return;
  }
  if (Number(value) === state.problem.answer) { finishProblem(true); return; }
  state.remainingAttempts -= 1; renderScore();
  if (state.remainingAttempts === 0) finishProblem(false);
  else { elements.message.textContent = `조금 아쉬워요. 다시 생각해 보세요! (${state.remainingAttempts}번 남음)`; elements.message.classList.remove('success'); elements.answer.select(); }
}

elements.submitButton.addEventListener('click', submitAnswer);
elements.nextButton.addEventListener('click', loadProblem);
elements.firstDigits.addEventListener('change', loadProblem);
elements.secondDigits.addEventListener('change', loadProblem);
elements.answer.addEventListener('keydown', event => { if (event.key === 'Enter') submitAnswer(); });
loadProblem();
