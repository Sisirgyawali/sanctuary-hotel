import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyOtp, resendOtp, user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (user) {
    const from = location.state?.from || (user.role === "admin" ? "/admin" : "/dashboard");
    navigate(from, { replace: true });
  }

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  // OTP verification step
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resending, setResending] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const userData = await login(loginEmail, loginPassword);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate(userData.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      const message = error.response?.data?.detail || "Invalid email or password. Please try again.";
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
  e.preventDefault();
  setSignupError("");

  // Basic client-side email shape check before hitting the backend
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(signupEmail)) {
    setSignupError("Please enter a valid email address (e.g. name@example.com).");
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(`${API}/auth/signup`, {
      email: signupEmail, password: signupPassword, name: signupName
    });
    setOtpEmail(response.data.email);
    setAwaitingOtp(true);
    toast.success("Verification code sent to your email!");
  } catch (error) {
    let message = "Signup failed. Please try again.";
    if (error.response?.status === 422) {
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        message = detail[0]?.msg || "Please enter a valid email address.";
      } else if (typeof detail === "string") {
        message = detail;
      } else {
        message = "Please enter a valid email address.";
      }
    } else if (error.response?.data?.detail) {
      message = error.response.data.detail;
    }
    setSignupError(message);
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setLoading(true);
    try {
      const userData = await verifyOtp(otpEmail, otpValue);
      toast.success(`Welcome to The Sanctuary, ${userData.name}!`);
      navigate("/dashboard");
    } catch (error) {
      setOtpError(error.response?.data?.detail || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setOtpError("");
    try {
      await resendOtp(otpEmail);
      toast.success("A new code has been sent to your email.");
    } catch (error) {
      setOtpError(error.response?.data?.detail || "Failed to resend code.");
    } finally {
      setResending(false);
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
          {awaitingOtp ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4" data-testid="otp-form">
              <div className="text-center mb-4">
                <h2 className="font-display text-2xl text-[#1A3C34] mb-2">Verify Your Email</h2>
                <p className="text-[#8C8C8C] text-sm">
                  We sent a 6-digit code to <span className="text-[#1A3C34] font-medium">{otpEmail}</span>
                </p>
              </div>

              {otpError && (
                <div data-testid="otp-error" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                  {otpError}
                </div>
              )}

              <div>
                <label className="block text-[#1A3C34] text-xs uppercase tracking-widest mb-2">Verification Code</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                  data-testid="otp-input"
                  placeholder="123456"
                  className="text-center text-2xl tracking-[0.5em]"
                  required
                />
              </div>

              <Button type="submit" disabled={loading || otpValue.length !== 6} data-testid="verify-otp-btn"
                className="w-full bg-[#1A3C34] hover:bg-[#142E28] text-white text-xs uppercase tracking-widest py-6 btn-scale">
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <div className="text-center pt-2">
                <button type="button" onClick={handleResendOtp} disabled={resending}
                  className="text-[#1A3C34]/70 hover:text-[#D4AF37] text-sm underline transition-colors">
                  {resending ? "Resending..." : "Didn't get a code? Resend"}
                </button>
              </div>

              <div className="text-center">
                <button type="button" onClick={() => { setAwaitingOtp(false); setOtpValue(""); setOtpError(""); }}
                  className="text-[#8C8C8C] hover:text-[#1A3C34] text-xs transition-colors">
                  ← Use a different email
                </button>
              </div>
            </form>
          ) : (
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
                  {loginError && (
                    <div data-testid="login-error" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                      {loginError}
                    </div>
                  )}
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
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4" data-testid="signup-form">
                  {signupError && (
                    <div data-testid="signup-error" className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                      {signupError}
                    </div>
                  )}
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
                    {loading ? "Sending Code..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
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
