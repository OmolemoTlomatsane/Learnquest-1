import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 bg-zinc-900/80 backdrop-blur-md border-b border-cyan-400/20 shadow-lg"
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-3xl font-extrabold cyber-text font-clash-display tracking-wide">
          LEARNQUEST
        </Link>

        {/* Navigation Links for Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" asChild className="cyber-link">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="cyber-border bg-red-600/20 hover:bg-red-600/40 transition-all"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" asChild className="cyber-link">
                  <Link to="/login">Login</Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button asChild className="cyber-gradient text-white px-6 py-2 font-bold rounded-full shadow-md hover:bg-transparent hover:text-white transition-all">
                  <Link to="/register">Register</Link>
                </Button>
              </motion.div>
            </>
          )}
        </div>

        {/* Hamburger Menu for Small Screens */}
        <div className="md:hidden">
          <Button
            onClick={() => setIsMenuOpen(true)}
            className="text-white p-2 rounded-md focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Side Menu Overlay */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isMenuOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="fixed inset-0 bg-zinc-900/90 z-40 flex justify-end"
      >
        <div className="w-72 bg-zinc-800 p-6 flex flex-col space-y-6">
          <Button
            onClick={() => setIsMenuOpen(false)}
            className="self-end text-white text-xl mb-6"
          >
            X
          </Button>

          {user ? (
            <>
              <Button variant="ghost" asChild className="cyber-link">
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              </Button>

              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="cyber-border bg-red-600/20 hover:bg-red-600/40 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="cyber-link">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </Button>

              <Button asChild className="cyber-gradient text-white px-6 py-2 font-bold rounded-full shadow-md hover:bg-transparent hover:text-white transition-all">
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
