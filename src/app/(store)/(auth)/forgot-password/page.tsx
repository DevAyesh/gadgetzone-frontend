"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, resetPassword, resendOtp, ApiError } from "@/lib/api";
import { Loader2, KeyRound, CheckCircle2, ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const isAdminFlow = next === "/admin" || next.startsWith("/admin");

  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email: cleanEmail });
      toast.success(res.message || "Password reset code sent to your email!");
      setStep("reset");
      startCooldown();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to send reset code. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setErrorMsg("Please enter the 6-digit verification code");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
        newPassword,
      });

      toast.success(res.message || "Password reset successfully!");
      setStep("success");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to reset password. Please verify your OTP code.";
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
        email: email.trim().toLowerCase(),
        purpose: "PASSWORD_RESET",
      });
      toast.success("A new password reset code has been sent.");
      startCooldown();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to resend reset code.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const loginLink = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 flex justify-center">
      <Card className="w-full max-w-md border-border/50 glass-card shadow-2xl">
        {step === "request" && (
          <>
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                <KeyRound className="h-6 w-6" />
              </div>

              {isAdminFlow && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mx-auto mb-1 border border-primary/20">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Admin Account Recovery
                </div>
              )}

              <CardTitle className="text-2xl font-bold">
                {isAdminFlow ? "Reset Admin Password" : "Forgot Password?"}
              </CardTitle>
              <CardDescription>
                {isAdminFlow
                  ? "Enter your registered administrator email address and we'll send a 6-digit verification code to reset your password."
                  : "Enter your registered email address and we'll send you a 6-digit verification code to reset your password."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-center font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {isAdminFlow ? "Registered Admin Email" : "Email Address"}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@gadgetzone.lk"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg(null);
                    }}
                    required
                    disabled={loading}
                  />
                  {isAdminFlow && (
                    <p className="text-[11px] text-muted-foreground">
                      Only verified administrator email addresses can reset admin credentials.
                    </p>
                  )}
                </div>

                <Button className="w-full mt-2 h-11 text-base font-semibold" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    href={loginLink}
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    {isAdminFlow ? "Back to Admin Sign In" : "Back to Sign In"}
                  </Link>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step === "reset" && (
          <>
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>
                Enter the code sent to <span className="font-semibold text-foreground">{email}</span> and your new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-center font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp">6-Digit Verification Code</Label>
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
                    className="text-center text-xl tracking-[0.4em] font-mono h-12 font-bold"
                    autoFocus
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMsg(null);
                    }}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMsg(null);
                    }}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                <Button className="w-full mt-2 h-11 text-base font-semibold" type="submit" disabled={loading || otp.length < 6}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Confirm Password Reset"
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setOtp("");
                      setErrorMsg(null);
                    }}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium text-xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Change Email
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
                      "Resend Code"
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step === "success" && (
          <CardContent className="pt-8 pb-8 text-center space-y-5">
            <div className="mx-auto w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Password Reset Complete!</h2>
              <p className="text-sm text-muted-foreground">
                Your password has been reset securely. You can now sign in with your new credentials.
              </p>
            </div>
            <Button
              className="w-full h-11 text-base font-semibold"
              onClick={() => router.push(loginLink)}
            >
              {isAdminFlow ? "Sign In to Admin Portal" : "Sign In with New Password"}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Loading recovery...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
