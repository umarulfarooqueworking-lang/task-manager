"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { loginSchema } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Shield, Briefcase, UserCheck, Lock, Mail, AlertCircle, Info } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, isDemoMode, loginAsDemoUser, isSupabaseConfigured, profiles } = useData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrors({ form: error.message });
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const { data: profile, error: profError } = await supabase
            .from("profiles")
            .select("*, manager:manager_id(id, full_name, email)")
            .eq("id", data.user.id)
            .single();

          if (profError || !profile) {
            setErrors({ form: "Could not find profile for this account" });
            setIsLoading(false);
            return;
          }

          setCurrentUser(profile);
          router.push(`/${profile.role}`);
          return;
        }
      }

      // Demo mode fallback / match demo profiles
      const matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        localStorage.setItem("taskflow_current_user", JSON.stringify(matched));
        router.push(`/${matched.role}`);
      } else {
        setErrors({
          form: "No user found with this email in demo mode. Try one of the quick test accounts below or register via Admin.",
        });
      }
    } catch (err: any) {
      setErrors({ form: err.message || "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role: "admin" | "manager" | "employee") => {
    loginAsDemoUser(role);
    router.push(`/${role}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CheckSquare className="h-6 w-6" />
            </div>
            <span>Task<span className="text-foreground">Flow</span></span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h1>
          <p className="text-sm text-muted-foreground">
            One unified login for Admins, Managers, and Employees
          </p>
        </div>

        {/* Login Card */}
        <Card className="border shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-4">
              {errors.form && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-3 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                Sign In
              </Button>
            </CardContent>
          </form>

          {/* Quick Demo Logins */}
          <CardFooter className="flex flex-col border-t bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-primary" />
                Quick Test Logins (1-Click)
              </span>
              <Badge variant="outline" className="text-[10px]">Instant</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-9 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/50"
                onClick={() => handleQuickFill("admin")}
              >
                <Shield className="h-3.5 w-3.5 mr-1 text-purple-600" />
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-9 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/50"
                onClick={() => handleQuickFill("manager")}
              >
                <Briefcase className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                Manager
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-9 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50"
                onClick={() => handleQuickFill("employee")}
              >
                <UserCheck className="h-3.5 w-3.5 mr-1 text-blue-600" />
                Employee
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground">
          Protected by Supabase Auth & PostgreSQL Row-Level Security
        </p>
      </div>
    </div>
  );
}
