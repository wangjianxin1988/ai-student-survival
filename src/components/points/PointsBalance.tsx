import React from 'react';

interface PointsBalanceProps {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export function PointsBalance({ balance, totalEarned, totalSpent }: PointsBalanceProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
      <div className="text-sm opacity-80 mb-1">当前积分</div>
      <div className="text-4xl font-bold mb-4">{balance.toLocaleString()}</div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-500">
        <div>
          <div className="text-xs opacity-70">累计获得</div>
          <div className="text-lg font-semibold text-green-300">+{totalEarned.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs opacity-70">累计消耗</div>
          <div className="text-lg font-semibold text-red-300">-{totalSpent.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
