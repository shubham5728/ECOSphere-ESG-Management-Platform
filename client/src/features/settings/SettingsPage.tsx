import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../../api/settings";
import type { Settings } from "../../api/settings";
import { getApiError } from "../../api/client";
import { Toggle } from "../../components/ui/Toggle";
import { Button } from "../../components/ui/Button";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((e) => setError(getApiError(e)))
      .finally(() => setLoading(false));
  }, []);

  function patch(partial: Partial<Settings>) {
    setSettings((s) => (s ? { ...s, ...partial } : s));
    setMessage("");
    setError("");
  }

  const weightSum = settings
    ? settings.weightEnv + settings.weightSocial + settings.weightGov
    : 0;
  const weightsValid = weightSum === 100;

  async function handleSave() {
    if (!settings) return;
    if (!weightsValid) {
      setError("ESG weightages must sum to exactly 100%.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateSettings({
        autoEmission: settings.autoEmission,
        evidenceRequired: settings.evidenceRequired,
        badgeAutoAward: settings.badgeAutoAward,
        weightEnv: settings.weightEnv,
        weightSocial: settings.weightSocial,
        weightGov: settings.weightGov,
      });
      setSettings(updated);
      setMessage("Settings saved successfully.");
    } catch (e) {
      setError(getApiError(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-400">Loading settings…</p>;
  if (!settings) return <p className="text-red-500">{error || "Failed to load settings."}</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ESG Configuration</h1>
        <p className="text-sm text-gray-500">
          Platform-wide rules and scoring weightages.
        </p>
      </div>

      {/* Feature toggles */}
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Automation Rules
        </h2>
        <div className="divide-y divide-gray-50">
          <Toggle
            label="Auto Emission Calculation"
            description="Auto-calculate Carbon Transactions from linked operational records."
            checked={settings.autoEmission}
            onChange={(v) => patch({ autoEmission: v })}
          />
          <Toggle
            label="Evidence Requirement"
            description="CSR participation cannot be approved without an attached proof file."
            checked={settings.evidenceRequired}
            onChange={(v) => patch({ evidenceRequired: v })}
          />
          <Toggle
            label="Badge Auto-Award"
            description="Automatically award badges the moment an employee meets the unlock rule."
            checked={settings.badgeAutoAward}
            onChange={(v) => patch({ badgeAutoAward: v })}
          />
        </div>
      </section>

      {/* ESG weightages */}
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          ESG Score Weightages
        </h2>
        <p className="mb-4 text-xs text-gray-500">
          Used to compute the Overall ESG Score. Must total 100%.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <WeightInput
            label="Environmental"
            value={settings.weightEnv}
            onChange={(v) => patch({ weightEnv: v })}
          />
          <WeightInput
            label="Social"
            value={settings.weightSocial}
            onChange={(v) => patch({ weightSocial: v })}
          />
          <WeightInput
            label="Governance"
            value={settings.weightGov}
            onChange={(v) => patch({ weightGov: v })}
          />
        </div>
        <div
          className={`mt-3 text-sm font-medium ${
            weightsValid ? "text-green-600" : "text-red-500"
          }`}
        >
          Total: {weightSum}% {weightsValid ? "✓" : "(must be 100%)"}
        </div>
      </section>

      {message && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <div className="w-40">
        <Button onClick={handleSave} loading={saving} disabled={!weightsValid}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function WeightInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-7 text-sm outline-none focus:ring-2 focus:ring-brand-500/40"
        />
        <span className="absolute right-3 top-2.5 text-sm text-gray-400">%</span>
      </div>
    </div>
  );
}
