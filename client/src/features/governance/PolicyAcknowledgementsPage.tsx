import { useEffect, useState } from "react";
import { api, getApiError } from "../../api/client";

interface Policy {
  id: string;
  title: string;
  description: string;
  version: string;
  effectiveDate: string;
}

interface Acknowledged {
  policyId: string;
  acknowledgedAt: string;
}

export default function PolicyAcknowledgementsPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [acknowledged, setAcknowledged] = useState<Acknowledged[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [policiesRes, ackRes] = await Promise.all([
        api.get<{ data: Policy[] }>("/esg-policies", { params: { limit: 100 } }),
        api.get<{ data: Acknowledged[] }>("/governance/my-acknowledgements")
      ]);
      setPolicies(policiesRes.data.data.filter((p: any) => p.status === "ACTIVE"));
      setAcknowledged(ackRes.data.data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcknowledge = async (policyId: string) => {
    try {
      await api.post("/governance/acknowledge", { policyId });
      alert("Policy acknowledged successfully!");
      fetchData();
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const ackMap = new Set(acknowledged.map((a) => a.policyId));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📜 Policy Acknowledgements</h1>
        <p className="text-sm text-gray-500">Read and sign off on our ESG guidelines and ethical standards policies.</p>
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-400 py-12">Loading policies...</div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : policies.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-12">No active ESG policies require acknowledgement.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {policies.map((p) => {
            const isAcked = ackMap.has(p.id);
            const ackDate = acknowledged.find((a) => a.policyId === p.id)?.acknowledgedAt;

            return (
              <div key={p.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">v{p.version}</span>
                    <span className="text-xs text-gray-400">Effective: {new Date(p.effectiveDate).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mt-2">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-2 whitespace-pre-line">{p.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between">
                  {isAcked ? (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      ✅ Acknowledged on {new Date(ackDate!).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-500 font-medium">⚠️ Sign-off required</span>
                  )}

                  {!isAcked && (
                    <button
                      onClick={() => handleAcknowledge(p.id)}
                      className="rounded bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      Acknowledge Policy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
