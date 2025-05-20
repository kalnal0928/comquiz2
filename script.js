let currentQuestionIndex = 0;
let selectedQuestions = [];
let wrongQuestions = [];
let correctAnswers = 0;
let wrongAnswers = 0;
let totalQuestions = 0;
let isAnswerRevealed = false;

// DOM 요소 선택
const chapterCheckboxes = document.querySelectorAll('.chapter-checkbox');
const startQuizButton = document.getElementById('start-quiz');
const chapterSelection = document.getElementById('chapter-selection');
const quizArea = document.getElementById('quiz-area');
const resultArea = document.getElementById('result-area');
const questionContainer = document.getElementById('question-container');
const answerContainer = document.getElementById('answer-container');
const answerText = document.getElementById('answer-text');
const nextButton = document.getElementById('next-button');
const checkAnswerButton = document.getElementById('check-answer');
const markCorrectButton = document.getElementById('mark-correct');
const markWrongButton = document.getElementById('mark-wrong');
const currentQuestionEl = document.getElementById('current-question');
const totalQuestionsEl = document.getElementById('total-questions');
const correctCountEl = document.getElementById('correct-count');
const wrongCountEl = document.getElementById('wrong-count');
const resultTotalEl = document.getElementById('result-total');
const resultCorrectEl = document.getElementById('result-correct');
const resultWrongEl = document.getElementById('result-wrong');
const restartQuizButton = document.getElementById('restart-quiz');
const retryWrongButton = document.getElementById('retry-wrong');

// 모두 선택 버튼
const selectAllButton = document.getElementById('select-all');

// 모두 선택 버튼 이벤트 리스너
selectAllButton.addEventListener('click', () => {
    chapterCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
});

// 퀴즈 시작
startQuizButton.addEventListener('click', () => {
    const selectedChapters = Array.from(chapterCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    
    if (selectedChapters.length === 0) {
        alert('최소 한 개 이상의 장을 선택해주세요.');
        return;
    }
    
    // 선택된 장에 해당하는 문제 필터링
    selectedQuestions = questions.filter(q => selectedChapters.includes(q.chapter));
    
    // 문제 순서 섞기
    shuffleArray(selectedQuestions);
    
    totalQuestions = selectedQuestions.length;
    currentQuestionIndex = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    wrongQuestions = [];
    
    // UI 업데이트
    chapterSelection.classList.add('hidden');
    quizArea.classList.remove('hidden');
    resultArea.classList.add('hidden');
    
    updateProgressInfo();
    showCurrentQuestion();
});

// 현재 문제 표시
function showCurrentQuestion() {
    if (currentQuestionIndex >= selectedQuestions.length) {
        showResults();
        return;
    }
    
    const q = selectedQuestions[currentQuestionIndex];
    questionContainer.innerHTML = `
        <p class="mb-2"><strong>${q.chapter}</strong></p>
        <p class="text-lg">${q.question}</p>
    `;
    
    answerContainer.classList.add('hidden');
    checkAnswerButton.classList.remove('hidden');
    markCorrectButton.classList.add('hidden');
    markWrongButton.classList.add('hidden');
    
    isAnswerRevealed = false;
    updateProgressInfo();
}

// 정답 확인
checkAnswerButton.addEventListener('click', () => {
    if (!isAnswerRevealed) {
        const q = selectedQuestions[currentQuestionIndex];
        
        // 답변 텍스트를 줄바꿈 처리
        let formattedAnswer = q.answer.replace(/,\s*/g, ',<br>');
        answerText.innerHTML = formattedAnswer; // innerHTML 사용
        
        answerContainer.classList.remove('hidden');
        checkAnswerButton.classList.add('hidden');
        markCorrectButton.classList.remove('hidden');
        markWrongButton.classList.remove('hidden');
        isAnswerRevealed = true;

        // <a> 태그가 포함되어 있으면 이스케이프 처리
if (formattedAnswer.includes('<a>')) {
    formattedAnswer = formattedAnswer
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
    }
});

// 맞춤 표시
markCorrectButton.addEventListener('click', () => {
    correctAnswers++;
    correctCountEl.textContent = correctAnswers;
    nextQuestion();
});

// 틀림 표시
markWrongButton.addEventListener('click', () => {
    wrongAnswers++;
    wrongCountEl.textContent = wrongAnswers;
    wrongQuestions.push(selectedQuestions[currentQuestionIndex]);
    nextQuestion();
});

// 다음 문제로 이동
nextButton.addEventListener('click', () => {
    if (!isAnswerRevealed) {
        if (!confirm('정답을 확인하지 않고 넘어가시겠습니까?')) {
            return;
        }
    }
    nextQuestion();
});

function nextQuestion() {
    currentQuestionIndex++;
    showCurrentQuestion();
}

// 결과 표시
function showResults() {
    quizArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    
    resultTotalEl.textContent = totalQuestions;
    resultCorrectEl.textContent = correctAnswers;
    resultWrongEl.textContent = wrongAnswers;
    
    // 틀린 문제가 있으면 재시도 버튼 표시
    if (wrongQuestions.length > 0) {
        retryWrongButton.classList.remove('hidden');
    } else {
        retryWrongButton.classList.add('hidden');
    }
}

// 처음부터 다시 시작
restartQuizButton.addEventListener('click', () => {
    resultArea.classList.add('hidden');
    chapterSelection.classList.remove('hidden');
    
    // 체크박스 초기화
    chapterCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
});

// 틀린 문제만 다시 풀기
retryWrongButton.addEventListener('click', () => {
    if (confirm('틀린 문제만 다시 풀겠습니까?')) {
        selectedQuestions = [...wrongQuestions];
        wrongQuestions = [];
        
        shuffleArray(selectedQuestions);
        totalQuestions = selectedQuestions.length;
        currentQuestionIndex = 0;
        correctAnswers = 0;
        wrongAnswers = 0;
        
        resultArea.classList.add('hidden');
        quizArea.classList.remove('hidden');
        
        updateProgressInfo();
        showCurrentQuestion();
    }
});

// 진행 정보 업데이트
function updateProgressInfo() {
    currentQuestionEl.textContent = currentQuestionIndex + 1;
    totalQuestionsEl.textContent = totalQuestions;
}

// 배열을 랜덤하게 섞는 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
