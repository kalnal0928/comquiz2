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
const prevButton = document.getElementById('prev-button');
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

// 모두 선택 버튼 이벤트 리스너 - 토글 기능 추가
selectAllButton.addEventListener('click', () => {
    // 모든 체크박스가 체크되어 있는지 확인
    const allChecked = Array.from(chapterCheckboxes).every(checkbox => checkbox.checked);
    
    // 모두 체크되어 있으면 모두 해제, 아니면 모두 체크
    chapterCheckboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
});

// 배열을 무작위로 섞는 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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
    
    // 문제를 무작위로 섞기
    selectedQuestions = shuffleArray([...selectedQuestions]);
    
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

// 이전 문제로 이동하는 함수
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showCurrentQuestion();
    }
}

// 다음 문제로 이동하는 함수
function nextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        showCurrentQuestion();
    } else {
        showResults();
    }
}

// DOM 요소 선택에 추가
const answerInput = document.getElementById('answer-input');
const answerInputContainer = document.getElementById('answer-input-container');

// 현재 문제 표시
function showCurrentQuestion() {
    const q = selectedQuestions[currentQuestionIndex];

    // 질문 표시
    let questionHTML = `<h3 class="font-semibold text-lg mb-2">${q.question}</h3>`;

    // 질문과 함께 이미지가 있는 경우
    if (q.questionImage) {
        questionHTML += `<img src="${q.questionImage}" alt="문제 이미지" class="my-2 max-w-full h-auto">`;
    } else if (q.questionImages) {
        // 여러 이미지가 있는 경우
        q.questionImages.forEach(imageSrc => {
            questionHTML += `<img src="${imageSrc}" alt="문제 이미지" class="my-2 max-w-full h-auto">`;
        });
    }
    
    questionContainer.innerHTML = questionHTML;
    
    // 답변 입력 필드 초기화
    answerInput.value = '';
    answerInputContainer.classList.remove('hidden');
    
    // 이전/다음 버튼 상태 업데이트
    prevButton.disabled = currentQuestionIndex === 0;
    prevButton.classList.toggle('opacity-50', currentQuestionIndex === 0);
    prevButton.classList.toggle('cursor-not-allowed', currentQuestionIndex === 0);
    
    nextButton.disabled = currentQuestionIndex === totalQuestions - 1;
    nextButton.classList.toggle('opacity-50', currentQuestionIndex === totalQuestions - 1);
    nextButton.classList.toggle('cursor-not-allowed', currentQuestionIndex === totalQuestions - 1);
    
    answerContainer.classList.add('hidden');
    isAnswerRevealed = false;
    updateProgressInfo();
}

// 이전 문제 버튼 이벤트 리스너
prevButton.addEventListener('click', prevQuestion);

// 다음 문제 버튼 이벤트 리스너
nextButton.addEventListener('click', nextQuestion);

// 맞춤 표시
markCorrectButton.addEventListener('click', () => {
    const q = selectedQuestions[currentQuestionIndex];
    const userAnswer = answerInput.value.trim();
    
    // 답변 입력 필드 숨기기
    answerInputContainer.classList.add('hidden');
    
    // 정답 표시
    let formattedAnswer = q.answer;
    
    // HTML 태그 이스케이프 처리 (필요한 경우)
    if (formattedAnswer.includes('<a>') || formattedAnswer.includes('<') && formattedAnswer.includes('>')) {
        formattedAnswer = formattedAnswer
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    
    // 줄바꿈 처리 개선
    formattedAnswer = formattedAnswer
        .split('\n')
        .map(line => {
            line = line.trim();
            const leadingSpaces = line.match(/^\s*/)[0];
            const content = line.slice(leadingSpaces.length).replace(/\s+/g, ' ');
            return leadingSpaces + content;
        })
        .filter(line => line.length > 0)
        .map(line => {
            const indent = line.match(/^\s*/)[0].length;
            const content = line.trim();
            return `<div class="whitespace-pre-wrap break-words pl-${indent * 4} my-1">${content}</div>`;
        })
        .join('');
    
    // 사용자 답변과 정답 표시
    answerText.innerHTML = `<div class="mb-2">내 답변: ${userAnswer}</div>${formattedAnswer}`;

    // 정답과 함께 이미지가 있는 경우
    if (q.answerImage) {
        answerText.innerHTML += `<img src="${q.answerImage}" alt="정답 이미지" class="my-2 max-w-full h-auto">`;
    } else if (q.answerImages) {
        q.answerImages.forEach(imageSrc => {
            answerText.innerHTML += `<img src="${imageSrc}" alt="정답 이미지" class="my-2 max-w-full h-auto">`;
        });
    }
    
    // UI 상태 업데이트
    answerContainer.classList.remove('hidden');
    correctAnswers++;
    correctCountEl.textContent = correctAnswers;
    
    // 잠시 후 다음 문제로 이동
    setTimeout(() => {
        nextQuestion();
    }, 2000);
});

// 틀림 표시
markWrongButton.addEventListener('click', () => {
    const q = selectedQuestions[currentQuestionIndex];
    const userAnswer = answerInput.value.trim();
    
    // 답변 입력 필드 숨기기
    answerInputContainer.classList.add('hidden');
    
    // 정답 표시
    let formattedAnswer = q.answer;
    
    // HTML 태그 이스케이프 처리 (필요한 경우)
    if (formattedAnswer.includes('<a>') || formattedAnswer.includes('<') && formattedAnswer.includes('>')) {
        formattedAnswer = formattedAnswer
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    
    // 줄바꿈 처리 개선
    formattedAnswer = formattedAnswer
        .split('\n')
        .map(line => {
            line = line.trim();
            const leadingSpaces = line.match(/^\s*/)[0];
            const content = line.slice(leadingSpaces.length).replace(/\s+/g, ' ');
            return leadingSpaces + content;
        })
        .filter(line => line.length > 0)
        .map(line => {
            const indent = line.match(/^\s*/)[0].length;
            const content = line.trim();
            return `<div class="whitespace-pre-wrap break-words pl-${indent * 4} my-1">${content}</div>`;
        })
        .join('');
    
    // 사용자 답변과 정답 표시
    answerText.innerHTML = `<div class="mb-2">내 답변: ${userAnswer}</div>${formattedAnswer}`;

    // 정답과 함께 이미지가 있는 경우
    if (q.answerImage) {
        answerText.innerHTML += `<img src="${q.answerImage}" alt="정답 이미지" class="my-2 max-w-full h-auto">`;
    } else if (q.answerImages) {
        q.answerImages.forEach(imageSrc => {
            answerText.innerHTML += `<img src="${imageSrc}" alt="정답 이미지" class="my-2 max-w-full h-auto">`;
        });
    }
    
    // UI 상태 업데이트
    answerContainer.classList.remove('hidden');
    wrongAnswers++;
    wrongCountEl.textContent = wrongAnswers;
    wrongQuestions.push(selectedQuestions[currentQuestionIndex]);
    
    // 잠시 후 다음 문제로 이동
    setTimeout(() => {
        nextQuestion();
    }, 2000);
});

// Enter 키로 답변 제출
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        markCorrectButton.click();
    }
});

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
