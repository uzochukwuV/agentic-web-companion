import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, FileText, Zap, Users, BarChart3, Database, Workflow, Menu, X } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", icon: Zap },
    { to: "/leads", label: "Leads", icon: Users },
    { to: "/intel", label: "Intel", icon: BarChart3 },
    { to: "/extract", label: "Extract", icon: Database },
    { to: "/workflows", label: "Workflows", icon: Workflow },
    { to: "/copilot", label: "Copilot", icon: BookOpen },
    { to: "/qa", label: "QA", icon: FileText },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-foreground text-lg">
            Dev<span className="text-primary">Agent</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-primary/10 rounded-md"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                <span className="relative flex items-center gap-1">
                  <link.icon className="w-3 h-3" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background border-b border-border px-4 pb-4"
        >
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-md ${
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
