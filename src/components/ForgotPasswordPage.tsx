import React, { useRef, useState } from "react";
import { Mail, ArrowLeft, CheckCircle, ShieldCheck } from "lucide-react";
import { apiService } from "../services/api";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export default function ForgotPasswordPage({
  onBack,
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.requestOtp({ email });

      if (response.errorCode === 0) {
        setIsOtpSent(true);
        setOtpDigits(Array(6).fill(""));
        console.log("OTP:", response.data?.otp); // 🔒 Remove in production
      } else {
        setError(
          response.errorMessage ||
            response.data?.message ||
            "Failed to send OTP"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join("");
    if (fullOtp.length < 6) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.verifyOtp({ email, otp: fullOtp });

      if (response.errorCode === 0 && response.data?.verified) {
        setIsVerified(true);
      } else {
        setError(
          response.errorMessage || response.data?.message || "Invalid OTP"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.resetPassword({ email, newPassword });

      if (response.errorCode === 0) {
        setSuccessMessage(
          response.data?.message || "Password reset successfully."
        );
      } else {
        setError(response.errorMessage || "Failed to reset password.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const val = value.replace(/\D/, "");
    if (!val && value !== "") return;

    const updated = [...otpDigits];
    updated[index] = val;
    setOtpDigits(updated);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpBackspace = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (otpDigits[index]) {
        const updated = [...otpDigits];
        updated[index] = "";
        setOtpDigits(updated);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const updated = [...otpDigits];
        updated[index - 1] = "";
        setOtpDigits(updated);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left image section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
          <img src="/image/logo/logo_main_bg.png" alt="logo" className="mb-6" />
          <h1 className="text-5xl font-bold mb-4">
            Your <span className="text-red-400">Kitchen</span>
            <br />
            Your Food...
          </h1>
          <p className="text-xl text-gray-200">
            Manage your restaurant business with our complete food system.
          </p>
        </div>
      </div>

      {/* Right form section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Login</span>
          </button>

          {!isOtpSent && !isVerified && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Forgot Password
              </h2>
              <p className="text-gray-600 mb-4">
                Enter your email and we’ll send you a 6-digit OTP.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {isOtpSent && !isVerified && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verify OTP
              </h2>
              <p className="text-gray-600 mb-4">
                A 6-digit code has been sent to <strong>{email}</strong>.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex justify-between gap-2 mb-6">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    inputMode="numeric"
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpBackspace(e, index)}
                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={otpDigits.includes("") || isLoading}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                Didn’t get the code?{" "}
                <button
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtpDigits(Array(6).fill(""));
                    setError("");
                  }}
                  className="text-red-600 hover:underline"
                >
                  Resend
                </button>
              </p>
            </div>
          )}

          {isVerified && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600 mb-4">
                Enter a new password for <strong>{email}</strong>.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
