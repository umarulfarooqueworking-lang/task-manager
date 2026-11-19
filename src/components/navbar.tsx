"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRoleBadgeVariant } from "@/lib/utils";
import {
  CheckSquare,
  Users,
  ListTodo,
  PlusCircle,
  LogOut,
  Shield,
  Briefcase,
  UserCheck,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isDemoMode, loginAsDemoUser } = useData();

  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const role = currentUser?.role;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-primary">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span>Task<span className="text-foreground">Flow</span></span>
          </Link>

          {/* Navigation links based on role */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1">
              {role === "admin" && (
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === "/admin"
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.startsWith("/admin/users")
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/tasks"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.startsWith("/admin/tasks")
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    All Tasks
                  </Link>
                </>
              )}

              {role === "manager" && (
                <>
                  <Link
                    href="/manager"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === "/manager"
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/manager/employees"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.startsWith("/manager/employees")
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    My Employees
                  </Link>
                  <Link
                    href="/manager/tasks"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === "/manager/tasks"
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    Manage Tasks
                  </Link>
                  <Link
                    href="/manager/tasks/new"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                      pathname === "/manager/tasks/new"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-primary hover:bg-primary/10"
                    }`}
                  >
                    <PlusCircle className="h-4 w-4" />
                    New Task
                  </Link>
                </>
              )}

              {role === "employee" && (
                <>
                  <Link
                    href="/employee"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === "/employee"
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/employee/tasks"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.startsWith("/employee/tasks")
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    My Tasks
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          {/* Quick role switcher for testing / demo */}
          {isDemoMode && (
            <div className="hidden sm:flex items-center bg-muted/60 p-1 rounded-lg text-xs gap-1 border">
              <span className="text-muted-foreground px-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Demo Switch:
              </span>
              <button
                onClick={() => {
                  loginAsDemoUser("admin");
                  router.push("/admin");
                }}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  role === "admin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => {
                  loginAsDemoUser("manager");
                  router.push("/manager");
                }}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  role === "manager"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Manager
              </button>
              <button
                onClick={() => {
                  loginAsDemoUser("employee");
                  router.push("/employee");
                }}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  role === "employee"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Employee
              </button>
            </div>
          )}

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end text-xs">
                <span className="font-semibold text-foreground">{currentUser.full_name}</span>
                <span className="text-muted-foreground">{currentUser.email}</span>
              </div>
              <Badge variant="outline" className={`capitalize font-semibold ${getRoleBadgeVariant(currentUser.role)}`}>
                {currentUser.role}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive gap-1.5"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
