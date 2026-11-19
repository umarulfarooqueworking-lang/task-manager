"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { createTaskSchema } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ArrowLeft, CheckSquare, PlusCircle, AlertCircle } from "lucide-react";

function CreateTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedAssignee = searchParams.get("assignee");

  const { currentUser, profiles, createTask } = useData();

  // Employees assigned to this manager
  const myEmployees = profiles.filter(
    (p) => p.role === "employee" && p.manager_id === currentUser?.id
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(
    preselectedAssignee || (myEmployees[0]?.id ?? "")
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedAssignee) {
      setAssigneeId(preselectedAssignee);
    } else if (myEmployees.length > 0 && !assigneeId) {
      setAssigneeId(myEmployees[0].id);
    }
  }, [preselectedAssignee, myEmployees, assigneeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (myEmployees.length === 0) {
      setErrors({ form: "You have no employees assigned to you to assign tasks to." });
      return;
    }

    const validation = createTaskSchema.safeParse({
      title,
      description,
      assignee_id: assigneeId,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const res = await createTask({
      title,
      description,
      assignee_id: assigneeId,
    });
    setIsSubmitting(false);

    if (res.error) {
      setErrors({ form: res.error });
    } else {
      router.push("/manager/tasks?created=true");
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/manager/tasks">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Tasks
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            Create & Assign New Task
          </CardTitle>
          <CardDescription>
            Specify task requirements and assign it to an employee on your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.form && (
            <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {myEmployees.length === 0 ? (
            <div className="p-6 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-sm">
              <p className="font-semibold">No assigned employees found</p>
              <p className="mt-1 text-xs">
                Before creating tasks, an Administrator must assign employees to your team.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Task Title <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Implement OAuth Authentication callback handler"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={errors.title}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Assignee (Direct Report) <span className="text-destructive">*</span>
                </label>
                <Select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  error={errors.assignee_id}
                  disabled={isSubmitting}
                >
                  {myEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.email})
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only employees assigned to you are eligible for assignment.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Description & Acceptance Criteria
                </label>
                <Textarea
                  placeholder="Describe the objective, steps required, deliverables, and any deadlines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Link href="/manager/tasks">
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" isLoading={isSubmitting} className="gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Create Task
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateTaskPage() {
  return (
    <Suspense fallback={<div className="container p-8 text-center">Loading task form...</div>}>
      <CreateTaskContent />
    </Suspense>
  );
}
