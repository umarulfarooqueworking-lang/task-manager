"use client";

import React from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Users, PlusCircle, CheckSquare, Clock, CheckCircle2, UserCheck, Mail } from "lucide-react";

export default function ManagerEmployeesPage() {
  const { currentUser, profiles, tasks } = useData();

  // Employees assigned to this manager
  const assignedEmployees = profiles.filter(
    (p) => p.role === "employee" && p.manager_id === currentUser?.id
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Employees assigned under your management. Create tasks directly for any team member.
          </p>
        </div>

        <Link href="/manager/tasks/new">
          <Button className="gap-2 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            Assign New Task
          </Button>
        </Link>
      </div>

      {assignedEmployees.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <CardTitle className="text-lg">No Employees Assigned Yet</CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2">
            You do not have any employees assigned to you in the system hierarchy. An administrator can assign employees to you via the Admin User Management panel.
          </CardDescription>
          <div className="mt-6">
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                Go to Admin Users (If Admin)
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedEmployees.map((employee) => {
            const empTasks = tasks.filter((t) => t.assignee_id === employee.id);
            const pendingCount = empTasks.filter((t) => t.status === "pending").length;
            const submittedCount = empTasks.filter((t) => t.status === "submitted").length;
            const approvedCount = empTasks.filter((t) => t.status === "approved").length;

            return (
              <Card key={employee.id} className="hover:shadow-md transition-all border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg">
                      {employee.full_name.charAt(0)}
                    </div>
                    <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">
                      Active
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{employee.full_name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Mail className="h-3.5 w-3.5" />
                    {employee.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 py-3 border-y text-center">
                    <div>
                      <div className="text-lg font-bold text-amber-600">{pendingCount}</div>
                      <div className="text-[11px] text-muted-foreground">Pending</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{submittedCount}</div>
                      <div className="text-[11px] text-muted-foreground">Submitted</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-emerald-600">{approvedCount}</div>
                      <div className="text-[11px] text-muted-foreground">Approved</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Joined {formatDate(employee.created_at)}
                    </span>
                    <Link href={`/manager/tasks/new?assignee=${employee.id}`}>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        <PlusCircle className="h-3.5 w-3.5" />
                        Assign Task
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
