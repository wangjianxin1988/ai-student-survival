import React, { useState, useEffect } from "react";
import { getCurrentUser, onAuthStateChange, type DemoUser } from "@/lib/auth";

const QA_KEY = "demo_qa";

export interface QAQuestion {
  id: string;
  targetType: "tool" | "policy";
  targetId: string;
  targetName: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  content: string;
  status: "open" | "answered" | "closed";
  acceptedAnswerId?: string;
  createdAt: string;
  views: number;
  likes: number;
  likedBy: string[];
}

export interface QAAnswer {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  isAccepted: boolean;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

const translations = {
  zh: {
    title: "问答",
    askQuestion: "提问",
    yourQuestion: "你的问题",
    questionPlaceholder: "描述你的问题...",
    submitQuestion: "提交问题",
    noQuestions: "暂无问题",
    beFirst: "成为第一个提问的人",
    answers: "个回答",
    answer: "回答",
    writeAnswer: "撰写回答",
    answerPlaceholder: "写下你的回答...",
    submitAnswer: "提交回答",
    accepted: "已采纳",
    helpful: "有帮助",
    views: "浏览",
    similarQuestions: "相似问题",
    loginToAsk: "登录后提问",
    login: "登录",
  },
  en: {
    title: "Q&A",
    askQuestion: "Ask Question",
    yourQuestion: "Your Question",
    questionPlaceholder: "Describe your question...",
    submitQuestion: "Submit Question",
    noQuestions: "No questions yet",
    beFirst: "Be the first to ask",
    answers: "answers",
    answer: "Answer",
    writeAnswer: "Write an answer",
    answerPlaceholder: "Write your answer...",
    submitAnswer: "Submit Answer",
    accepted: "Accepted",
    helpful: "Helpful",
    views: "views",
    similarQuestions: "Similar Questions",
    loginToAsk: "Login to ask",
    login: "Login",
  },
};

function getStoredQuestions(): QAQuestion[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`${QA_KEY}_questions`);
  return stored ? JSON.parse(stored) : [];
}

function saveQuestions(questions: QAQuestion[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${QA_KEY}_questions`, JSON.stringify(questions));
}

function getStoredAnswers(): QAAnswer[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`${QA_KEY}_answers`);
  return stored ? JSON.parse(stored) : [];
}

function saveAnswers(answers: QAAnswer[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${QA_KEY}_answers`, JSON.stringify(answers));
}

function getQuestionsByTarget(
  targetType: string,
  targetId: string,
): QAQuestion[] {
  return getStoredQuestions().filter(
    (q) => q.targetType === targetType && q.targetId === targetId,
  );
}

function getAnswersByQuestion(questionId: string): QAAnswer[] {
  return getStoredAnswers().filter((a) => a.questionId === questionId);
}

interface QASystemProps {
  targetType: "tool" | "policy";
  targetId: string;
  targetName: string;
  locale?: "zh" | "en";
}

export default function QASystem({
  targetType,
  targetId,
  targetName,
  locale = "zh",
}: QASystemProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QAQuestion | null>(
    null,
  );
  const [showAskForm, setShowAskForm] = useState(false);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [answerContent, setAnswerContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const t = translations[locale];

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Load questions for this target
    const targetQuestions = getQuestionsByTarget(targetType, targetId);
    setQuestions(targetQuestions);

    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, [targetType, targetId]);

  const handleAskQuestion = async () => {
    if (!user || !questionTitle.trim() || !questionContent.trim()) return;

    setSubmitting(true);

    const newQuestion: QAQuestion = {
      id: "q-" + Date.now(),
      targetType,
      targetId,
      targetName,
      userId: user.id,
      userName: user.name,
      userAvatar:
        user.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
      title: questionTitle,
      content: questionContent,
      status: "open",
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      likedBy: [],
    };

    const allQuestions = getStoredQuestions();
    allQuestions.push(newQuestion);
    saveQuestions(allQuestions);

    setQuestions([...questions, newQuestion]);
    setQuestionTitle("");
    setQuestionContent("");
    setShowAskForm(false);
    setSelectedQuestion(newQuestion);
    setSubmitting(false);
  };

  const handleSubmitAnswer = async () => {
    if (!user || !selectedQuestion || !answerContent.trim()) return;

    setSubmitting(true);

    const newAnswer: QAAnswer = {
      id: "a-" + Date.now(),
      questionId: selectedQuestion.id,
      userId: user.id,
      userName: user.name,
      userAvatar:
        user.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
      content: answerContent,
      isAccepted: false,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };

    const allAnswers = getStoredAnswers();
    allAnswers.push(newAnswer);
    saveAnswers(allAnswers);

    // Update question status
    const allQuestions = getStoredQuestions();
    const qIndex = allQuestions.findIndex((q) => q.id === selectedQuestion.id);
    if (qIndex !== -1) {
      allQuestions[qIndex].status = "answered";
      saveQuestions(allQuestions);
    }

    setAnswerContent("");
    setSubmitting(false);

    // Refresh
    window.location.reload();
  };

  const handleLikeQuestion = (question: QAQuestion) => {
    if (!user) return;

    const allQuestions = getStoredQuestions();
    const qIndex = allQuestions.findIndex((q) => q.id === question.id);
    if (qIndex === -1) return;

    if (question.likedBy.includes(user.id)) {
      allQuestions[qIndex].likedBy = allQuestions[qIndex].likedBy.filter(
        (id) => id !== user.id,
      );
      allQuestions[qIndex].likes = Math.max(0, allQuestions[qIndex].likes - 1);
    } else {
      allQuestions[qIndex].likedBy.push(user.id);
      allQuestions[qIndex].likes += 1;
    }

    saveQuestions(allQuestions);
    setQuestions(getQuestionsByTarget(targetType, targetId));
  };

  const handleLikeAnswer = (answer: QAAnswer) => {
    if (!user) return;

    const allAnswers = getStoredAnswers();
    const aIndex = allAnswers.findIndex((a) => a.id === answer.id);
    if (aIndex === -1) return;

    if (answer.likedBy.includes(user.id)) {
      allAnswers[aIndex].likedBy = allAnswers[aIndex].likedBy.filter(
        (id) => id !== user.id,
      );
      allAnswers[aIndex].likes = Math.max(0, allAnswers[aIndex].likes - 1);
    } else {
      allAnswers[aIndex].likedBy.push(user.id);
      allAnswers[aIndex].likes += 1;
    }

    saveAnswers(allAnswers);

    // Refresh to show updated likes
    window.location.reload();
  };

  const handleAcceptAnswer = (question: QAQuestion, answer: QAAnswer) => {
    if (question.userId !== user?.id) return;

    const allAnswers = getStoredAnswers();
    const aIndex = allAnswers.findIndex((a) => a.id === answer.id);
    if (aIndex === -1) return;

    // Mark as accepted
    allAnswers[aIndex].isAccepted = true;
    saveAnswers(allAnswers);

    // Update question status
    const allQuestions = getStoredQuestions();
    const qIndex = allQuestions.findIndex((q) => q.id === question.id);
    if (qIndex !== -1) {
      allQuestions[qIndex].status = "closed";
      allQuestions[qIndex].acceptedAnswerId = answer.id;
      saveQuestions(allQuestions);
    }

    window.location.reload();
  };

  const answers = selectedQuestion
    ? getAnswersByQuestion(selectedQuestion.id)
    : [];

  if (selectedQuestion) {
    return (
      <div className="space-y-4">
        {/* Back button */}
        <button
          onClick={() => setSelectedQuestion(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {locale === "zh" ? "返回问题列表" : "Back to questions"}
        </button>

        {/* Question */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={selectedQuestion.userAvatar}
              alt={selectedQuestion.userName}
              className="w-10 h-10 rounded-full bg-gray-100"
            />
            <div>
              <div className="font-medium text-gray-900">
                {selectedQuestion.userName}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(selectedQuestion.createdAt).toLocaleDateString(
                  locale === "zh" ? "zh-CN" : "en-US",
                )}
              </div>
            </div>
            {selectedQuestion.status === "answered" && (
              <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {t.accepted}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {selectedQuestion.title}
          </h3>
          <p className="text-gray-600 mb-4">{selectedQuestion.content}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button
              onClick={() => handleLikeQuestion(selectedQuestion)}
              className={`flex items-center gap-1 ${
                user && selectedQuestion.likedBy.includes(user.id)
                  ? "text-primary-500"
                  : "hover:text-gray-700"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={
                  user && selectedQuestion.likedBy.includes(user.id)
                    ? "currentColor"
                    : "none"
                }
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {selectedQuestion.likes}
            </button>
            <span>
              {selectedQuestion.views} {t.views}
            </span>
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">
            {answers.length} {t.answers}
          </h4>

          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`bg-white rounded-xl border ${
                answer.isAccepted
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200"
              } p-4`}
            >
              {answer.isAccepted && (
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium mb-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t.accepted}
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={answer.userAvatar}
                  alt={answer.userName}
                  className="w-8 h-8 rounded-full bg-gray-100"
                />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {answer.userName}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {new Date(answer.createdAt).toLocaleDateString(
                      locale === "zh" ? "zh-CN" : "en-US",
                    )}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 mb-3">{answer.content}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLikeAnswer(answer)}
                  className={`flex items-center gap-1 text-sm ${
                    user && answer.likedBy.includes(user.id)
                      ? "text-primary-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill={
                      user && answer.likedBy.includes(user.id)
                        ? "currentColor"
                        : "none"
                    }
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {answer.likes} {t.helpful}
                </button>

                {!answer.isAccepted &&
                  selectedQuestion.status !== "closed" &&
                  user?.id === selectedQuestion.userId && (
                    <button
                      onClick={() =>
                        handleAcceptAnswer(selectedQuestion, answer)
                      }
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {t.accepted}
                    </button>
                  )}
              </div>
            </div>
          ))}

          {/* Answer Form */}
          {selectedQuestion.status !== "closed" && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                {t.writeAnswer}
              </h4>
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder={t.answerPlaceholder}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || !answerContent.trim()}
                className="mt-3 px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
              >
                {submitting
                  ? locale === "zh"
                    ? "提交中..."
                    : "Submitting..."
                  : t.submitAnswer}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
        {user ? (
          <button
            onClick={() => setShowAskForm(!showAskForm)}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t.askQuestion}
          </button>
        ) : (
          <a
            href="/auth/login"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            {t.loginToAsk}
          </a>
        )}
      </div>

      {/* Ask Form */}
      {showAskForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="space-y-3">
            <input
              type="text"
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              placeholder={t.yourQuestion}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <textarea
              value={questionContent}
              onChange={(e) => setQuestionContent(e.target.value)}
              placeholder={t.questionPlaceholder}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAskForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                {locale === "zh" ? "取消" : "Cancel"}
              </button>
              <button
                onClick={handleAskQuestion}
                disabled={
                  submitting || !questionTitle.trim() || !questionContent.trim()
                }
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
              >
                {submitting
                  ? locale === "zh"
                    ? "提交中..."
                    : "Submitting..."
                  : t.submitQuestion}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-500">{t.noQuestions}</p>
          <p className="text-sm text-gray-400">{t.beFirst}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <button
              key={question.id}
              onClick={() => {
                setSelectedQuestion(question);
                // Increment view count
                const allQuestions = getStoredQuestions();
                const qIndex = allQuestions.findIndex(
                  (q) => q.id === question.id,
                );
                if (qIndex !== -1) {
                  allQuestions[qIndex].views += 1;
                  saveQuestions(allQuestions);
                }
              }}
              className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-primary-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {question.title}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {question.content}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{question.userName}</span>
                    <span>
                      {new Date(question.createdAt).toLocaleDateString(
                        locale === "zh" ? "zh-CN" : "en-US",
                      )}
                    </span>
                    <span>
                      {getAnswersByQuestion(question.id).length} {t.answers}
                    </span>
                  </div>
                </div>
                {question.status === "answered" && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">
                    {t.accepted}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
