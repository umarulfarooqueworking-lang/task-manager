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
  CheckSquare,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  Send,
  Check,
} from "lucide-react";

export default function EmployeeDashboardPage() {
  const { currentUser, tasks, submitTaskReport } = useData();

  // Submission modal state
  const [submittingTask, setSubmittingTask] = useState<Task | null>(null);
  const [reportContent, setReportContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Tasks assigned to this employee
  const myTasks = tasks.filter((t) => t.assignee_id === currentUser?.id);

  const pendingCount = myTasks.filter((t) => t.status === "pending").length;
  const submittedCount = myTasks.filter((t) => t.status === "submitted").length;
  const approvedCount = myTasks.filter((t) => t.status === "approved").length;
  const rejectedCount = myTasks.filter((t) => t.status === "rejected").length;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenSubmit = (task: Task) => {
    setSubmittingTask(task);
    setReportContent(task.report_content || "");
    setError(null);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingTask) return;

    if (!reportContent.trim() || reportContent.trim().length < 10) {
      setError("Please provide a meaningful report (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);
    const res = await submitTaskReport(submittingTask.id, reportContent.trim());
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSubmittingTask(null);
      showNotification(`Task "${submittingTask.title}" submitted for manager review!`);
    }
  };

  // Urgent tasks: rejected or pending
  const actionableTasks = myTasks.filter(
    (t) => t.status === "pending" || t.status === "rejected"
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast Notification */}
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
            <h1 className="text-3xl font-bold tracking-tight">Employee Dashboard</h1>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
              Team Member
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Welcome back, <strong>{currentUser?.full_name}</strong>. Complete assignments and submit work reports to your manager.
          </p>
        </div>

        <Link href="/employee/tasks">
          <Button className="gap-2 shadow-sm">
            <CheckSquare className="h-4 w-4" />
            View All My Tasks ({myTasks.length})
          </Button>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending To Do */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              To Do (Pending)
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-600">{pendingCount}</div>
            <p className="mt-2 text-xs text-muted-foreground">Requires report submission</p>
          </CardContent>
        </Card>

        {/* Submitted / Under Review */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting Review
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Send className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-600">{submittedCount}</div>
            <p className="mt-2 text-xs text-muted-foreground">Submitted to your manager</p>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved (Done)
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600">{approvedCount}</div>
            <p className="mt-2 text-xs text-muted-foreground">Successfully approved</p>
          </CardContent>
        </Card>

        {/* Rejected (Needs Attention) */}
        <Card className={`border-2 transition-shadow ${rejectedCount > 0 ? "border-rose-400 bg-rose-50/20" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Revision
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-rose-600">{rejectedCount}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              {rejectedCount > 0 ? "Returned by manager with feedback" : "No rejected tasks"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Tasks (Pending & Needs Revision) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Actionable Tasks ({actionableTasks.length})
            </CardTitle>
            <CardDescription>
              Tasks that are waiting for your work report or need revisions based on manager feedback.
            </CardDescription>
          </div>
          <Link href="/employee/tasks">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              All Tasks <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {actionableTasks.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm border rounded-lg bg-muted/20">
              <CheckCircle className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-80" />
              You have no pending or rejected tasks! Great job.
            </div>
          ) : (
            <div className="space-y-4">
              {actionableTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                    task.status === "rejected"
                      ? "border-rose-300 bg-rose-50/20 dark:bg-rose-950/10"
                      : "bg-background"
                  }`}
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{task.title}</span>
                      <Badge variant="outline" className={`capitalize text-xs ${getStatusBadgeVariant(task.status)}`}>
                        {task.status === "rejected" ? "Needs Revision" : task.status}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {task.status === "rejected" && task.rejection_reason && (
                      <div className="rounded bg-rose-100 dark:bg-rose-950/60 p-2 text-xs text-rose-800 dark:text-rose-300 border border-rose-200">
                        <strong>Feedback from Manager:</strong> {task.rejection_reason}
                      </div>
                    )}

                    <div className="text-[11px] text-muted-foreground">
                      Assigned by {task.creator?.full_name} on {formatDate(task.created_at)}
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    <Button
                      onClick={() => handleOpenSubmit(task)}
                      size="sm"
                      className={`w-full md:w-auto gap-1.5 ${
                        task.status === "rejected"
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : ""
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {task.status === "rejected" ? "Update & Resubmit" : "Submit Report"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Submission Modal */}
      <Modal
        isOpen={Boolean(submittingTask)}
        onClose={() => setSubmittingTask(null)}
        title={submittingTask?.title}
        description="Enter your deliverable report and submit for manager review."
        className="max-w-2xl"
      >
        {submittingTask && (
          <form onSubmit={handleSubmitReport} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}

            {submittingTask.status === "rejected" && submittingTask.rejection_reason && (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-sm">
                <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  Manager Rejection Feedback
                </div>
                <p className="text-xs">{submittingTask.rejection_reason}</p>
              </div>
            )}

            {submittingTask.description && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Task Instructions
                </h4>
                <div className="p-3 rounded-lg border bg-muted/30 text-xs leading-relaxed text-muted-foreground">
                  {submittingTask.description}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Your Deliverable Report Content <span className="text-destructive">*</span></span>
                <span className="text-muted-foreground text-[11px]">Min. 10 characters</span>
              </label>
              <Textarea
                placeholder="Detail what was accomplished, technical findings, links to documentation or test results..."
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                rows={6}
                disabled={isSubmitting}
                className="font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmittingTask(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="gap-2">
                <Send className="h-4 w-4" />
                Submit to Manager
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
