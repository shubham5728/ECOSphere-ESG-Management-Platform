import { useEffect, useState, useCallback } from "react";
import { Target, Zap, Gift } from "lucide-react";
import { api, getApiError } from "../../api/client";
import { useAuth } from "../../store/AuthContext";
import { Button } from "../../components/ui/Button";

interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  xpReward: number;
  pointsReward: number;
  status: string;
  _count: { participations: number };
}

interface Signup {
  challengeId: string;
  status: string;
}

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    xpReward: 100,
    pointsReward: 200,
    status: "ACTIVE"
  });

  const [proofModalId, setProofModalId] = useState<string | null>(null);
  const [proofForm, setProofForm] = useState({ proofUrl: "", proofNote: "" });

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const [challengesRes, signupsRes] = await Promise.all([
        api.get<{ data: Challenge[] }>("/gamification/challenges"),
        api.get<{ data: Signup[] }>("/gamification/participations")
      ]);
      setChallenges(challengesRes.data.data);
      setSignups(signupsRes.data.data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/gamification/challenges", {
        ...form,
        xpReward: Number(form.xpReward),
        pointsReward: Number(form.pointsReward)
      });
      setShowModal(false);
      fetchChallenges();
    } catch (err) {
      setFormError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofModalId) return;
    try {
      await api.post("/gamification/participations", {
        challengeId: proofModalId,
        ...proofForm
      });
      alert("Evidence submitted successfully!");
      setProofModalId(null);
      setProofForm({ proofUrl: "", proofNote: "" });
      fetchChallenges();
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const activeSignups = new Map(signups.map((s) => [s.challengeId, s.status]));
  const isElevated = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Target className="text-green-600" /> ESG Challenges
          </h1>
          <p className="text-sm text-gray-500">Corporate targets and seasonal green challenges. Join to earn badges & points.</p>
        </div>
        {isElevated && <Button onClick={() => setShowModal(true)}>+ Add Challenge</Button>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center text-sm text-gray-400 py-12">Loading challenges...</div>
        ) : challenges.length === 0 ? (
          <div className="col-span-full text-center text-sm text-gray-400 py-12">No challenges active.</div>
        ) : (
          challenges.map((c) => {
            const signupStatus = activeSignups.get(c.id);

            return (
              <div key={c.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {c.status}
                    </span>
                    <span className="text-xs text-gray-400">Ends: {new Date(c.endDate).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mt-2">{c.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-3">{c.description}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded font-semibold"><Zap size={11} /> {c.xpReward} XP</span>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded font-semibold"><Gift size={11} /> {c.pointsReward} Pts</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{c._count.participations} signed up</span>
                  
                  {signupStatus ? (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      signupStatus === "APPROVED" ? "bg-green-50 text-green-700" :
                      signupStatus === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {signupStatus === "PENDING" ? "⏳ Awaiting Review" : signupStatus}
                    </span>
                  ) : (
                    <button
                      onClick={() => setProofModalId(c.id)}
                      disabled={c.status !== "ACTIVE"}
                      className="rounded bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      Join & Submit Proof
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Challenge</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">XP Reward</label>
                  <input
                    type="number"
                    value={form.xpReward}
                    onChange={(e) => setForm(f => ({ ...f, xpReward: Number(e.target.value) }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Points Reward</label>
                  <input
                    type="number"
                    value={form.pointsReward}
                    onChange={(e) => setForm(f => ({ ...f, pointsReward: Number(e.target.value) }))}
                    className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Button type="submit" loading={submitting}>Create Challenge</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {proofModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Evidence / Proof</h2>
            <form onSubmit={handleProofSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Proof URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/my-proof-doc"
                  value={proofForm.proofUrl}
                  onChange={(e) => setProofForm(p => ({ ...p, proofUrl: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Proof Details / Description</label>
                <textarea
                  placeholder="Tell us what you completed..."
                  value={proofForm.proofNote}
                  onChange={(e) => setProofForm(p => ({ ...p, proofNote: e.target.value }))}
                  className="mt-1 w-full rounded border px-3 py-1.5 text-sm h-16"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProofModalId(null)}
                  className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Button type="submit">Submit Completion</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
