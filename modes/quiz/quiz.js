import { setBodyClass } from '../../utils/ui.js';
import { getText } from '../../lang.js';

export function showQuizMode() {
  document.getElementById("modeTitle").textContent = getText("quiz");
  setBodyClass('quiz');

  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <p>mdfとか必要勝率とかオッズコールできるかといった計算問題のモードです！</p>
    <div id="quizContainer" class="quiz-container"></div>
    <div id="quizResult" class="quiz-result"></div>
    <div id="quizNext" class="quiz-next"></div>
  `;

  let currentIndex = 0;
  let quiz = [];

  function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async function loadQuiz() {
    try {
      const response = await fetch('././data/quiz/quiz.json');
      const rawQuiz = await response.json();
      quiz = shuffleArray(rawQuiz);
      showQuiz();
    } catch (e) {
      console.error("問題データの読み込みに失敗しました", e);
    }
  }

  function showQuiz() {
    const container = document.getElementById("quizContainer");
    const resultBox = document.getElementById("quizResult");
    const nextBox = document.getElementById("quizNext");

    container.innerHTML = "";
    resultBox.textContent = "";
    resultBox.className = "quiz-result";
    nextBox.innerHTML = "";

    if (quiz.length === 0) {
      container.textContent = "問題が読み込まれていません。";
      return;
    }

    const problem = quiz[currentIndex];
    const qElem = document.createElement("p");
    qElem.textContent = problem.question;
    container.appendChild(qElem);

    let answered = false;

    const shuffledChoices = shuffleArray(problem.choices.map((text, i) => ({
      text,
      originalIndex: i
    })));

    shuffledChoices.forEach(({ text, originalIndex }) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.className = "quiz-button";
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;

        const isCorrect = originalIndex === problem.answer;
        resultBox.textContent = isCorrect ? "✅ 正解！" : "❌ 不正解...";
        resultBox.classList.add(isCorrect ? "correct" : "incorrect");

        // ボタン状態の切り替え
        const allButtons = container.querySelectorAll("button.quiz-button");
        allButtons.forEach(b => {
          if (b === btn) {
            b.classList.add("selected");
          } else {
            b.classList.add("dimmed");
          }
        });

        // NEXTボタン表示
        const nextBtn = document.createElement("button");
        nextBtn.id = "nextButton";
        nextBtn.textContent = "NEXT ▶";
        nextBtn.classList.add("fade-slide-in");
        nextBtn.addEventListener("click", () => {
          currentIndex = (currentIndex + 1) % quiz.length;
          showQuiz();
        });
        nextBox.appendChild(nextBtn);
      });
      container.appendChild(btn);
    });
  }

  loadQuiz();
}