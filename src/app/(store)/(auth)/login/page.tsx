import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "../actions";

export default async function LoginPage(props: { searchParams: Promise<{ error?: string, next?: string }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;
  const next = searchParams?.next;

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 flex justify-center">
      <Card className="w-full max-w-md border-border/50 glass-card">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <input type="hidden" name="next" value={next || "/"} />
            {error && (
              <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md mb-4 text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                Email
              </label>
              <input 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="email" name="email"
                placeholder="m@example.com" 
                required 
                type="email" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                  Password
                </label>
                <Link className="text-sm font-medium text-primary hover:underline underline-offset-4" href="#">
                  Forgot password?
                </Link>
              </div>
              <input 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="password" name="password"
                required 
                type="password" 
              />
            </div>
            <Button className="w-full mt-4" type="submit">Sign In</Button>
            
            <div className="mt-6 text-center text-sm">
              Don't have an account?{" "}
              <Link className="text-primary hover:underline underline-offset-4 font-medium" href="/register">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
