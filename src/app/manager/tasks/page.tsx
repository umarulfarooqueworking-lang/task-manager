"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useData } from "@/lib/data-context";
import { Task, TaskStatus } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  Check,
  Eye,
} from "lucide-react";

function ManagerTasksContent() {
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created");

  const { currentUser, tasks, reviewTask } = useData();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(
    justCreated ? "Task created successfully!" : null
  );

  // Filter tasks created by current manager
  const myTasks = tasks.filter((t) => t.creator_id === currentUser?.id);

  const filteredTasks = myTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.assignee?.full_name && t.assignee.full_name.toLowerCase().includes(search.toLowerCase()));
    const matchesTab = activeTab === "all" || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenReview = (task: Task) => {
    setSelectedTask(task);
    setRejectionReason(task.rejection_reason || "");
    setIsReviewOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    await reviewTask(selectedTask.id, "approved");
    setIsSubmitting(false);
    setIsReviewOpen(false);
    showNotification(`Task "${selectedTask.title}" approved!`);
  };

  const handleReject = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    await reviewTask(selectedTask.id, "rejected", rejectionReason);
    setIsSubmitting(false);
    setIsReviewOpen(false);
    showNotification(`Task "${selectedTask.title}" rejected with feedback.`);
  };

  const pendingReviewCount = myTasks.filter((t) => t.status === "submitted").length;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
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
          <h1 className="text-3xl font-bold tracking-tight">Team Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Tasks assigned to your direct reports. Inspect deliverables and submit reviews.
          </p>
        </div>

        <Link href="/manager/tasks/new">
          <Button className="gap-2 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            Assign New Task
          </Button>
        </Link>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap gap-1 p-1 bg-muted/60 rounded-lg border w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "all"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({myTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("submitted")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "submitted"
                ? "bg-blue-600 text-white font-semibold"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            Needs Review
            {pendingReviewCount > 0 && (
              <span className="h-4 px-1.5 rounded-full text-[10px] bg-white text-blue-700 font-bold">
                {pendingReviewCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "pending"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "approved"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "rejected"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Rejected
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Task Cards / Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Task Title</th>
                  <th className="py-3.5 px-4 font-semibold">Assignee</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Submission Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No tasks found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-semibold text-foreground truncate">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {task.assignee?.full_name || "Employee"}
                        </span>
                        <div className="text-[11px] text-muted-foreground">{task.assignee?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`capitalize font-semibold ${getStatusBadgeVariant(task.status)}`}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {task.submitted_at ? formatDate(task.submitted_at) : "Not submitted"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {task.status === "submitted" ? (
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleOpenReview(task)}
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                            Review Deliverable
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => handleOpenReview(task)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Details
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={selectedTask?.title}
        description={`Assignee: ${selectedTask?.assignee?.full_name || "Employee"}`}
        className="max-w-2xl"
      >
        {selectedTask && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                  Current Status
                </span>
                <Badge variant="outline" className={`capitalize font-semibold mt-1 ${getStatusBadgeVariant(selectedTask.status)}`}>
                  {selectedTask.status}
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                  Assigned Date
                </span>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {formatDate(selectedTask.created_at)}
                </span>
              </div>
            </div>

            {selectedTask.description && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Original Task Instructions
                </h4>
                <div className="p-3 rounded-lg border bg-background text-xs leading-relaxed text-muted-foreground">
                  {selectedTask.description}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  Employee Report Submission
                </h4>
                {selectedTask.submitted_at && (
                  <span className="text-xs text-muted-foreground">
                    Submitted: {formatDate(selectedTask.submitted_at)}
                  </span>
                )}
              </div>
              {selectedTask.report_content ? (
                <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedTask.report_content}
                </div>
              ) : (
                <div className="p-3.5 rounded-lg border border-dashed text-xs text-muted-foreground text-center">
                  No submission report entered yet. Status is pending.
                </div>
              )}
            </div>

            {selectedTask.status === "rejected" && selectedTask.rejection_reason && (
              <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-sm">
                <div className="font-semibold text-xs mb-1 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  Rejection Reason Given:
                </div>
                <p className="text-xs">{selectedTask.rejection_reason}</p>
              </div>
            )}

            {/* If task is submitted or rejected, manager can review/approve/reject */}
            {(selectedTask.status === "submitted" || selectedTask.status === "pending") && (
              <div className="space-y-2 pt-2 border-t">
                <label className="text-xs font-semibold text-foreground">
                  Rejection Reason (Required only if returning task to employee)
                </label>
                <Textarea
                  placeholder="Provide constructive feedback for what needs correction..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                onClick={() => setIsReviewOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Close
              </Button>

              {selectedTask.status === "submitted" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject with Feedback
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleApprove}
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Task
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ManagerTasksPage() {
  return (
    <Suspense fallback={<div className="container p-8 text-center">Loading tasks...</div>}>
      <ManagerTasksContent />
    </Suspense>
  );
}
