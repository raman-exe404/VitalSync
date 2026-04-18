import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, User, AlertTriangle, FileText, Bell,
  Bot, Stethoscope, Menu, X, Activity
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard",       url: "/dashboard",      icon: LayoutDashboard },
  { title: "Digital Twin",    url: "/digital-twin",   icon: User },
  { title: "Stroke History",  url: "/stroke-history", icon: Activity },
  { title: "SOS Emergency",   url: "/sos",            icon: AlertTriangle },
  { title: "Records",         url: "/records",        icon: FileText },
  { title: "Alerts",          url: "/alerts",         icon: Bell },
  { title: "AI Assistant",    url: "/ai-assistant",   icon: Bot },
  { title: "Doctor Dashboard",url: "/doctor",         icon: Stethoscope },
];

const AppSidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 clay-btn p-3 md:hidden"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-foreground/20 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 z-40 bg-sidebar clay-card rounded-none border-r border-border/50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 border-b border-border/30">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src="/logo.png" alt="VitalSync" className="w-14 h-14 rounded-2xl object-cover shadow-md" />
            <span className="font-heading text-xl font-bold text-foreground">VitalSync</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm font-medium transition-all duration-200 ${
                  active
                    ? "clay-btn text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AppSidebar;
