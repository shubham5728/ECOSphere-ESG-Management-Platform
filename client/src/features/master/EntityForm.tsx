import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, getApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import type { FieldConfig, SelectOption } from "./types";

interface Props<T> {
  fields: FieldConfig[];
  initial?: Partial<T> | null;
  submitting: boolean;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

function buildInitialValues(fields: FieldConfig[], initial?: Record<string, unknown> | null) {
  const values: Record<string, unknown> = {};
  for (const f of fields) {
    const existing = initial?.[f.name];
    values[f.name] = existing ?? f.defaultValue ?? (f.type === "number" ? 0 : "");
  }
  return values;
}

export function EntityForm<T>({
  fields,
  initial,
  submitting,
  onSubmit,
  onCancel,
}: Props<T>) {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    buildInitialValues(fields, initial as Record<string, unknown>)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [asyncOptions, setAsyncOptions] = useState<Record<string, SelectOption[]>>({});

  // Load async select options (e.g. parent department list) once on mount.
  useEffect(() => {
    fields
      .filter((f) => f.optionsSource)
      .forEach(async (f) => {
        try {
          const { data } = await api.get(f.optionsSource!.apiPath, {
            params: { limit: 100 },
          });
          const opts: SelectOption[] = (data.data as Record<string, unknown>[]).map((row) => ({
            label: String(row[f.optionsSource!.labelKey]),
            value: String(row[f.optionsSource!.valueKey]),
          }));
          setAsyncOptions((prev) => ({ ...prev, [f.name]: opts }));
        } catch {
          /* ignore — field just shows no options */
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setValue(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const val = values[f.name];
      if (f.required && (val === "" || val === null || val === undefined)) {
        e[f.name] = `${f.label} is required`;
      }
      if (f.type === "number" && val !== "" && val !== null) {
        const n = Number(val);
        if (Number.isNaN(n)) e[f.name] = `${f.label} must be a number`;
        else if (f.min !== undefined && n < f.min)
          e[f.name] = `${f.label} must be at least ${f.min}`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setFormError("");
    if (!validate()) return;
    // Coerce number fields before sending.
    const payload: Record<string, unknown> = { ...values };
    for (const f of fields) {
      if (f.type === "number") payload[f.name] = Number(payload[f.name]);
    }
    try {
      await onSubmit(payload);
    } catch (err) {
      setFormError(getApiError(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((f) => {
        const options = f.options ?? asyncOptions[f.name] ?? [];
        const err = errors[f.name];
        const val = values[f.name] as string | number;
        return (
          <div key={f.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>

            {f.type === "select" ? (
              <select
                value={String(val ?? "")}
                onChange={(e) => setValue(f.name, e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 ${
                  err ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option value="">— Select —</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea
                value={String(val ?? "")}
                placeholder={f.placeholder}
                onChange={(e) => setValue(f.name, e.target.value)}
                rows={3}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 ${
                  err ? "border-red-400" : "border-gray-300"
                }`}
              />
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                value={String(val ?? "")}
                placeholder={f.placeholder}
                min={f.min}
                onChange={(e) => setValue(f.name, e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/40 ${
                  err ? "border-red-400" : "border-gray-300"
                }`}
              />
            )}

            {f.helpText && !err && <p className="text-xs text-gray-400">{f.helpText}</p>}
            {err && <p className="text-xs text-red-500">{err}</p>}
          </div>
        );
      })}

      {formError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <div className="w-32">
          <Button type="submit" loading={submitting}>
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}
