"use client";

import React, { useState } from "react";
import { useData } from "@/lib/data-context";
import { Profile, UserRole, createUserSchema, updateUserSchema } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate, getRoleBadgeVariant } from "@/lib/utils";
import {
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  UserCheck,
  Briefcase,
  Shield,
  Check,
} from "lucide-react";

export default function AdminUsersPage() {
  const { profiles, createUser, updateUser, deleteUser, currentUser } = useData();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "employee" as UserRole,
    manager_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Managers list for assignment dropdown
  const managers = profiles.filter((p) => p.role === "manager");

  // Filtered users
  const filteredUsers = profiles.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setFormData({
      full_name: "",
      email: "",
      password: "",
      role: "employee",
      manager_id: managers[0]?.id || "",
    });
    setErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user: Profile) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: "",
      role: user.role,
      manager_id: user.manager_id || "",
    });
    setErrors({});
    setIsEditOpen(true);
  };

  const handleOpenDelete = (user: Profile) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createUserSchema.safeParse({
      ...formData,
      manager_id: formData.role === "employee" && formData.manager_id ? formData.manager_id : null,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const res = await createUser({
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      manager_id: formData.role === "employee" ? formData.manager_id || null : null,
    });
    setIsSubmitting(false);

    if (res.error) {
      setErrors({ form: res.error });
    } else {
      setIsCreateOpen(false);
      showNotification(`User "${formData.full_name}" created successfully`);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrors({});

    const result = updateUserSchema.safeParse({
      id: selectedUser.id,
      full_name: formData.full_name,
      role: formData.role,
      manager_id: formData.role === "employee" && formData.manager_id ? formData.manager_id : null,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const res = await updateUser({
      id: selectedUser.id,
      full_name: formData.full_name,
      role: formData.role,
      manager_id: formData.role === "employee" ? formData.manager_id || null : null,
    });
    setIsSubmitting(false);

    if (res.error) {
      setErrors({ form: res.error });
    } else {
      setIsEditOpen(false);
      showNotification(`User "${formData.full_name}" updated successfully`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    const res = await deleteUser(selectedUser.id);
    setIsSubmitting(false);

    if (res.error) {
      setErrors({ delete: res.error });
    } else {
      setIsDeleteOpen(false);
      showNotification(`User "${selectedUser.full_name}" was deleted`);
      setSelectedUser(null);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, update, assign managers, and manage user roles across your organization.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shadow-sm">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Filter by Role:</span>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 w-36 text-xs"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="manager">Managers</option>
              <option value="employee">Employees</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Manager</th>
                  <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const managerProfile = user.manager_id
                      ? profiles.find((p) => p.id === user.manager_id)
                      : null;

                    return (
                      <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground">{user.full_name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className={`capitalize ${getRoleBadgeVariant(user.role)}`}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          {user.role === "employee" ? (
                            managerProfile ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                                <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                                {managerProfile.full_name}
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600 font-medium">
                                Unassigned
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(user)}
                            title="Edit User"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleOpenDelete(user)}
                            disabled={currentUser?.id === user.id}
                            title={currentUser?.id === user.id ? "Cannot delete yourself" : "Delete User"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New User"
        description="Create an account and assign their role and management hierarchy."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {errors.form && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive text-xs">
              {errors.form}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <Input
              placeholder="e.g. Alice Smith"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              error={errors.full_name}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <Input
              type="email"
              placeholder="alice@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Initial Password</label>
            <Input
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Role</label>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          {formData.role === "employee" && (
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                Assign to Manager
              </label>
              <Select
                value={formData.manager_id}
                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              >
                <option value="">-- No Manager Assigned --</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </option>
                ))}
              </Select>
              <p className="text-[11px] text-muted-foreground">
                The assigned manager can create and assign tasks to this employee.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit User & Manager Assignment"
        description="Update user details, role, or reassign employee to another manager."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {errors.form && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-destructive text-xs">
              {errors.form}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Email</label>
            <Input value={formData.email} disabled className="bg-muted/50 cursor-not-allowed" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              error={errors.full_name}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Role</label>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          {formData.role === "employee" && (
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                Assign to Manager (manager_id)
              </label>
              <Select
                value={formData.manager_id}
                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              >
                <option value="">-- No Manager Assigned --</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm User Deletion"
        description="Are you sure you want to permanently delete this user?"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-4 flex gap-3 text-rose-800 dark:text-rose-300 text-sm">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">
                Deleting <strong>{selectedUser?.full_name}</strong> ({selectedUser?.email})
              </p>
              <p className="text-xs mt-1 text-rose-700 dark:text-rose-400">
                This will delete their profile and remove them from Supabase Authentication. All associated tasks will be cascaded.
              </p>
            </div>
          </div>

          {errors.delete && (
            <p className="text-xs text-destructive">{errors.delete}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              isLoading={isSubmitting}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
