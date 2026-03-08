import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, FileText, Zap } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const links = [
    { to: "/", label: "Home", icon: Zap },
    { to: "/copilot", label: "DevCopilot", icon: BookOpen },
    { to: "/qa", label: "QA Tester", icon: FileText },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-foreground text-lg">
            Dev<span className="text-primary">Agent</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
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
                <span className="relative flex items-center gap-1.5">
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
