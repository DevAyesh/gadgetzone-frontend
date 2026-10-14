"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser, verifyRegisterOtp, resendOtp, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth-store";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAnyLoading = loading || googleLoading;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg(null);
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg("Full name is required");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      toast.success("Account created! Verification code sent to your email.");
      setStep("otp");
      startCooldown();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to register. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setErrorMsg("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyRegisterOtp({
        email: formData.email.trim().toLowerCase(),
        otp: cleanOtp,
      });

      const user = res.data;
      const token = res.data?.token;

      if (user && token) {
        setAuth(user, token);
        toast.success("Email verified successfully! Welcome to GadgetZone.");
        router.push("/account");
      } else {
        toast.success("Email verified successfully! Please sign in.");
        router.push("/login");
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Invalid or expired OTP code.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setErrorMsg(null);

    try {
      await resendOtp({
        email: formData.email.trim().toLowerCase(),
        purpose: "REGISTER",
      });
      toast.success("A new verification code has been sent to your email.");
      startCooldown();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to resend code. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-20 flex justify-center">
      <Card className="w-full max-w-md border-border/50 glass-card shadow-2xl">
        {step === "form" ? (
          <>
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Join GadgetZone for exclusive tech deals, fast checkout, and order tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-center font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    disabled={isAnyLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    disabled={isAnyLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={isAnyLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={isAnyLoading}
                  />
                </div>

                <Button className="w-full mt-4 h-11 text-base font-semibold" type="submit" disabled={isAnyLoading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Register & Get Verification Code"
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-medium">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <GoogleSignInButton
                  text="signup_with"
                  redirectTo={next}
                  disabled={isAnyLoading}
                  onLoadingChange={setGoogleLoading}
                  onError={(err) => setErrorMsg(err)}
                />

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link className="text-primary hover:underline underline-offset-4 font-semibold" href="/login">
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
              <CardDescription>
                We sent a 6-digit confirmation code to{" "}
                <span className="font-semibold text-foreground">{formData.email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-center font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-center block text-sm font-medium">
                    Enter 6-Digit Verification Code
                  </Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setErrorMsg(null);
                    }}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-14 font-bold"
                    autoFocus
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Check your inbox and spam folder for the email from GadgetZone.
                  </p>
                </div>

                <Button className="w-full h-11 text-base font-semibold" type="submit" disabled={loading || otp.length < 6}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Code...
                    </>
                  ) : (
                    "Verify Email & Continue"
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setOtp("");
                      setErrorMsg(null);
                    }}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium text-xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || resending}
                    className="text-primary hover:underline font-medium text-xs disabled:opacity-50 disabled:no-underline"
                  >
                    {resending ? (
                      "Sending..."
                    ) : resendCooldown > 0 ? (
                      `Resend code in ${resendCooldown}s`
                    ) : (
                      "Resend Verification Code"
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading registration...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
