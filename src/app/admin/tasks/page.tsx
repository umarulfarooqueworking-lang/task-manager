"use client";

import React, { useState } from "react";
import { useData } from "@/lib/data-context";
import { Task, TaskStatus } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils";
import {
  CheckSquare,
  Search,
  Filter,
  Eye,
  FileText,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function AdminTasksPage() {
  const { tasks, profiles } = useData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [managerFilter, setManagerFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const managers = profiles.filter((p) => p.role === "manager");

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      (t.assignee?.full_name && t.assignee.full_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesManager = managerFilter === "all" || t.creator_id === managerFilter;

    return matchesSearch && matchesStatus && matchesManager;
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">System-Wide Tasks</h1>
            <Badge variant="outline" className="text-xs">
              Read-Only Audit
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Global monitoring of all tasks created by managers and submitted by employees across the company.
          </p>
        </div>

        <div className="text-sm text-muted-foreground bg-muted/60 px-3.5 py-1.5 rounded-lg border">
          Total: <strong className="text-foreground">{tasks.length}</strong> tasks recorded
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, or employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 w-36 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Manager:</span>
              <Select
                value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)}
                className="h-9 w-44 text-xs"
              >
                <option value="all">All Managers</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Task</th>
                  <th className="py-3.5 px-4 font-semibold">Manager (Creator)</th>
                  <th className="py-3.5 px-4 font-semibold">Employee (Assignee)</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Created / Updated</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      No tasks found matching current filters.
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
                          {task.creator?.full_name || "Manager"}
                        </span>
                        <div className="text-[11px] text-muted-foreground">{task.creator?.email}</div>
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
                        <div>{formatDate(task.created_at)}</div>
                        <div className="text-[11px]">Updated: {formatDate(task.updated_at)}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => setSelectedTask(task)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* TASK DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title}
        description="Comprehensive task status and employee report audit."
        className="max-w-2xl"
      >
        {selectedTask && (
          <div className="space-y-5">
            {/* Status & Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-muted/40 border">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                  Status
                </span>
                <Badge variant="outline" className={`capitalize font-semibold mt-1 ${getStatusBadgeVariant(selectedTask.status)}`}>
                  {selectedTask.status}
                </Badge>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                  Manager
                </span>
                <span className="font-medium text-xs text-foreground block mt-1">
                  {selectedTask.creator?.full_name}
                </span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                  Assignee
                </span>
                <span className="font-medium text-xs text-foreground block mt-1">
                  {selectedTask.assignee?.full_name}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Task Instructions / Description
              </h4>
              <div className="p-3.5 rounded-lg border bg-background text-sm leading-relaxed whitespace-pre-wrap">
                {selectedTask.description || "No specific instructions provided."}
              </div>
            </div>

            {/* Employee Report Content (if submitted or reviewed) */}
            {selectedTask.report_content ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                    Employee Submission Report
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Submitted: {formatDate(selectedTask.submitted_at)}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedTask.report_content}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-dashed text-xs text-muted-foreground text-center">
                The assignee has not submitted a report for this task yet.
              </div>
            )}

            {/* Rejection Reason (if rejected) */}
            {selectedTask.status === "rejected" && selectedTask.rejection_reason && (
              <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-sm">
                <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  Manager Rejection Feedback
                </div>
                <p className="text-xs">{selectedTask.rejection_reason}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <Button variant="outline" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
