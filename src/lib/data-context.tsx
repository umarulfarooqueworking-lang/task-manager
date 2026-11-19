"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Profile, Task, UserRole, TaskStatus } from "@/types";
import { initialProfiles, initialTasks } from "./mock-data";
import { createClient } from "./supabase/client";

interface DataContextType {
  currentUser: Profile | null;
  profiles: Profile[];
  tasks: Task[];
  isDemoMode: boolean;
  isSupabaseConfigured: boolean;
  loginAsDemoUser: (role: UserRole) => void;
  logout: () => Promise<void>;
  setCurrentUser: (user: Profile | null) => void;
  // Admin actions
  createUser: (userData: {
    full_name: string;
    email: string;
    role: UserRole;
    manager_id?: string | null;
    password?: string;
  }) => Promise<{ error?: string }>;
  updateUser: (userData: {
    id: string;
    full_name: string;
    role: UserRole;
    manager_id?: string | null;
  }) => Promise<{ error?: string }>;
  deleteUser: (id: string) => Promise<{ error?: string }>;
  // Manager actions
  createTask: (taskData: {
    title: string;
    description?: string;
    assignee_id: string;
  }) => Promise<{ error?: string }>;
  reviewTask: (
    taskId: string,
    status: "approved" | "rejected",
    rejectionReason?: string
  ) => Promise<{ error?: string }>;
  // Employee actions
  submitTaskReport: (taskId: string, reportContent: string) => Promise<{ error?: string }>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(false);

  const supabase = createClient();

  useEffect(() => {
    // Check if real Supabase keys are configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = Boolean(
      url &&
      !url.includes("placeholder") &&
      !url.includes("your-project-id")
    );
    setIsSupabaseConfigured(isConfigured);

    // Load from local storage for demo mode persistence
    const savedProfiles = localStorage.getItem("taskflow_profiles");
    const savedTasks = localStorage.getItem("taskflow_tasks");
    const savedUser = localStorage.getItem("taskflow_current_user");

    if (savedProfiles) {
      try {
        setProfiles(JSON.parse(savedProfiles));
      } catch {}
    }
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch {}
    }
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {}
    }

    if (isConfigured) {
      checkSupabaseSession();
    }
  }, []);

  const checkSupabaseSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*, manager:manager_id(id, full_name, email)")
          .eq("id", session.user.id)
          .single();
        if (profile) {
          setCurrentUser(profile as Profile);
          setIsDemoMode(false);
          await fetchSupabaseData();
        }
      }
    } catch (e) {
      console.warn("Supabase auth check fallback to demo:", e);
    }
  };

  const fetchSupabaseData = async () => {
    try {
      const { data: profData } = await supabase
        .from("profiles")
        .select("*, manager:manager_id(id, full_name, email)");
      if (profData) setProfiles(profData as Profile[]);

      const { data: taskData } = await supabase
        .from("tasks")
        .select("*, creator:creator_id(*), assignee:assignee_id(*)")
        .order("created_at", { ascending: false });
      if (taskData) setTasks(taskData as Task[]);
    } catch (e) {
      console.error("Error fetching Supabase data:", e);
    }
  };

  const saveDemoProfiles = (updated: Profile[]) => {
    setProfiles(updated);
    localStorage.setItem("taskflow_profiles", JSON.stringify(updated));
  };

  const saveDemoTasks = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem("taskflow_tasks", JSON.stringify(updated));
  };

  const loginAsDemoUser = (role: UserRole) => {
    const user = profiles.find((p) => p.role === role) || initialProfiles.find((p) => p.role === role);
    if (user) {
      setCurrentUser(user);
      setIsDemoMode(true);
      localStorage.setItem("taskflow_current_user", JSON.stringify(user));
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && !isDemoMode) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem("taskflow_current_user");
  };

  const createUser = async (userData: {
    full_name: string;
    email: string;
    role: UserRole;
    manager_id?: string | null;
    password?: string;
  }) => {
    if (isSupabaseConfigured && !isDemoMode) {
      try {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        const result = await res.json();
        if (!res.ok) return { error: result.error || "Failed to create user" };
        await fetchSupabaseData();
        return {};
      } catch (err: any) {
        return { error: err.message };
      }
    }

    // Demo Mode user creation
    const existing = profiles.find((p) => p.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) return { error: "A user with this email already exists" };

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      manager_id: userData.manager_id || null,
      created_at: new Date().toISOString(),
      manager: userData.manager_id
        ? profiles.find((p) => p.id === userData.manager_id)
        : null,
    };

    const updated = [newProfile, ...profiles];
    saveDemoProfiles(updated);
    return {};
  };

  const updateUser = async (userData: {
    id: string;
    full_name: string;
    role: UserRole;
    manager_id?: string | null;
  }) => {
    if (isSupabaseConfigured && !isDemoMode) {
      try {
        const res = await fetch(`/api/admin/users/${userData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        const result = await res.json();
        if (!res.ok) return { error: result.error || "Failed to update user" };
        await fetchSupabaseData();
        return {};
      } catch (err: any) {
        return { error: err.message };
      }
    }

    const updated = profiles.map((p) => {
      if (p.id === userData.id) {
        return {
          ...p,
          full_name: userData.full_name,
          role: userData.role,
          manager_id: userData.manager_id || null,
          manager: userData.manager_id
            ? profiles.find((m) => m.id === userData.manager_id)
            : null,
        };
      }
      return p;
    });

    saveDemoProfiles(updated);
    if (currentUser?.id === userData.id) {
      const refreshed = updated.find((p) => p.id === userData.id) || null;
      setCurrentUser(refreshed);
      localStorage.setItem("taskflow_current_user", JSON.stringify(refreshed));
    }
    return {};
  };

  const deleteUser = async (id: string) => {
    if (isSupabaseConfigured && !isDemoMode) {
      try {
        const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
        const result = await res.json();
        if (!res.ok) return { error: result.error || "Failed to delete user" };
        await fetchSupabaseData();
        return {};
      } catch (err: any) {
        return { error: err.message };
      }
    }

    const updatedProfiles = profiles.filter((p) => p.id !== id);
    const updatedTasks = tasks.filter((t) => t.creator_id !== id && t.assignee_id !== id);
    saveDemoProfiles(updatedProfiles);
    saveDemoTasks(updatedTasks);
    return {};
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    assignee_id: string;
  }) => {
    if (!currentUser) return { error: "Not authenticated" };

    if (isSupabaseConfigured && !isDemoMode) {
      try {
        const { error } = await supabase.from("tasks").insert({
          title: taskData.title,
          description: taskData.description || null,
          creator_id: currentUser.id,
          assignee_id: taskData.assignee_id,
          status: "pending",
        });
        if (error) return { error: error.message };
        await fetchSupabaseData();
        return {};
      } catch (err: any) {
        return { error: err.message };
      }
    }

    const assignee = profiles.find((p) => p.id === taskData.assignee_id) || null;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title,
      description: taskData.description || null,
      creator_id: currentUser.id,
      assignee_id: taskData.assignee_id,
      status: "pending",
      report_content: null,
      rejection_reason: null,
      submitted_at: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: currentUser,
      assignee: assignee,
    };

    const updated = [newTask, ...tasks];
    saveDemoTasks(updated);
    return {};
  };

  const reviewTask = async (
    taskId: string,
    status: "approved" | "rejected",
    rejectionReason?: string
  ) => {
    if (isSupabaseConfigured && !isDemoMode) {
      try {
        const { error } = await supabase
          .from("tasks")
          .update({
            status,
            rejection_reason: status === "rejected" ? rejectionReason || null : null,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", taskId);
        if (error) return { error: error.message };
        await fetchSupabaseData();
        return {};
      } catch (err: any) {
        return { error: err.message };
      }
    }

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status,
          rejection_reason: status === "rejected" ? rejectionReason || null : null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return t;
    });

    saveDemoTasks(updated);
    return {};
  };

  const submitTaskReport = async (taskId: string, reportContent: string) => {
    if (isSupabaseConfigured && !isDemoMode) {
      try {
        const { error } = await supabase
          .from("tasks")
          .update({
            status: "submitted",
            report_content: reportContent,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", taskId);
        if (error) return { error: error.message };
        await fetchSupabaseData();
        return {};
      } catch (err: any) {
        return { error: err.message };
      }
    }

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: "submitted" as TaskStatus,
          report_content: reportContent,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      return t;
    });

    saveDemoTasks(updated);
    return {};
  };

  const refreshData = async () => {
    if (isSupabaseConfigured && !isDemoMode) {
      await fetchSupabaseData();
    }
  };

  return (
    <DataContext.Provider
      value={{
        currentUser,
        profiles,
        tasks,
        isDemoMode,
        isSupabaseConfigured,
        loginAsDemoUser,
        logout,
        setCurrentUser,
        createUser,
        updateUser,
        deleteUser,
        createTask,
        reviewTask,
        submitTaskReport,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
