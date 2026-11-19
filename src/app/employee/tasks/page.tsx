"use client";

import React, { useState } from "react";
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
  CheckSquare,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Check,
  Send,
  Eye,
} from "lucide-react";

export default function EmployeeTasksPage() {
  const { currentUser, tasks, submitTaskReport } = useData();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Filter tasks assigned to current employee
  const myTasks = tasks.filter((t) => t.assignee_id === currentUser?.id);

  const filteredTasks = myTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesTab = activeTab === "all" || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setReportContent(task.report_content || "");
    setError(null);
    setIsSubmitOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (!reportContent.trim() || reportContent.trim().length < 10) {
      setError("Please write a descriptive report of at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    const res = await submitTaskReport(selectedTask.id, reportContent.trim());
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      setIsSubmitOpen(false);
      showNotification(`Task "${selectedTask.title}" submitted successfully!`);
    }
  };

  const pendingCount = myTasks.filter((t) => t.status === "pending").length;
  const rejectedCount = myTasks.filter((t) => t.status === "rejected").length;

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
          <h1 className="text-3xl font-bold tracking-tight">My Assigned Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Complete assigned deliverables, fill in your reports, and track status through approval.
          </p>
        </div>

        <div className="text-sm text-muted-foreground bg-muted/60 px-3.5 py-1.5 rounded-lg border">
          Assigned to you: <strong className="text-foreground">{myTasks.length}</strong> tasks
        </div>
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
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-amber-500 text-white font-semibold"
                : "text-amber-600 hover:text-amber-700"
            }`}
          >
            Pending
            {pendingCount > 0 && (
              <span className="h-4 px-1.5 rounded-full text-[10px] bg-white text-amber-700 font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("submitted")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "submitted"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Submitted
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
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "rejected"
                ? "bg-rose-600 text-white font-semibold"
                : "text-rose-600 hover:text-rose-700"
            }`}
          >
            Rejected
            {rejectedCount > 0 && (
              <span className="h-4 px-1.5 rounded-full text-[10px] bg-white text-rose-700 font-bold">
                {rejectedCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Task</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned By</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Date Assigned</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No tasks found in this view.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const isEditable = task.status === "pending" || task.status === "rejected";

                    return (
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
                            {task.creator?.full_name || "Manager"}
                          </span>
                          <div className="text-[11px] text-muted-foreground">{task.creator?.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className={`capitalize font-semibold ${getStatusBadgeVariant(task.status)}`}>
                            {task.status === "rejected" ? "Needs Revision" : task.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(task.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isEditable ? (
                            <Button
                              size="sm"
                              className={`h-8 gap-1.5 text-xs ${
                                task.status === "rejected"
                                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                                  : ""
                              }`}
                              onClick={() => handleOpenTask(task)}
                            >
                              <Send className="h-3.5 w-3.5" />
                              {task.status === "rejected" ? "Revise & Resubmit" : "Submit Report"}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-xs"
                              onClick={() => handleOpenTask(task)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Submission
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Task Report Submission & Details Modal */}
      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title={selectedTask?.title}
        description={`Assigned by: ${selectedTask?.creator?.full_name || "Manager"}`}
        className="max-w-2xl"
      >
        {selectedTask && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}

            {/* Status indicator */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                  Task Status
                </span>
                <Badge variant="outline" className={`capitalize font-semibold mt-1 ${getStatusBadgeVariant(selectedTask.status)}`}>
                  {selectedTask.status}
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                  Assigned On
                </span>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {formatDate(selectedTask.created_at)}
                </span>
              </div>
            </div>

            {/* Rejection Alert */}
            {selectedTask.status === "rejected" && selectedTask.rejection_reason && (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-sm">
                <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  Manager Rejection Feedback
                </div>
                <p className="text-xs">{selectedTask.rejection_reason}</p>
              </div>
            )}

            {/* Task Description */}
            {selectedTask.description && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Manager Instructions
                </h4>
                <div className="p-3.5 rounded-lg border bg-muted/30 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {selectedTask.description}
                </div>
              </div>
            )}

            {/* Submission Form / View */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Deliverable Report</span>
                {(selectedTask.status === "pending" || selectedTask.status === "rejected") && (
                  <span className="text-[11px] text-muted-foreground">Min. 10 characters</span>
                )}
              </label>

              {selectedTask.status === "pending" || selectedTask.status === "rejected" ? (
                <Textarea
                  placeholder="Detail what was accomplished, technical steps taken, results, or pull requests..."
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  rows={6}
                  disabled={isSubmitting}
                  className="font-mono text-xs"
                />
              ) : (
                <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedTask.report_content || "No report content submitted."}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSubmitOpen(false)}
                disabled={isSubmitting}
              >
                Close
              </Button>

              {(selectedTask.status === "pending" || selectedTask.status === "rejected") && (
                <Button type="submit" isLoading={isSubmitting} className="gap-2">
                  <Send className="h-4 w-4" />
                  {selectedTask.status === "rejected" ? "Update & Resubmit" : "Submit Report"}
                </Button>
              )}
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
