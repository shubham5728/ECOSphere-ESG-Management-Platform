import { useEffect, useState, useCallback } from "react";
import { api, getApiError } from "../../api/client";
import { useAuth } from "../../store/AuthContext";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
}

interface Badge {
  id: string;
  badge: {
    name: string;
    description: string;
    icon: string;
  };
  unlockedAt: string;
}

interface Redemption {
  id: string;
  pointsSpent: number;
  redeemedAt: string;
  reward: { name: string };
}

export default function RewardsPage() {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rewardsRes, badgesRes, redemptionsRes] = await Promise.all([
        api.get<{ data: Reward[] }>("/rewards", { params: { limit: 100 } }),
        api.get<{ data: Badge[] }>("/gamification/my-badges"),
        api.get<{ data: Redemption[] }>("/gamification/redemptions")
      ]);
      setRewards(rewardsRes.data.data.filter((r: any) => r.status === "ACTIVE"));
      setBadges(badgesRes.data.data);
      setRedemptions(redemptionsRes.data.data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRedeem = async (rewardId: string) => {
    if (!confirm("Redeem this reward? Points will be deducted.")) return;
    try {
      await api.post("/gamification/redeem", { rewardId });
      alert("Successfully redeemed! Check your transaction log.");
      refreshUser();
      fetchData();
    } catch (err) {
      alert(getApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎁 Rewards Store & Badges</h1>
          <p className="text-sm text-gray-500">Spend points to redeem sustainable corporate perks, and view unlocked achievements.</p>
        </div>
        <div className="rounded-lg bg-amber-50 px-4 py-2 border border-amber-250 text-right">
          <p className="text-[10px] uppercase font-semibold text-amber-600">Your points balance</p>
          <p className="text-lg font-bold text-amber-800">🎁 {user?.points ?? 0} Pts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Rewards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Available Perks</h2>
          {loading ? (
            <p className="text-xs text-gray-400">Loading store...</p>
          ) : rewards.length === 0 ? (
            <p className="text-xs text-gray-400">No active perks listed in the store.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {rewards.map((r) => (
                <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{r.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-gray-400">Stock: {r.stock} remaining</span>
                      <span className="font-bold text-amber-600">🎁 {r.pointsRequired} Pts</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRedeem(r.id)}
                    disabled={r.stock <= 0 || (user?.points ?? 0) < r.pointsRequired}
                    className="mt-4 w-full rounded bg-amber-500 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {r.stock <= 0 ? "Out of Stock" : "Redeem Perk"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Redemptions Log */}
          <div className="pt-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Redemption History</h2>
            {redemptions.length === 0 ? (
              <p className="text-xs text-gray-400">No redemptions logged.</p>
            ) : (
              <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-400 font-semibold uppercase">
                    <tr>
                      <th className="px-4 py-2">Reward</th>
                      <th className="px-4 py-2">Points Spent</th>
                      <th className="px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {redemptions.map((red) => (
                      <tr key={red.id}>
                        <td className="px-4 py-2 font-medium">{red.reward.name}</td>
                        <td className="px-4 py-2 font-mono text-amber-600">-{red.pointsSpent} Pts</td>
                        <td className="px-4 py-2 text-gray-400">{new Date(red.redeemedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Badges Panel */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm h-fit">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">🎖️ Unlocked Badges</h2>
          {loading ? (
            <p className="text-xs text-gray-400">Loading achievements...</p>
          ) : badges.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-3xl">🔒</span>
              <p className="text-xs text-gray-400 mt-2">No achievements unlocked yet. Finish challenges and CSR tasks to earn badges!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {badges.map((b) => (
                <div key={b.id} className="flex gap-3 items-start border-b border-gray-50 pb-3 last:border-b-0">
                  <span className="text-2xl">{b.badge.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{b.badge.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{b.badge.description}</p>
                    <span className="text-[9px] text-green-600 block mt-1 font-semibold">
                      Unlocked: {new Date(b.unlockedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
