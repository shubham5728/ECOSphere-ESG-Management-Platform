import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-white pt-16 sm:pt-24 lg:pt-32 pb-16">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#16a34a] to-[#0d9488] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Sustainability Made <span className="text-green-600">Simple</span> & Rewarding.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Track carbon emissions, complete ESG goals, and reward your employees for making a greener impact—all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all"
            >
              Get Started for Free
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-green-600 transition-colors"
            >
              Log in <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      name: "Role-Based Dashboards",
      description: "Tailored analytics and views for Admins, Managers, and Employees. See only what matters to you.",
      icon: "📊",
    },
    {
      name: "Gamification & Rewards",
      description: "Win XP, collect badges, and redeem real rewards for saving carbon and completing sustainability tasks.",
      icon: "🎮",
    },
    {
      name: "ESG Reporting",
      description: "Generate full ESG compliance and sustainability reports with a single click. Keep auditors happy.",
      icon: "📜",
    },
    {
      name: "Real-Time Notifications",
      description: "Stay updated instantly on all activities, pending approvals, and company-wide environmental goals.",
      icon: "⚡",
    },
  ];

  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-green-600">Platform Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for ESG Management
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-start bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="rounded-lg bg-green-50 p-3 ring-1 ring-green-100 mb-4 text-2xl">
                  {feature.icon}
                </div>
                <dt className="font-semibold text-gray-900">
                  {feature.name}
                </dt>
                <dd className="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto text-sm">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const steps = [
    { step: 1, title: "Log Activities", desc: "Employees log their daily CSR activities or carbon-saving tasks." },
    { step: 2, title: "Track & Analyze", desc: "Managers and Admins track real-time data and progress on the dashboard." },
    { step: 3, title: "Earn & Grow", desc: "Employees earn badges and rewards while the company achieves its ESG goals." },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
        <p className="mt-4 text-lg text-gray-600 mb-16">Three simple steps to a greener workplace.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="relative flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white text-2xl font-bold shadow-lg mb-6 z-10 relative">
                {s.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-600 max-w-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AudienceSection() {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center mb-16">
          For Everyone in the Company
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-4">👑</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Admins</h3>
            <p className="text-gray-600 text-sm">Control company-wide data, manage master configurations, and ensure ESG compliance effortlessly.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-4">👔</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Managers</h3>
            <p className="text-gray-600 text-sm">Track team performance, approve challenge submissions, and monitor department goal progress.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-4">👨‍💻</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Employees</h3>
            <p className="text-gray-600 text-sm">Participate in challenges, log daily green activities, and earn exciting rewards for contributions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CtaSection() {
  const navigate = useNavigate();
  return (
    <div className="bg-green-700 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to build a greener future with your team?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-green-100">
          Join EcoSphere today and take the first step towards transparent, rewarding, and effective ESG management.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={() => navigate("/signup")}
            className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-green-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all"
          >
            Join EcoSphere Now
          </button>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8 text-center">
        <p className="text-center text-xs leading-5 text-gray-500">
          &copy; {new Date().getFullYear()} EcoSphere, Inc. All rights reserved.
        </p>
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
    <div className="bg-white min-h-screen">
      {/* Top Navbar */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <span className="text-xl font-bold text-green-700">🌍 EcoSphere</span>
          </div>
        </nav>
      </header>

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AudienceSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
