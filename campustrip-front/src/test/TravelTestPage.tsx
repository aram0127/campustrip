import React, { useState } from 'react';
import styled from 'styled-components';
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

// 질문 객체 타입
interface QuestionOption {
    text: string;
    choiceValue: 1 | 0;
    tag: string;
}

interface Question {
    id: number;
    question: string;
    options: QuestionOption[];
}

interface QuestionnairePageProps {
    question: Question;
    totalQuestions: number;
    currentQuestionIndex: number;
    onAnswer: (choiceValue: 1 | 0) => void;
    onSkip: () => void;
    onBack: (isCompleted?: boolean) => void;
}

interface TestResultPageProps {
    choices: (1 | 0 | null)[];
    onSave: (choices: (1 | 0 | null)[]) => void;
    onBack: (isCompleted?: boolean) => void;
}

interface TravelTestFlowProps {
    onComplete: (choices: (1 | 0 | null)[]) => void;
}

const TAG_PAIRS = [
    { high: "#계획적", low: "#즉흥적" },
    { high: "#맛집탐방", low: "#음식아무거나" },
    { high: "#사진필수", low: "#눈으로기억" },
    { high: "#뚜벅이", low: "#교통중심" },
    { high: "#가성비", low: "#투자" },
    { high: "#느긋힐링", low: "#액티비티" },
    { high: "#규칙적 식사", low: "#비규칙적 식사" },
    { high: "#아침형", low: "#저녁형" },
];

const QUIZ_QUESTIONS: Question[] = [
    // 1.계획 vs 즉흥
    { 
        id: 1, 
        question: "여행지에서의 첫날 아침, 당신의 행동은?", 
        options: [
            { text: "미리 짜놓은 일정에 맞춰 바로 나선다.", choiceValue: 1, tag: TAG_PAIRS[0].high }, 
            { text: "일단 늦잠자고, 일어나서 뭘 할지 생각해본다.", choiceValue: 0, tag: TAG_PAIRS[0].low }
        ]
    },
    // 2.맛집 vs 아무거나
    { 
        id: 2, 
        question: "점심 식사 선택 시 가장 중요하게 생각하는 것은?", 
        options: [
            { text: "여행 전 맛집 리스트를 미리 저장해두고 방문한다.", choiceValue: 1, tag: TAG_PAIRS[1].high }, 
            { text: "가장 가까운 곳에 방문하거나 간단히 해결한다.", choiceValue: 0, tag: TAG_PAIRS[1].low }
        ]
    },
    // 3.사진 vs 눈으로 기억
    { 
        id: 3, 
        question: "새로운 풍경을 봤을 때, 당신의 행동은?", 
        options: [
            { text: "인생샷을 건질 때까지 다양한 각도로 사진을 찍는다.", choiceValue: 1, tag: TAG_PAIRS[2].high }, 
            { text: "폰은 내려놓고 눈과 마음에 담아두려 노력한다.", choiceValue: 0, tag: TAG_PAIRS[2].low }
        ]
    },
    // 4.뚜벅이 vs 교통 중심
    { 
        id: 4, 
        question: "여행지에서 이동할 때 선호하는 방식은?", 
        options: [
            { text: "많이 걷더라도 도보로 구석구석 돌아다닌다.", choiceValue: 1, tag: TAG_PAIRS[3].high }, 
            { text: "대중교통이나 택시를 이용해 편하게 이동한다.", choiceValue: 0, tag: TAG_PAIRS[3].low }
        ]
    },
    // 5. 가성비 vs 투자
    {
        id: 5,
        question: "숙소나 항공편을 선택할 때 당신의 선택은?",
        options: [
            { text: "돈을 최대한 아끼기 위해 여러 곳을 비교한다.", choiceValue: 1, tag: TAG_PAIRS[4].high }, 
            { text: "돈을 좀 더 쓰더라도 편리함과 쾌적함을 우선한다.", choiceValue: 0, tag: TAG_PAIRS[4].low }
        ]
    },
    // 6. 느긋힐링 vs 액티비티
    {
        id: 6,
        question: "여행의 주 목적은?",
        options: [
            { text: "여유롭게 즐기며 휴식이 필수다.", choiceValue: 1, tag: TAG_PAIRS[5].high }, 
            { text: "활동은 최대한 많이, 꽉찬 일정이 좋다.", choiceValue: 0, tag: TAG_PAIRS[5].low }
        ]
    },
    // 7. 규칙적 식사 vs 비규칙적 식사
    {
        id: 7,
        question: "식사 규칙은?",
        options: [
            { text: "삼시세끼 정해진 시간에 챙겨먹는다.", choiceValue: 1, tag: TAG_PAIRS[6].high }, 
            { text: "놀다가 배고파질 때 먹는다.", choiceValue: 0, tag: TAG_PAIRS[6].low }
        ]
    },
    // 8. 아침형 vs 저녁형
    {
        id: 8,
        question: "수면 패턴은?",
        options: [
            { text: "일찍 자고 일찍 일어난다.", choiceValue: 1, tag: TAG_PAIRS[7].high }, 
            { text: "늦게 자고 늦게 일어난다.", choiceValue: 0, tag: TAG_PAIRS[7].low }
        ]
    },
];

// 결과 계산 
const getTagsByChoices = (choices: (1 | 0 | null)[]) => {
    const finalTags: string[] = [];
    
    choices.forEach((choice, index) => {
        // 건너뛰기인 경우 태그를 추가하지 않음
        if (choice === null) {
            return; 
        }

        // 답변이 1 또는 0인 경우에만 태그를 결정
        const pair = TAG_PAIRS[index];  
        const tag = choice === 1 ? pair.high : pair.low;
        finalTags.push(tag);
    });

    return finalTags;
};

// 스타일 컴포넌트 (여행 성향 검사 페이지용)
const TestPageContainer = styled.div`
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    background-color: white;
    padding-top: 50px;
`;

const TestHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    position: fixed;
    top: 0;
    width: 100%;
    max-width: 480px;
    background-color: white;
    z-index: 20;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const TestIconButton = styled.button`
    background: none;
    border: none;
    color: #374151;
    font-size: 24px;
    cursor: pointer;
`;

const ProgressContainer = styled.div`
    width: 100%;
    height: 6px;
    background-color: #e5e7eb;
`;

const ProgressBar = styled.div`
    height: 100%;
    background-color: #3b82f6; /* Blue */
    transition: width 0.3s ease-out;
`;

const QuestionSection = styled.div`
    padding: 32px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const QuestionNumber = styled.p`
    color: #3b82f6; /* Blue */
    font-weight: 600;
    margin-bottom: 24px;
`;

const QuestionText = styled.h1`
    font-size: 22px;
    font-weight: 700;
    text-align: center;
    line-height: 1.5;
    margin-bottom: 40px;
`;

const OptionButton = styled.button`
    width: 100%;
    padding: 20px;
    margin-bottom: 16px;
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 16px;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
    line-height: 1.4;

    &:hover {
        background-color: #e5e7eb;
    }
    
    &.selected {
        background-color: #dbeafe; /* Blue-100 */
        border-color: #3b82f6; /* Blue-500 */
        font-weight: 600;
    }
`;

const SkipLink = styled.button`
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 14px;
    margin-top: 16px;
    cursor: pointer;
    text-decoration: underline;
`;

const ResultCard = styled.div`
    background-color: #f9fafb;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    margin-top: 20px;
    text-align: center;
`;

const ResultTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: #10b981; /* Green */
    margin-bottom: 8px;
`;

const ResultDescription = styled.p`
    font-size: 16px;
    color: #4b5563;
    margin-bottom: 20px;
`;

const ResultTagContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-bottom: 30px;
`;

const ResultTag = styled.span`
    background-color: #dbeafe; /* Blue-100 */
    color: #1e40af; /* Blue-800 */
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
`;

const SaveButton = styled.button`
    width: 100%;
    padding: 14px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #2563eb;
    }
`;


// 컴포넌트: 질문 페이지
const QuestionnairePage: React.FC<QuestionnairePageProps> = ({ question, totalQuestions, currentQuestionIndex, onAnswer, onSkip, onBack }) => {
    const [selectedChoice, setSelectedChoice] = useState<(1 | 0) | null>(null);
    const progress = ((currentQuestionIndex) / totalQuestions) * 100;
    
    // 다음 질문으로 이동 (선택된 답변 있을 때)
    const handleNext = () => {
        if (selectedChoice !== null) {
            onAnswer(selectedChoice);
            setSelectedChoice(null); 
        }
    };

    return (
        <TestPageContainer>
            <TestHeader>
                <TestIconButton onClick={() => onBack(false)}><IoArrowBack /></TestIconButton>
                <span style={{ fontWeight: '600' }}>{currentQuestionIndex} / {totalQuestions}</span>
                <TestIconButton onClick={onSkip}><span style={{ fontSize: '14px', fontWeight: '500' }}>건너뛰기</span></TestIconButton>
            </TestHeader>
            <ProgressContainer>
                <ProgressBar style={{ width: `${progress}%` }} />
            </ProgressContainer>

            <QuestionSection>
                <QuestionNumber>Q.{question.id.toString().padStart(2, '0')}</QuestionNumber>
                <QuestionText>{question.question}</QuestionText>
                
                {question.options.map((option, index) => (
                    <OptionButton 
                        key={index}
                        className={selectedChoice === option.choiceValue ? 'selected' : ''}
                        onClick={() => setSelectedChoice(option.choiceValue)}
                    >
                        {option.text}
                    </OptionButton>
                ))}
                
                <SaveButton 
                    onClick={handleNext} 
                    disabled={selectedChoice === null}
                    style={{ marginTop: '20px', backgroundColor: selectedChoice === null ? '#9ca3af' : '#3b82f6' }}
                >
                    다음
                </SaveButton>
            </QuestionSection>
        </TestPageContainer>
    );
};

// 컴포넌트: 결과 페이지
const TestResultPage: React.FC<TestResultPageProps> = ({ choices, onSave, onBack }) => {
    const navigate = useNavigate();
    const finalTags = getTagsByChoices(choices);
    
    const handleSaveAndExit = () => {
        onSave(choices); 
        navigate('/profile'); 
    };

    return (
        <TestPageContainer>
            <TestHeader>
                <TestIconButton onClick={() => onBack(false)}><IoArrowBack /></TestIconButton>
                <span style={{ fontWeight: '600' }}>여행 성향 검사 완료</span>
                <div style={{ width: '24px' }} />
            </TestHeader>
            <QuestionSection>
                <ResultCard>
                    <IoCheckmarkCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                    <ResultTitle>검사 완료!</ResultTitle>
                    <ResultDescription>4개의 여행 성향 태그가 결정되었습니다.</ResultDescription>
                    
                    <ResultTagContainer>
                        {finalTags.map((tag, index) => (
                            <ResultTag key={index}>{tag}</ResultTag>
                        ))}
                    </ResultTagContainer>
                    
                    <SaveButton onClick={handleSaveAndExit}>
                        프로필에 저장하기
                    </SaveButton>
                </ResultCard>

                <SkipLink onClick={() => navigate('/profile')}>
                    저장하지 않고 프로필로 돌아가기
                </SkipLink>
            </QuestionSection>
        </TestPageContainer>
    );
};


// 메인 컴포넌트
const TravelTestFlow: React.FC<TravelTestFlowProps> = ({ onComplete }) => {
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
    const [userAnswers, setUserAnswers] = useState<(1 | 0 | null)[]>([]);
    
    const totalQuestions = QUIZ_QUESTIONS.length;
    const currentQuestion = currentQuestionIndex > 0 ? QUIZ_QUESTIONS[currentQuestionIndex - 1] : null;
    
    // 검사 시작 또는 첫 질문 표시
    const handleStartTest = () => setCurrentQuestionIndex(1);

    // 질문에 답변
    const handleAnswer = (choiceValue: 1 | 0) => {
        const newAnswers = [...userAnswers, choiceValue];
        setUserAnswers(newAnswers);

        // 마지막 질문에 답변
        if (newAnswers.length === totalQuestions) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // 다음 질문으로 이동
            setTimeout(() => {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }, 300); 
        }
    };
    
    // 건너뛰기
    const handleSkip = () => {
        const newAnswers = [...userAnswers, null];
        setUserAnswers(newAnswers);

        if (newAnswers.length === totalQuestions) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    // 검사 중 이탈 
    const handleBack = (isCompleted = false) => {
        if (!isCompleted) {
            // 내용을 저장하지 않고 프로필로 돌아감
            navigate('/profile'); 
        }
    };


    if (currentQuestionIndex === 0) {
        // 검사 시작 화면
        return (
            <TestPageContainer style={{ paddingTop: '80px', textAlign: 'center' }}>
                <IoCheckmarkCircle size={80} color="#3b82f6" style={{ marginBottom: '24px' }} />
                <QuestionText style={{ fontSize: '24px' }}>여행 성향 검사를 시작합니다</QuestionText>
                <ResultDescription style={{ marginBottom: '40px' }}>간단한 질문으로 당신의 여행 스타일을 확인하세요.</ResultDescription>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80%', margin: '0 auto' }}>
                    <SaveButton onClick={handleStartTest} style={{ width: '100%', margin: '0 0 16px 0' }}>검사 시작</SaveButton>
                    <SkipLink onClick={() => navigate('/profile')} style={{ color: '#9ca3af' }}>나중에 할게요</SkipLink>
                </div>
           </TestPageContainer>
        );
    } else if (currentQuestionIndex <= totalQuestions && currentQuestion) {
        // 질문 화면
        return (
            <QuestionnairePage
                question={currentQuestion}
                totalQuestions={totalQuestions}
                currentQuestionIndex={currentQuestionIndex}
                onAnswer={handleAnswer}
                onSkip={handleSkip}
                onBack={handleBack}
            />
        );
    } else if (currentQuestionIndex === totalQuestions + 1) {
        // 결과 화면
        return (
            <TestResultPage 
                choices={userAnswers} 
                onSave={onComplete} 
                onBack={handleBack}
            />
        );
    }

    return null; 
};

const TravelTestPage: React.FC<TravelTestFlowProps> = ({ onComplete }) => {
    return <TravelTestFlow onComplete={onComplete} />;
};

export default TravelTestPage;
