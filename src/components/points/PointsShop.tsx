import React from 'react';

interface PointsPackage {
  id: string;
  name: string;
  pointsAmount: number;
  priceAmount: number;
  bonusPoints: number;
}

interface PointsShopProps {
  packages: PointsPackage[];
  currentBalance: number;
  onPurchase?: (packageId: string) => void;
}

export function PointsShop({ packages, currentBalance, onPurchase }: PointsShopProps) {
  const handlePurchase = (packageId: string) => {
    if (onPurchase) {
      onPurchase(packageId);
    } else {
      alert('支付功能即将上线，敬请期待！');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">积分商店</h3>
      <p className="text-sm text-gray-500 mb-6">购买积分，享受更多特权功能</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const totalPoints = pkg.pointsAmount + pkg.bonusPoints;
          const isPopular = pkg.id === 'pkg_standard';

          return (
            <div
              key={pkg.id}
              className={`relative rounded-xl border-2 p-6 transition-all ${
                isPopular
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  最受欢迎
                </div>
              )}

              <div className="text-center mb-4">
                <h4 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {pkg.priceAmount}
                  <span className="text-sm text-gray-500 font-normal">元</span>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-gray-900">
                  {totalPoints.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">积分</div>
                {pkg.bonusPoints > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    额外赠送 {pkg.bonusPoints.toLocaleString()} 积分
                  </div>
                )}
              </div>

              <button
                onClick={() => handlePurchase(pkg.id)}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                立即购买
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">积分说明</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 发布帖子：+15积分</li>
          <li>• 被点赞：+2积分/次</li>
          <li>• 被收藏：+3积分/次</li>
          <li>• 被评论：+3积分/次</li>
          <li>• 帖子置顶：-50积分</li>
        </ul>
      </div>
    </div>
  );
}
