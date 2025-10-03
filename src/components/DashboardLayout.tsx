import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Receipt,
  Target,
  CreditCard,
  Moon,
  Sun,
  LogOut,
  TrendingUp,
  Menu,
  X,
  Shield,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { signOut, user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      }
    };
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.classList.toggle("dark");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/transactions", label: "Transactions", icon: Receipt },
    { path: "/goals", label: "Goals", icon: Target },
    { path: "/loans", label: "Loans", icon: CreditCard },
  ];

  const adminNavItems = isAdmin
    ? [{ path: "/admin", label: "Admin", icon: Shield }]
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="glass-card-strong border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl gradient-primary">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">FinTrack</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={signOut}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 glass-card-strong border-r transition-transform duration-300 z-40 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <nav className="p-4 space-y-2">
            {[...navItems, ...adminNavItems].map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive ? "gradient-primary" : ""
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
