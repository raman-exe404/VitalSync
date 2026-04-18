import { Link } from "react-router-dom";
import { User, AlertTriangle, FileText, Bell, Stethoscope, ArrowRight } from "lucide-react";
import ClayBlobs from "@/components/ClayBlobs";

const features = [
  { icon: User, title: "Digital Twin", desc: "Create a digital health profile that mirrors your real-time vitals" },
  { icon: AlertTriangle, title: "Emergency SOS", desc: "One-tap emergency alert with location sharing to hospitals" },
  { icon: FileText, title: "Medical Records", desc: "Upload, view, and manage all your health records securely" },
  { icon: Bell, title: "Smart Alerts", desc: "Medication reminders, appointment alerts, and emergency notifications" },
  { icon: Stethoscope, title: "Doctor Dashboard", desc: "Healthcare workers can monitor patients and respond to alerts" },
];

const steps = [
  { num: "01", title: "Register", desc: "Create your account as a Patient or Medical Worker" },
  { num: "02", title: "Create Digital Twin", desc: "Fill in your health profile with medical conditions and contacts" },
  { num: "03", title: "Sync Health Data", desc: "Track vitals, upload records, and receive smart alerts" },
  { num: "04", title: "Emergency Support", desc: "Instant SOS alerts with location sharing to nearby hospitals" },
];

const Landing = () => (
  <div className="min-h-screen bg-background relative overflow-hidden">
    <ClayBlobs />

    {/* Navbar */}
    <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="VitalSync" className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
        <span className="font-heading text-2xl font-bold text-foreground">VitalSync</span>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="clay-card px-5 py-2.5 text-sm font-body font-medium text-foreground">Login</Link>
        <Link to="/register" className="clay-btn px-5 py-2.5 text-sm">Register</Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="clay-card p-10 md:p-16 max-w-2xl clay-float">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="VitalSync" className="w-32 h-32 rounded-3xl object-cover shadow-xl" />
        </div>
        <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-foreground leading-tight">
          Vital<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500">Sync</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground font-body max-w-md mx-auto">
          Your AI-powered healthcare companion. Sync your health, stay protected.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link to="/register" className="clay-btn inline-block px-10 py-4 text-lg">
            Get Started <ArrowRight className="inline w-5 h-5 ml-1" />
          </Link>
          <a href="#features" className="clay-card inline-block px-10 py-4 text-lg font-body font-medium text-foreground">
            Learn More
          </a>
        </div>
      </div>
    </section>

    {/* Features */}
    <section id="features" className="relative z-10 px-6 md:px-12 pb-20">
      <h2 className="font-heading text-3xl font-bold text-center mb-12 text-foreground">Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f) => (
          <div key={f.title} className="clay-card p-6 text-center">
            <div className="clay-card w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/10">
              <f.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground font-body">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* How It Works */}
    <section className="relative z-10 px-6 md:px-12 pb-20">
      <h2 className="font-heading text-3xl font-bold text-center mb-12 text-foreground">How It Works</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {steps.map((s) => (
          <div key={s.num} className="clay-card p-6 text-center">
            <div className="clay-card w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-violet-500/10 to-pink-500/10">
              <span className="font-heading text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500">{s.num}</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground font-body">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="relative z-10 px-6 md:px-12 pb-24 text-center">
      <div className="clay-card p-10 max-w-xl mx-auto bg-gradient-to-br from-violet-500/5 to-pink-500/5">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Get Started with VitalSync</h2>
        <p className="mt-3 text-muted-foreground font-body">Free for all patients. Your health, always in sync.</p>
        <Link to="/register" className="clay-btn inline-block mt-6 px-8 py-3 text-base">
          Create Account
        </Link>
      </div>
    </section>
  </div>
);

export default Landing;
