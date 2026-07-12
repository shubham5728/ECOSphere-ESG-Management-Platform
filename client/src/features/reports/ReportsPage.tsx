import { useEffect, useState } from "react";
import { api, getApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";

interface Department {
  id: string;
  name: string;
}

interface ReportResponse {
  module: "ENVIRONMENTAL" | "SOCIAL" | "GOVERNANCE" | "SUMMARY";
  summary: Record<string, any>;
  data: Record<string, any>;
}

export default function ReportsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    module: "SUMMARY",
    startDate: "",
    endDate: "",
    departmentId: ""
  });

  useEffect(() => {
    api.get<{ data: Department[] }>("/departments", { params: { limit: 100 } }).then((res) => {
      setDepartments(res.data.data);
    }).catch(() => {});
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ data: ReportResponse }>("/reports/generate", form);
      setReport(res.data.data);
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `ESG Report Module: ${report.module}\n`;
    csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    // Write Summary
    csvContent += "=== SUMMARY METRICS ===\n";
    Object.entries(report.summary).forEach(([key, val]) => {
      csvContent += `${key},${val}\n`;
    });
    csvContent += "\n";

    // Write detailed data lists if present
    if (report.data.transactions && report.data.transactions.length > 0) {
      csvContent += "=== TRANSACTIONS ===\nDescription,Emissions (kgCO2),Recorded At\n";
      report.data.transactions.forEach((tx: any) => {
        csvContent += `"${tx.description}",${tx.emissions},"${new Date(tx.recordedAt).toLocaleDateString()}"\n`;
      });
    } else if (report.data.metrics && report.data.metrics.length > 0) {
      csvContent += "=== SOCIAL METRICS ===\nDepartment,Period,Employees,Female Ratio,Training Hours\n";
      report.data.metrics.forEach((m: any) => {
        csvContent += `"${m.department.name}","${m.period}",${m.totalEmployees},${m.femaleCount},${m.trainingHours}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EcoSphere_ESG_${report.module}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Custom ESG Reports</h1>
          <p className="text-sm text-gray-500">Query and generate print-ready reports for all Environmental, Social, and Governance metrics.</p>
        </div>
      </div>

      {/* Builder Filter Form */}
      <form onSubmit={handleGenerate} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4 print:hidden">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">Report Focus Module</label>
            <select
              value={form.module}
              onChange={(e) => setForm(f => ({ ...f, module: e.target.value }))}
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
            >
              <option value="SUMMARY">📑 Summary Report</option>
              <option value="ENVIRONMENTAL">🌳 Environmental Details</option>
              <option value="SOCIAL">👥 Social Indicators</option>
              <option value="GOVERNANCE">⚖️ Governance Logs</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">From Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
              className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
              className="mt-1 w-full rounded border px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Department Filter</label>
            <select
              value={form.departmentId}
              onChange={(e) => setForm(f => ({ ...f, departmentId: e.target.value }))}
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="w-40">
            <Button type="submit" loading={loading}>Generate Report</Button>
          </div>
        </div>
      </form>

      {/* Generated Report Layout View */}
      {report && (
        <div className="rounded-xl border border-gray-150 bg-white p-6 shadow-md space-y-6 print:border-0 print:shadow-none">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">EcoSphere ESG report</h2>
              <p className="text-xs text-gray-500 mt-1">Focus: <span className="font-semibold text-brand-600">{report.module}</span> · Created: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handleExportCSV}
                className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                📥 Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="rounded bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                🖨️ Print Report
              </button>
            </div>
          </div>

          {/* Aggregated Summaries Section */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 bg-gray-50 p-4 rounded-lg">
            {Object.entries(report.summary).map(([key, val]) => (
              <div key={key}>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{key.replace(/([A-Z])/g, " $1")}</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          {/* List Data Previews */}
          {report.module === "ENVIRONMENTAL" && report.data.transactions && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Carbon Ledger Entries</h3>
              <div className="overflow-hidden rounded border border-gray-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-400 font-semibold">
                    <tr>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">Emissions (kgCO₂)</th>
                      <th className="px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {report.data.transactions.map((tx: any) => (
                      <tr key={tx.id}>
                        <td className="px-4 py-2 font-medium">{tx.description}</td>
                        <td className="px-4 py-2">{tx.department.name}</td>
                        <td className="px-4 py-2 font-semibold text-red-600">{tx.emissions.toFixed(2)}</td>
                        <td className="px-4 py-2 text-gray-400">{new Date(tx.recordedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {report.module === "SOCIAL" && report.data.metrics && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Logged Department Social Metrics</h3>
              <div className="overflow-hidden rounded border border-gray-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-400 font-semibold">
                    <tr>
                      <th className="px-4 py-2">Dept</th>
                      <th className="px-4 py-2">Period</th>
                      <th className="px-4 py-2">Employees</th>
                      <th className="px-4 py-2">Diversity (Female)</th>
                      <th className="px-4 py-2">Training Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {report.data.metrics.map((m: any) => (
                      <tr key={m.id}>
                        <td className="px-4 py-2 font-semibold">{m.department.name}</td>
                        <td className="px-4 py-2">{m.period}</td>
                        <td className="px-4 py-2">{m.totalEmployees}</td>
                        <td className="px-4 py-2">{m.totalEmployees > 0 ? `${Math.round((m.femaleCount / m.totalEmployees) * 100)}%` : "0%"}</td>
                        <td className="px-4 py-2">{m.trainingHours} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {report.module === "GOVERNANCE" && report.data.issues && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Compliance Log Violations</h3>
              <div className="overflow-hidden rounded border border-gray-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-400 font-semibold">
                    <tr>
                      <th className="px-4 py-2">Violation Title</th>
                      <th className="px-4 py-2">Dept</th>
                      <th className="px-4 py-2">Severity</th>
                      <th className="px-4 py-2">Assigned Owner</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {report.data.issues.map((i: any) => (
                      <tr key={i.id}>
                        <td className="px-4 py-2 font-medium">{i.title}</td>
                        <td className="px-4 py-2">{i.department.name}</td>
                        <td className="px-4 py-2 font-semibold">{i.severity}</td>
                        <td className="px-4 py-2">{i.owner.name}</td>
                        <td className="px-4 py-2">{i.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
