import { z } from "zod";

export type UserRole = "admin" | "manager" | "employee";
export type TaskStatus = "pending" | "submitted" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  manager_id: string | null;
  created_at: string;
  manager?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  creator_id: string;
  assignee_id: string;
  status: TaskStatus;
  report_content: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile | null;
  assignee?: Profile | null;
}

// ==========================================
// Zod Validation Schemas
// ==========================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createUserSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "manager", "employee"], {
    errorMap: () => ({ message: "Select a valid role" }),
  }),
  manager_id: z.string().uuid("Invalid manager ID").nullable().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["admin", "manager", "employee"]),
  manager_id: z.string().uuid().nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  assignee_id: z.string().uuid("Please select an employee"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const submitTaskReportSchema = z.object({
  task_id: z.string().uuid(),
  report_content: z.string().min(10, "Please provide a detailed report (at least 10 characters)"),
});

export type SubmitTaskReportInput = z.infer<typeof submitTaskReportSchema>;

export const reviewTaskSchema = z.object({
  task_id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  rejection_reason: z.string().optional(),
});

export type ReviewTaskInput = z.infer<typeof reviewTaskSchema>;
