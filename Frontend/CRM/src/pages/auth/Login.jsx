import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, getProfile, requestAccess } from "../../api/authApi";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import Modal from "../../components/Modal";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Access request states
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestPassword, setRequestPassword] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const handleRequestAccessSubmit = async (e) => {
    e.preventDefault();
    if (
      !requestName.trim() ||
      !requestEmail.trim() ||
      !requestPassword.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmittingRequest(true);
    const requestToast = toast.loading("Submitting access request...");
    try {
      await requestAccess({
        name: requestName,
        email: requestEmail,
        password: requestPassword,
      });
      toast.success(
        "Access request submitted successfully! Pending approval.",
        { id: requestToast },
      );
      setIsAccessModalOpen(false);
      setRequestName("");
      setRequestEmail("");
      setRequestPassword("");
    } catch (err) {
      console.error("Access request error:", err);
      toast.error(
        err.response?.data?.message || "Failed to submit access request",
        { id: requestToast },
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const loginToast = toast.loading("Logging in...");
    try {
      console.log("Attempting login for:", email);
      const response = await loginUser({ email, password });
      console.log("Login success, token received");
      localStorage.setItem("token", response.data.token);

      // Fetch profile to get full user data
      const profileResponse = await getProfile();
      login(profileResponse.data);

      toast.success(`Welcome back, ${profileResponse.data.name}!`, {
        id: loginToast,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "An error occurred during login";
      if (!err.response) {
        errorMessage =
          "Cannot connect to server. Is the backend running on port 8080?";
      } else if (err.response.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (err.response.status === 403) {
        errorMessage = "Access denied";
      } else {
        errorMessage = err.response.data?.message || errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage, { id: loginToast });
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white">
      {/* Global Background Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Left Side: Branding & Animated Map */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-center px-20">
        {/* The Animated Wallpaper stays here for high impact */}
        <div className="absolute inset-0 z-0 opacity-40">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="mapGradientDark"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <g fill="url(#mapGradientDark)" opacity="0.4">
              <path d="M100,150 Q150,130 250,140 Q300,160 280,250 Q250,320 150,300 Q80,250 100,150 Z" />
              <path d="M250,350 Q300,340 350,380 Q340,480 280,550 Q220,500 250,350 Z" />
              <path d="M450,120 Q600,80 850,110 Q900,150 880,250 Q800,350 600,330 Q450,300 450,120 Z" />
              <path d="M480,320 Q550,300 620,330 Q650,450 550,520 Q450,450 480,320 Z" />
              <path d="M800,450 Q850,440 880,480 Q870,540 820,550 Q780,520 800,450 Z" />
            </g>
            <g stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1" fill="none">
              <path d="M200,200 Q400,150 600,150" className="animate-pulse" />
              <path
                d="M280,450 Q450,350 550,400"
                className="animate-pulse"
                style={{ animationDelay: "1s" }}
              />
              <path
                d="M600,150 Q850,200 850,500"
                className="animate-pulse"
                style={{ animationDelay: "2s" }}
              />
            </g>
            {[
              { x: 200, y: 200 },
              { x: 600, y: 150 },
              { x: 280, y: 450 },
              { x: 550, y: 400 },
              { x: 850, y: 500 },
            ].map((dot, i) => (
              <circle
                key={i}
                cx={dot.x}
                cy={dot.y}
                r="3"
                fill="#6366f1"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))}
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="text-8xl font-black text-white tracking-tighter mb-4">
            CRM<span className="text-indigo-500">.</span>
          </h1>
          <div className="h-1.5 w-24 bg-indigo-500 mb-8 rounded-full"></div>
          <p className="text-2xl text-indigo-100 font-light leading-relaxed max-w-md">
            Connecting Relationships.
            <br />
            <span className="font-bold text-white">Empowering Growth.</span>
          </p>
          <p className="mt-6 text-indigo-300/60 text-sm font-medium tracking-widest uppercase">
            Global Enterprise Solution
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 lg:px-24 bg-white z-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-left">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
              Sign in to your account
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Welcome back! Please enter your details.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-3.5 rounded-r-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-4 w-4 text-rose-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-2.5">
                  <p className="text-xs text-rose-700 font-bold">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 sm:text-xs transition-all font-medium shadow-sm"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 sm:text-xs transition-all font-medium shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all font-semibold text-xs shadow flex items-center justify-center space-x-2 cursor-pointer mt-6"
            >
              <span>Sign In</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Need a job?{" "}
              <span
                onClick={() => setIsAccessModalOpen(true)}
                className="text-indigo-600 hover:underline cursor-pointer font-bold"
              >
                Apply here
              </span>
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAccessModalOpen}
        onClose={() => {
          if (!isSubmittingRequest) setIsAccessModalOpen(false);
        }}
        title="Request System Access"
      >
        <form onSubmit={handleRequestAccessSubmit} className="space-y-4 p-1">
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Enter the details you want to use for your account. A system
            administrator will review and approve your application.
          </p>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 font-semibold">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 font-semibold">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              value={requestEmail}
              onChange={(e) => setRequestEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 font-semibold">
              Desired Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              value={requestPassword}
              onChange={(e) => setRequestPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              disabled={isSubmittingRequest}
              onClick={() => setIsAccessModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer shadow-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingRequest}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmittingRequest ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
