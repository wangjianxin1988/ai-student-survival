import React, { useState, useEffect, useCallback } from 'react';

interface MathCaptchaProps {
  onVerify: (verified: boolean) => void;
  locale?: 'zh' | 'en';
}

const translations = {
  zh: {
    title: '安全验证',
    instruction: '请计算以下数学题以验证您是人类：',
    placeholder: '输入答案',
    verify: '验证',
    refresh: '换一道',
    error: '答案错误，请重试',
    success: '验证成功',
  },
  en: {
    title: 'Security Check',
    instruction: 'Please solve this math problem to verify you are human:',
    placeholder: 'Enter answer',
    verify: 'Verify',
    refresh: 'New problem',
    error: 'Incorrect answer, please try again',
    success: 'Verified',
  },
};

function generateProblem(): { question: string; answer: number } {
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];

  let a: number, b: number, answer: number;

  switch (operator) {
    case '+':
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * Math.min(a, 50)) + 1;
      answer = a - b;
      break;
    case '*':
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      answer = a * b;
      break;
    default:
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
  }

  const question = `${a} ${operator === '*' ? '×' : operator} ${b} = ?`;
  return { question, answer };
}

export default function MathCaptcha({ onVerify, locale = 'zh' }: MathCaptchaProps) {
  const [problem, setProblem] = useState<{ question: string; answer: number }>({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [isVerified, setIsVerified] = useState(false);

  const t = translations[locale];

  const generateNewProblem = useCallback(() => {
    setProblem(generateProblem());
    setUserAnswer('');
    setStatus('idle');
  }, []);

  useEffect(() => {
    generateNewProblem();
  }, [generateNewProblem]);

  const handleVerify = () => {
    const numAnswer = parseInt(userAnswer, 10);

    if (isNaN(numAnswer)) {
      setStatus('error');
      return;
    }

    if (numAnswer === problem.answer) {
      setStatus('success');
      setIsVerified(true);
      onVerify(true);
    } else {
      setStatus('error');
      setUserAnswer('');
      // Generate new problem after error
      setTimeout(generateNewProblem, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">{t.success}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">{t.title}</span>
        <button
          type="button"
          onClick={generateNewProblem}
          className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t.refresh}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-3">{t.instruction}</p>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-lg font-mono text-center">
            {problem.question}
          </div>
        </div>

        <div className="flex-1">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9-]/g, ''))}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-center font-mono text-lg"
            autoComplete="off"
          />
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={!userAnswer.trim()}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {t.verify}
        </button>
      </div>

      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600">{t.error}</p>
      )}
    </div>
  );
}
