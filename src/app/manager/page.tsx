"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Task } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils";
import {
  Users,
  CheckSquare,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  Check,
} from "lucide-react";

export default function ManagerDashboardPage() {
  const { currentUser, profiles, tasks, reviewTask } = useData();

  // Review modal state
  const [reviewingTask, setReviewingTask] = useState<Task | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Filter tasks created by this manager
  const myTasks = tasks.filter((t) => t.creator_id === currentUser?.id);
  // Filter employees assigned to this manager
  const myEmployees = profiles.filter(
    (p) => p.role === "employee" && p.manager_id === currentUser?.id
  );

  const pendingReviewTasks = myTasks.filter((t) => t.status === "submitted");
  const approvedCount = myTasks.filter((t) => t.status === "approved").length;
  const rejectedCount = myTasks.filter((t) => t.status === "rejected").length;
  const pendingCount = myTasks.filter((t) => t.status === "pending").length;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApprove = async (taskId: string) => {
    setIsSubmitting(true);
    await reviewTask(taskId, "approved");
    setIsSubmitting(false);
    setReviewingTask(null);
    showNotification("Task approved successfully!");
  };

  const handleReject = async (taskId: string) => {
    setIsSubmitting(true);
    await reviewTask(taskId, "rejected", rejectionReason);
    setIsSubmitting(false);
    setReviewingTask(null);
    setRejectionReason("");
    showNotification("Task rejected with feedback.");
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast */}
      {notification && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              Team Lead
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Welcome back, <strong>{currentUser?.full_name}</strong>. Track your team&apos;s assignments and review deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/manager/tasks/new">
            <Button className="gap-2 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              Assign New Task
            </Button>
          </Link>
          <Link href="/manager/employees">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              My Employees ({myEmployees.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Awaiting Review (Urgent) */}
        <Card className={`border-2 transition-shadow ${pendingReviewTasks.length > 0 ? "border-blue-400 bg-blue-50/20" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Your Review
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-600">
              {pendingReviewTasks.length}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {pendingReviewTasks.length > 0
                ? "Submissions awaiting approval/rejection"
                : "All submitted reports reviewed"}
            </p>
          </CardContent>
        </Card>

        {/* Total Created Tasks */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Created Tasks
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{myTasks.length}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              {pendingCount} still in progress by team
            </p>
          </CardContent>
        </Card>

        {/* Approved Deliverables */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Deliverables
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600">
              {approvedCount}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        {/* Assigned Team Members */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned Employees
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-600">
              {myEmployees.length}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Direct report team members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Submissions Queue */}
      <Card className="border-blue-200 dark:border-blue-900 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Submitted Tasks Awaiting Your Review ({pendingReviewTasks.length})
            </CardTitle>
            <CardDescription>
              Review the reports submitted by your employees and approve or reject them.
            </CardDescription>
          </div>
          <Link href="/manager/tasks">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              All Tasks <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingReviewTasks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm border rounded-lg bg-muted/20">
              <CheckCircle className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-80" />
              You have no pending submissions to review!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviewTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border bg-background flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-300 transition-colors shadow-sm"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{task.title}</span>
                      <Badge variant="outline" className={`capitalize text-xs ${getStatusBadgeVariant(task.status)}`}>
                        {task.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Submitted by <strong className="text-foreground">{task.assignee?.full_name}</strong> on {formatDate(task.submitted_at)}
                    </div>
                    {task.report_content && (
                      <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/40 p-2 rounded mt-1 border">
                        &quot;{task.report_content}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <Button
                      size="sm"
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
                      onClick={() => setReviewingTask(task)}
                    >
                      Inspect & Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(reviewingTask)}
        onClose={() => setReviewingTask(null)}
        title="Review Submitted Task Report"
        description="Inspect deliverable content and provide approval or return with feedback."
        className="max-w-2xl"
      >
        {reviewingTask && (
          <div className="space-y-5">
            <div className="p-3.5 rounded-lg bg-muted/40 border space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Task Title</div>
              <div className="font-semibold text-base text-foreground">{reviewingTask.title}</div>
              <div className="text-xs text-muted-foreground">
                Assignee: <strong>{reviewingTask.assignee?.full_name}</strong> ({reviewingTask.assignee?.email})
              </div>
            </div>

            {reviewingTask.description && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Original Instructions
                </div>
                <div className="p-3 rounded-lg border bg-background text-xs leading-relaxed text-muted-foreground">
                  {reviewingTask.description}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Employee Report Submission
                </span>
                <span className="text-xs text-muted-foreground">
                  Submitted {formatDate(reviewingTask.submitted_at)}
                </span>
              </div>
              <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 text-sm leading-relaxed whitespace-pre-wrap">
                {reviewingTask.report_content || "No report content entered."}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Optional Rejection Reason (Required only if rejecting)</span>
              </label>
              <Textarea
                placeholder="Explain what needs to be improved or revised before approval..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                onClick={() => setReviewingTask(null)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(reviewingTask.id)}
                isLoading={isSubmitting}
                className="w-full sm:w-auto gap-1"
              >
                <XCircle className="h-4 w-4" />
                Reject Task
              </Button>
              <Button
                variant="success"
                onClick={() => handleApprove(reviewingTask.id)}
                isLoading={isSubmitting}
                className="w-full sm:w-auto gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Approve Task
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
