import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotif } from "@/hooks/useNotif";

const Navbar = () => {
  const { profile, signOut } = useAuth();
  const { unreadCount, markAllRead } = useNotif();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  const initials = profile?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-20 clay-card rounded-none border-b border-border/30 px-6 py-3 pl-16 md:pl-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 md:hidden">
        <img src="/logo.png" alt="VitalSync" className="w-12 h-12 rounded-2xl object-cover" />
        <span className="font-heading text-lg font-bold">VitalSync</span>
      </Link>
      <div className="hidden md:flex items-center gap-2">
        {profile && (
          <span className="text-sm text-muted-foreground font-body">
            Welcome, <strong className="text-foreground">{profile.name}</strong>
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Link to="/alerts" onClick={markAllRead}
          className="clay-card p-2.5 rounded-full hover:scale-105 transition-transform relative" aria-label="Notifications">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center font-body">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link to="/profile"
          className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm font-heading hover:scale-105 transition-transform shadow-md ring-2 ring-primary/30">
          {initials}
        </Link>
        <button onClick={handleSignOut} className="clay-card p-2.5 rounded-full hover:scale-105 transition-transform" aria-label="Sign out">
          <LogOut className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
