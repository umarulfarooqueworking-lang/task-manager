"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Shield,
  Briefcase,
  UserCheck,
  ArrowRight,
  Database,
  Lock,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { currentUser, loginAsDemoUser } = useData();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") router.push("/admin");
      else if (currentUser.role === "manager") router.push("/manager");
      else if (currentUser.role === "employee") router.push("/employee");
    }
  }, [currentUser, router]);

  const handleQuickDemo = (role: "admin" | "manager" | "employee") => {
    loginAsDemoUser(role);
    router.push(`/${role}`);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero section */}
      <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <Badge variant="info" className="mb-4 px-3 py-1 text-sm font-medium">
          Next.js 14 App Router + Supabase RLS
        </Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Role-Based Task Management for Modern Teams
        </h1>
        <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Streamline accountability across Admins, Managers, and Employees.
          Enforce Row Level Security, structured task submission workflows, and instant reviews.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="gap-2 shadow-md">
              Sign In to TaskFlow <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Quick Demo Access Grid */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-4">
            Try Instant Role Demo (One-Click)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Admin Card */}
            <Card
              className="text-left border-purple-200/60 dark:border-purple-900 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleQuickDemo("admin")}
            >
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-2">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg flex items-center justify-between">
                  Admin Portal
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-purple-600" />
                </CardTitle>
                <CardDescription className="text-xs">
                  Full CRUD on users, manager-employee assignment, system-wide task visibility.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full text-xs font-medium">
                  Enter as Admin
                </Button>
              </CardContent>
            </Card>

            {/* Manager Card */}
            <Card
              className="text-left border-indigo-200/60 dark:border-indigo-900 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleQuickDemo("manager")}
            >
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-2">
                  <Briefcase className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg flex items-center justify-between">
                  Manager Portal
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-indigo-600" />
                </CardTitle>
                <CardDescription className="text-xs">
                  Assign tasks to team members, inspect submissions, approve or reject with reasons.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full text-xs font-medium">
                  Enter as Manager
                </Button>
              </CardContent>
            </Card>

            {/* Employee Card */}
            <Card
              className="text-left border-blue-200/60 dark:border-blue-900 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleQuickDemo("employee")}
            >
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-2">
                  <UserCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg flex items-center justify-between">
                  Employee Portal
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-600" />
                </CardTitle>
                <CardDescription className="text-xs">
                  Review assigned tasks, write work reports, submit for review, track approval status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full text-xs font-medium">
                  Enter as Employee
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 border-t pt-14 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Supabase PostgreSQL Schema</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Extends auth.users with profiles, manager hierarchies, and cascading task workflows.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Strict Row Level Security (RLS)</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Managers only modify their own tasks; employees only edit assigned reports; admins monitor everything.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Zod Validation & Type-Safety</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Robust form validation with instant client feedback and secure server-side verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
