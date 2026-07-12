import { useEffect, useState } from "react";
import { api, getApiError } from "../../api/client";
import { useAuth } from "../../store/AuthContext";

interface Participation {
  id: string;
  proofUrl?: string;
  proofNote?: string;
  status: string;
  xpAwarded: number;
  pointsAwarded: number;
  submittedAt: string;
  user: { name: string };
  csrActivity: { title: string };
}

export default function ParticipationsPage() {
  const { user } = useAuth();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});

  const fetchParticipations = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Participation[] }>("/social/participations");
      setParticipations(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipations();
  }, []);

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.patch(`/social/participations/${id}/review`, {
        status,
        reviewNote: reviewNote[id] || undefined
      });
      alert(`Participation ${status.toLowerCase()}`);
      fetchParticipations();
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const showActions = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📝 CSR Participations</h1>
        <p className="text-sm text-gray-500">Track and review employee participation entries for CSR drives.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-12">Loading entries...</div>
        ) : participations.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-12">No participations logged yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Activity</th>
                <th className="px-4 py-3 text-left">Note/Proof</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                {showActions && <th className="px-4 py-3 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {participations.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">{p.user.name}</td>
                  <td className="px-4 py-3">{p.csrActivity.title}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-800">{p.proofNote || "No note"}</p>
                    {p.proofUrl && (
                      <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline block mt-0.5">
                        View Proof Link
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.status === "APPROVED" ? "bg-green-50 text-green-700" :
                      p.status === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.submittedAt).toLocaleDateString()}</td>
                  {showActions && (
                    <td className="px-4 py-3">
                      {p.status === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add review note..."
                            value={reviewNote[p.id] || ""}
                            onChange={(e) => setReviewNote(prev => ({ ...prev, [p.id]: e.target.value }))}
                            className="rounded border border-gray-200 px-2 py-1 text-xs outline-none"
                          />
                          <button
                            onClick={() => handleReview(p.id, "APPROVED")}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(p.id, "REJECTED")}
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Reviewed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
