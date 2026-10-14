"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, sendLoginOtp, verifyLoginOtp, resendOtp, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth-store";
import { Loader2, ShieldAlert, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const isAdminLogin = next === "/admin" || next.startsWith("/admin");

  const setAuth = useAuthStore((s) => s.setAuth);

  const [mode, setMode] = useState<"password" | "passwordless">("password");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAnyLoading = loading || googleLoading;

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

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      // If 2FA OTP challenge is triggered by backend
      if (res.requireOtp || res.data?.requireOtp) {
        toast.info("Two-factor authentication required. Verification code sent.");
        setStep("otp");
        startCooldown();
        return;
      }

      const user = res.data;
      const token = res.token || res.data?.token;

      if (user && token) {
        setAuth(user, token);
        toast.success(`Welcome back, ${user.name}!`);
        const isAdmin = Boolean(user.isAdmin || user.role === "admin");
        if (next && next !== "/") {
          router.push(next);
        } else if (isAdmin) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        toast.error("Unexpected login response. Please try again.");
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Invalid email or password.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await sendLoginOtp({ email: email.trim().toLowerCase() });
      toast.success("Login verification code sent to your email!");
      setStep("otp");
      startCooldown();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to send login code. Please check your email.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setErrorMsg("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyLoginOtp({
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
      });

      const user = res.data;
      const token = res.token || res.data?.token;

      if (user && token) {
        setAuth(user, token);
        toast.success(`Welcome back, ${user.name}!`);
        const isAdmin = Boolean(user.isAdmin || user.role === "admin");
        if (next && next !== "/") {
          router.push(next);
        } else if (isAdmin) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        toast.error("Verification failed. Please try again.");
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
        email: email.trim().toLowerCase(),
        purpose: "LOGIN",
      });
      toast.success("A new verification code has been sent.");
      startCooldown();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to resend code. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const forgotPasswordLink = isAdminLogin
    ? `/forgot-password?next=${encodeURIComponent(next)}`
    : "/forgot-password";

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 flex justify-center">
      <Card className="w-full max-w-md border-border/50 glass-card shadow-2xl">
        {step === "credentials" ? (
          <>
            <CardHeader className="space-y-1 text-center pb-6">
              {isAdminLogin && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mx-auto mb-2 border border-primary/20">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Administrator Portal
                </div>
              )}

              <CardTitle className="text-3xl font-bold">
                {isAdminLogin ? "Admin Sign In" : "Sign In"}
              </CardTitle>
              <CardDescription>
                {isAdminLogin
                  ? "Enter your administrator credentials to access the admin portal"
                  : "Access your orders, saved addresses, and profile"}
              </CardDescription>

              <div className="flex rounded-lg bg-muted p-1 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    mode === "password"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("passwordless");
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    mode === "passwordless"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Email OTP
                </button>
              </div>
            </CardHeader>

            <CardContent>
              {errorMsg && (
                <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg mb-4 text-center font-medium">
                  {errorMsg}
                </div>
              )}

              {mode === "password" ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {isAdminLogin ? "Administrator Email" : "Email"}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={isAdminLogin ? "admin@gadgetzone.lk" : "m@example.com"}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg(null);
                      }}
                      required
                      disabled={isAnyLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        className="text-sm font-medium text-primary hover:underline underline-offset-4"
                        href={forgotPasswordLink}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMsg(null);
                      }}
                      required
                      disabled={isAnyLoading}
                    />
                  </div>

                  <Button className="w-full mt-4 h-11 text-base font-semibold" type="submit" disabled={isAnyLoading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : isAdminLogin ? (
                      "Sign In to Admin Portal"
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSendOtpLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-otp">
                        {isAdminLogin ? "Registered Admin Email" : "Registered Email Address"}
                      </Label>
                      <Link
                        className="text-xs font-medium text-primary hover:underline"
                        href={forgotPasswordLink}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="email-otp"
                      name="email"
                      type="email"
                      placeholder={isAdminLogin ? "admin@gadgetzone.lk" : "m@example.com"}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg(null);
                      }}
                      required
                      disabled={isAnyLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      We will send a one-time login code to your email.
                    </p>
                  </div>

                  <Button className="w-full mt-4 h-11 text-base font-semibold" type="submit" disabled={isAnyLoading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      "Send Login Code"
                    )}
                  </Button>
                </form>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <GoogleSignInButton
                text="signin_with"
                next={next}
                disabled={isAnyLoading}
                onLoadingChange={setGoogleLoading}
                onError={(err) => setErrorMsg(err)}
              />

              {isAdminLogin ? (
                <div className="mt-6 pt-4 border-t border-border/50 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Administrator unable to sign in or forgot credentials?
                  </p>
                  <div>
                    <Link
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      href={forgotPasswordLink}
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Reset Admin Password via Email OTP
                    </Link>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/"
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Return to Storefront
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link className="text-primary hover:underline underline-offset-4 font-semibold" href="/register">
                      Sign up
                    </Link>
                  </div>
                  <div className="mt-3 text-center text-xs text-muted-foreground">
                    Administrator?{" "}
                    <Link href="/login?next=/admin" className="text-primary hover:underline font-medium">
                      Admin Sign In
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Two-Factor Security Code</CardTitle>
              <CardDescription>
                Enter the 6-digit verification code sent to{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-center font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-otp" className="text-center block text-sm font-medium">
                    Enter 6-Digit Code
                  </Label>
                  <Input
                    id="login-otp"
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
                </div>

                <Button className="w-full h-11 text-base font-semibold" type="submit" disabled={loading || otp.length < 6}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setOtp("");
                      setErrorMsg(null);
                    }}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium text-xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Sign In
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
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Loading sign in...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
