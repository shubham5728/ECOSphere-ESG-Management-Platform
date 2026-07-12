import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import {
  ArrowRight,
  BarChart3,
  Leaf,
  ShieldCheck,
  Users,
  Zap,
  Target,
  Trophy,
  Activity,
  FileText,
  Lock,
  Globe2,
} from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">EcoSphere</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition-all hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </nav>
    </header>
  );
}

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50 via-white to-white"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        {/* Announcement Pill */}
        <div className="mb-8 flex justify-center">
          <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 transition-all cursor-pointer bg-white/50 backdrop-blur-sm shadow-sm flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            EcoSphere Platform v2.0 is now live. <a href="#" className="font-semibold text-green-600"><span className="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></a>
          </div>
        </div>

        {/* Headlines */}
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
          Sustainability management, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">simplified.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          The all-in-one ESG platform to track carbon footprints, ensure governance compliance, and drive social impact through employee gamification.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex items-center justify-center gap-x-4">
          <button
            onClick={() => navigate("/signup")}
            className="group flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Start your free trial
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="rounded-full px-6 py-3 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all"
          >
            Sign in
          </button>
        </div>

        {/* Dashboard Mockup / Preview */}
        <div className="mt-16 sm:mt-24 relative mx-auto max-w-5xl">
          <div className="rounded-2xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-3xl lg:p-4 shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex flex-col h-[400px] sm:h-[500px]">
              {/* Mock Browser Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto bg-white border border-gray-200 rounded-md text-[10px] text-gray-400 px-24 py-1 font-mono">
                  app.ecosphere.com
                </div>
              </div>
              {/* Mock UI Content */}
              <div className="flex flex-1 p-6 gap-6 bg-[#f8fafc]">
                {/* Sidebar */}
                <div className="hidden sm:flex flex-col w-48 gap-3">
                  <div className="h-8 w-2/3 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 w-full bg-green-100 rounded-md"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-4/5 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-full bg-gray-200 rounded-md"></div>
                </div>
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="h-6 w-48 bg-gray-800 rounded-md mb-2"></div>
                      <div className="h-3 w-64 bg-gray-400 rounded-md"></div>
                    </div>
                    <div className="h-8 w-24 bg-green-600 rounded-lg shadow-sm"></div>
                  </div>
                  {/* KPI Cards row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100"></div>
                        <div className="h-6 w-16 bg-gray-900 rounded-md"></div>
                        <div className="h-2 w-24 bg-gray-200 rounded-md"></div>
                      </div>
                    ))}
                  </div>
                  {/* Chart area */}
                  <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col gap-4">
                    <div className="h-4 w-32 bg-gray-800 rounded-md"></div>
                    <div className="flex-1 flex items-end gap-2 pb-2">
                      {[40, 70, 45, 90, 65, 85, 55, 100, 75, 60].map((h, idx) => (
                        <div key={idx} className="flex-1 bg-gradient-to-t from-green-500 to-teal-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BentoFeaturesSection() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-green-600">Enterprise Grade</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for ESG
          </p>
          <p className="mt-4 text-lg text-gray-600">
            A comprehensive suite of tools built for modern organizations to track, report, and improve their sustainability footprint.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="md:col-span-2 relative group rounded-3xl bg-gray-50 border border-gray-200 p-8 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Advanced Reporting</h3>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              Generate full ESG compliance reports with a single click. Keep auditors happy and stakeholders informed with real-time analytics.
            </p>
            {/* Decorative background element */}
            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <FileText size={160} className="text-gray-900" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group rounded-3xl bg-gray-50 border border-gray-200 p-8 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Gamification</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Reward employees for eco-friendly actions with XP, badges, and real-world perks.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative group rounded-3xl bg-gray-50 border border-gray-200 p-8 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Compliance</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Track policies, sign-offs, and critical governance issues.
            </p>
          </div>

          {/* Card 4 */}
          <div className="md:col-span-2 relative group rounded-3xl bg-gray-900 border border-gray-800 p-8 overflow-hidden hover:shadow-xl hover:shadow-green-900/20 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 shadow-sm ring-1 ring-white/10">
                <Zap className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Real-Time Actions</h3>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Trigger automated notifications, approve challenge submissions instantly, and monitor department-level progress as it happens.
            </p>
            {/* Glow effect */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-green-500 opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModulesSection() {
  const modules = [
    { title: "Environmental", icon: Globe2, color: "text-green-600", bg: "bg-green-50", ring: "ring-green-100", desc: "Track Scope 1, 2, and 3 carbon emissions. Monitor energy usage and set reduction targets with precision." },
    { title: "Social", icon: Users, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100", desc: "Manage CSR activities, volunteer hours, and community impact. Measure employee participation and wellness." },
    { title: "Governance", icon: Lock, color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-100", desc: "Ensure compliance with policies, track mandatory sign-offs, and maintain a secure audit ledger." },
  ];

  return (
    <div className="bg-gray-50 py-24 sm:py-32 border-t border-b border-gray-200/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {modules.map((m) => (
            <div key={m.title} className="flex flex-col">
              <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${m.bg} ${m.color} ring-1 ${m.ring}`}>
                <m.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{m.title} Pillar</h3>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">
                {m.desc}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-gray-900 group cursor-pointer hover:text-green-600 transition-colors">
                Explore {m.title.toLowerCase()} features <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AudienceTabs() {
  const [activeTab, setActiveTab] = useState("admin");

  const tabs = [
    { id: "admin", label: "For Admins", icon: ShieldCheck },
    { id: "manager", label: "For Managers", icon: Target },
    { id: "employee", label: "For Employees", icon: Activity },
  ];

  const content = {
    admin: {
      title: "Control company-wide data & compliance",
      desc: "Configure master data, manage organizational policies, and generate comprehensive sustainability reports for stakeholders and auditors. Maintain full visibility across all departments.",
      img: "admin-view",
    },
    manager: {
      title: "Track team performance & goals",
      desc: "Monitor department-level ESG scores, approve employee challenge submissions, and drive team participation in CSR activities. Keep your team aligned with company targets.",
      img: "manager-view",
    },
    employee: {
      title: "Participate & earn rewards",
      desc: "Log daily green activities, join sustainability challenges, and earn XP. Climb the leaderboard and redeem your points for exciting real-world rewards.",
      img: "employee-view",
    },
  };

  const activeContent = content[activeTab as keyof typeof content];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Built for the entire organization
          </h2>
        </div>
        
        {/* Tab Headers */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mx-auto max-w-4xl bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 p-10 md:p-12 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{activeContent.title}</h3>
            <p className="text-gray-600 leading-relaxed">{activeContent.desc}</p>
          </div>
          {/* Mock abstract visual for the tab */}
          <div className="flex-1 bg-gray-100 border-l border-gray-200 relative overflow-hidden min-h-[300px] flex items-center justify-center p-8">
             <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-200/50"></div>
             {/* Dynamic wireframe based on tab */}
             <div className="w-full max-w-xs space-y-4 relative z-10">
                <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
                <div className="h-32 w-full bg-white rounded-xl shadow-sm border border-gray-200 flex p-4 gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                    <div className={`mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden`}>
                      <div className={`h-full ${activeTab === 'admin' ? 'bg-purple-400 w-3/4' : activeTab === 'manager' ? 'bg-blue-400 w-1/2' : 'bg-green-400 w-5/6'}`}></div>
                    </div>
                  </div>
                </div>
                <div className="h-16 w-full bg-white rounded-xl shadow-sm border border-gray-200"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CtaSection() {
  const navigate = useNavigate();
  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/40 via-gray-900 to-gray-900"></div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to scale your sustainability?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
          Join leading companies using EcoSphere to track emissions, ensure compliance, and empower employees.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-4">
          <button
            onClick={() => navigate("/signup")}
            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition-all hover:scale-105"
          >
            Start for free
          </button>
          <button
            onClick={() => navigate("/login")}
            className="rounded-full px-8 py-3.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 hover:bg-white/10 transition-all"
          >
            Sign in to platform
          </button>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Twitter</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">GitHub</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0 flex items-center gap-2">
          <Leaf className="h-4 w-4 text-green-600" />
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} EcoSphere, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const { user } = useAuth();

  // If user is already logged in, redirect them to the dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-green-200 selection:text-green-900">
      <Navbar />
      <main>
        <HeroSection />
        <BentoFeaturesSection />
        <ModulesSection />
        <AudienceTabs />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
