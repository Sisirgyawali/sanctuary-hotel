import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (user) {
    const from = location.state?.from || (user.role === "admin" ? "/admin" : "/dashboard");
    navigate(from, { replace: true });
  }

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(loginEmail, loginPassword);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await signup(signupEmail, signupPassword, signupName);
      toast.success(`Welcome to The Sanctuary, ${userData.name}!`);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A3C34] flex items-center justify-center px-6" data-testid="auth-page">
      <div className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80')` }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-white mb-2">The Sanctuary</h1>
          <p className="font-accent italic text-[#D4AF37]">Your journey begins here</p>
        </div>

        <div className="bg-white p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#F5F2EB]">
              <TabsTrigger value="login" data-testid="login-tab"
                className="text-xs uppercase tracking-widest data-[state=active]:bg-[#1A3C34] data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" data-testid="signup-tab"
                className="text-xs uppercase tracking-widest data-[state=active]:bg-[#1A3C34] data-[state=active]:text-white">
                Create Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div>
                  <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Email</label>
                  <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    data-testid="login-email-input" placeholder="your@email.com" required />
                </div>
                <div>
                  <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Password</label>
                  <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    data-testid="login-password-input" placeholder="Enter your password" required />
                </div>
                <Button type="submit" disabled={loading} data-testid="login-submit-btn"
                  className="w-full bg-[#1A3C34] hover:bg-[#142E28] text-white text-xs uppercase tracking-widest py-6 btn-scale">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-6 p-4 bg-[#F5F2EB] text-sm">
                <p className="text-[#8C8C8C] mb-2">Demo Admin Account:</p>
                <p className="text-[#1A3C34]">Email: admin@sanctuary.com</p>
                <p className="text-[#1A3C34]">Password: admin123</p>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4" data-testid="signup-form">
                <div>
                  <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Full Name</label>
                  <Input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)}
                    data-testid="signup-name-input" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Email</label>
                  <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                    data-testid="signup-email-input" placeholder="your@email.com" required />
                </div>
                <div>
                  <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Password</label>
                  <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                    data-testid="signup-password-input" placeholder="Create a password" required minLength={6} />
                </div>
                <Button type="submit" disabled={loading} data-testid="signup-submit-btn"
                  className="w-full bg-[#1A3C34] hover:bg-[#142E28] text-white text-xs uppercase tracking-widest py-6 btn-scale">
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => navigate("/")} className="text-white/70 hover:text-[#D4AF37] text-sm transition-colors">
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
