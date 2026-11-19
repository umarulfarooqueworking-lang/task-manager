"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils";
import {
  Users,
  CheckSquare,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  UserPlus,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser, profiles, tasks } = useData();

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push(`/${currentUser.role}`);
    }
  }, [currentUser, router]);

  const totalUsers = profiles.length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const submittedTasks = tasks.filter((t) => t.status === "submitted").length;
  const approvedTasks = tasks.filter((t) => t.status === "approved").length;
  const rejectedTasks = tasks.filter((t) => t.status === "rejected").length;

  const adminCount = profiles.filter((p) => p.role === "admin").length;
  const managerCount = profiles.filter((p) => p.role === "manager").length;
  const employeeCount = profiles.filter((p) => p.role === "employee").length;

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              System Admin
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Global system overview, user management, and organization-wide task status metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/tasks">
            <Button variant="outline" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              View All Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{totalUsers}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="font-semibold text-purple-600">{managerCount}</span> Mgrs ·{" "}
              <span className="font-semibold text-blue-600">{employeeCount}</span> Emps ·{" "}
              <span className="font-semibold text-slate-600">{adminCount}</span> Admins
            </div>
          </CardContent>
        </Card>

        {/* Total Tasks */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{totalTasks}</div>
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              Across all departments
            </p>
          </CardContent>
        </Card>

        {/* Pending & Submitted */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress / Submitted
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-600">
              {pendingTasks + submittedTasks}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>{pendingTasks} Pending</span> ·{" "}
              <span className="font-medium text-blue-600">{submittedTasks} Awaiting Review</span>
            </div>
          </CardContent>
        </Card>

        {/* Approved vs Rejected */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reviewed Tasks
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600">
              {approvedTasks}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="text-emerald-600 font-medium">{approvedTasks} Approved</span> ·{" "}
              <span className="text-rose-600 font-medium">{rejectedTasks} Rejected</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Breakdown Visual Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Task Status Breakdown</CardTitle>
          <CardDescription>Visual distribution of tasks by current operational state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {totalTasks > 0 ? (
              <>
                <div
                  style={{ width: `${(approvedTasks / totalTasks) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Approved: ${approvedTasks}`}
                />
                <div
                  style={{ width: `${(submittedTasks / totalTasks) * 100}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`Submitted: ${submittedTasks}`}
                />
                <div
                  style={{ width: `${(pendingTasks / totalTasks) * 100}%` }}
                  className="bg-amber-400 h-full transition-all"
                  title={`Pending: ${pendingTasks}`}
                />
                <div
                  style={{ width: `${(rejectedTasks / totalTasks) * 100}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`Rejected: ${rejectedTasks}`}
                />
              </>
            ) : (
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-full" />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Approved:</span>
              <span className="font-semibold">{approvedTasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Submitted:</span>
              <span className="font-semibold">{submittedTasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="text-muted-foreground">Pending:</span>
              <span className="font-semibold">{pendingTasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="text-muted-foreground">Rejected:</span>
              <span className="font-semibold">{rejectedTasks}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks List Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Tasks Across System</CardTitle>
            <CardDescription>Latest tasks created and updated by managers</CardDescription>
          </div>
          <Link href="/admin/tasks">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                <tr>
                  <th className="py-3 px-4 font-semibold">Title</th>
                  <th className="py-3 px-4 font-semibold">Creator (Manager)</th>
                  <th className="py-3 px-4 font-semibold">Assignee (Employee)</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {task.creator?.full_name || "Manager"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {task.assignee?.full_name || "Employee"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`capitalize ${getStatusBadgeVariant(task.status)}`}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(task.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
