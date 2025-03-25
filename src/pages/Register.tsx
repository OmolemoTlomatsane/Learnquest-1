import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement actual registration
      toast({
        title: "SYSTEM ACCESS GRANTED",
        description: "Neuro-link established successfully",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "CONNECTION FAILURE",
        description: "Neural handshake rejected",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-zinc-900 to-zinc-800">
      <div className="cyber-border p-[2px] w-full max-w-lg sm:max-w-md rounded-xl bg-zinc-800/50 backdrop-blur-lg">
        <div className="p-8 bg-zinc-900 rounded-xl">
          <h1 className="text-4xl sm:text-3xl text-center mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-clash-display">
            CREATE NEURO-LINK
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="cyber-border p-[2px] rounded-lg">
                <Input
                  type="email"
                  placeholder="NEURAL ID (EMAIL)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-none text-cyan-400 placeholder-zinc-500 font-mono focus:ring-2 focus:ring-cyan-400 w-full"
                  required
                />
              </div>
              <div className="cyber-border p-[2px] rounded-lg">
                <Input
                  type="password"
                  placeholder="ENCRYPTION KEY"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-800 border-none text-purple-400 placeholder-zinc-500 font-mono focus:ring-2 focus:ring-purple-400 w-full"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full cyber-gradient text-zinc-900 hover:text-white font-clash-display py-3 text-lg sm:text-base transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
              INITIATE HANDSHAKE
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-zinc-400 hover:text-cyan-400 font-mono text-sm"
            >
              EXISTING NEURO-LINK? [AUTHENTICATE HERE]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

