"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { googleAuth, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth-store";
import type { UserProfile } from "@/lib/types/auth";
import type { GoogleCredentialResponse } from "@/lib/types/google";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export interface GoogleSignInButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  next?: string;
  redirectTo?: string;
  onSuccess?: (user: UserProfile, token: string) => void;
  onError?: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function GoogleSignInButton({
  text = "continue_with",
  next,
  redirectTo,
  onSuccess,
  onError,
  onLoadingChange,
  className = "",
  disabled = false,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [buttonLoaded, setButtonLoaded] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [scriptTimeout, setScriptTimeout] = useState(false);

  // Keep callback references stable to prevent stale closures
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onLoadingChangeRef = useRef(onLoadingChange);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onLoadingChangeRef.current = onLoadingChange;
  }, [onSuccess, onError, onLoadingChange]);

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response?.credential) {
        const errorText = "No credential received from Google.";
        toast.error(errorText);
        onErrorRef.current?.(errorText);
        return;
      }

      setIsAuthenticating(true);
      onLoadingChangeRef.current?.(true);

      try {
        const res = await googleAuth(response.credential);
        const user = res.data || (res as unknown as UserProfile);
        const token = res.token || res.data?.token;

        if (user && token) {
          // 1. Update Auth Store (persists to localStorage and sets cookie)
          useAuthStore.getState().setAuth(user, token);

          // 2. Cookie handling backup (token cookie with 7-day expiration)
          if (typeof document !== "undefined") {
            document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
          }

          // 3. Toast notification
          toast.success(`Welcome, ${user.name}!`);

          // 4. Custom callback if provided
          if (onSuccessRef.current) {
            onSuccessRef.current(user, token);
            return;
          }

          // 5. Redirection
          const isUserAdmin = Boolean(user.isAdmin || user.role?.toLowerCase() === "admin" || user.isSuperAdmin === true);
          const destination = redirectTo || next;
          let target = destination || (isUserAdmin ? "/admin" : "/");
          if (isUserAdmin && (!destination || destination === "/" || destination === "/account")) {
            target = "/admin";
          }
          router.push(target);
        } else {
          const msg = res.message || "Failed to authenticate with Google.";
          toast.error(msg);
          onErrorRef.current?.(msg);
        }
      } catch (err) {
        const errorMsg =
          err instanceof ApiError
            ? err.message
            : "Google authentication failed. Please try again.";
        toast.error(errorMsg);
        onErrorRef.current?.(errorMsg);
      } finally {
        setIsAuthenticating(false);
        onLoadingChangeRef.current?.(false);
      }
    },
    [next, redirectTo, router]
  );

  const handleCredentialResponseRef = useRef(handleCredentialResponse);
  useEffect(() => {
    handleCredentialResponseRef.current = handleCredentialResponse;
  }, [handleCredentialResponse]);

  const renderGoogleButton = useCallback(() => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;
    if (!buttonContainerRef.current || !clientId) return;

    try {
      // Clear container before rendering to prevent duplicate iframes
      buttonContainerRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res: GoogleCredentialResponse) => {
          handleCredentialResponseRef.current(res);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const parentWidth = buttonContainerRef.current.parentElement?.clientWidth;
      const containerWidth = parentWidth || buttonContainerRef.current.clientWidth || 360;
      const width = Math.min(400, Math.max(200, Math.floor(containerWidth)));

      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        type: "standard",
        theme: resolvedTheme === "dark" ? "filled_black" : "outline",
        size: "large",
        text,
        shape: "rectangular",
        logo_alignment: "left",
        width,
      });

      queueMicrotask(() => {
        setButtonLoaded(true);
        setScriptTimeout(false);
        setScriptError(false);
      });
    } catch (err) {
      console.error("Failed to render Google Sign-In button:", err);
    }
  }, [clientId, resolvedTheme, text]);

  // Initial and subsequent renders when GSI is already present
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      renderGoogleButton();
    }
  }, [renderGoogleButton]);

  // Adblocker or slow connection timeout detection
  useEffect(() => {
    if (buttonLoaded || scriptError || scriptTimeout || !clientId) return;

    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && !window.google?.accounts?.id) {
        setScriptTimeout(true);
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [buttonLoaded, scriptError, scriptTimeout, clientId]);

  // Responsive re-rendering on window resize
  useEffect(() => {
    if (!buttonLoaded) return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderGoogleButton();
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [buttonLoaded, renderGoogleButton]);

  const handleRetry = () => {
    setScriptError(false);
    setScriptTimeout(false);
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      renderGoogleButton();
    }
  };

  if (!clientId) {
    return (
      <div className="p-3 text-xs text-center text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Google Sign-In is not configured.</span>
      </div>
    );
  }

  if (scriptError || scriptTimeout) {
    return (
      <div className="p-3 text-xs text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load Google Sign-In.</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Please check your connection or disable ad-blockers, then retry.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const buttonLabel =
    text === "signup_with"
      ? "Sign up with Google"
      : text === "signin_with"
      ? "Sign in with Google"
      : "Continue with Google";

  return (
    <div className={`relative w-full ${className}`}>
      {/* Google Identity Services Client Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={renderGoogleButton}
        onError={() => setScriptError(true)}
      />

      {/* Target container for GSI iframe - MUST BE EMPTY of React children */}
      <div
        ref={buttonContainerRef}
        className={`w-full flex justify-center min-h-[44px] transition-opacity ${
          disabled || isAuthenticating ? "pointer-events-none opacity-50" : ""
        } ${!buttonLoaded ? "absolute inset-0 opacity-0 pointer-events-none" : ""}`}
      />

      {/* Fallback placeholder rendered before GSI replaces container contents */}
      {!buttonLoaded && (
        <div className="w-full flex justify-center min-h-[44px]">
          <button
            type="button"
            disabled
            className="w-full h-11 px-4 rounded-md border border-input bg-background/50 hover:bg-accent/50 text-foreground text-sm font-medium flex items-center justify-center gap-2 cursor-wait transition-colors shadow-sm"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{buttonLabel}</span>
          </button>
        </div>
      )}

      {/* Authenticating Loading Overlay */}
      {isAuthenticating && (
        <div className="absolute inset-0 bg-background/85 backdrop-blur-xs flex items-center justify-center gap-2 rounded-md z-10 font-medium text-sm border border-primary/20 shadow-sm animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Signing in with Google...</span>
        </div>
      )}
    </div>
  );
}
