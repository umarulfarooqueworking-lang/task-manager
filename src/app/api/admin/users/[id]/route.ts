import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateUserSchema } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json();
    const parsed = updateUserSchema.safeParse({ ...json, id: params.id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { full_name, role, manager_id } = parsed.data;

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured" },
        { status: 500 }
      );
    }

    // Update profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        full_name,
        role,
        manager_id: manager_id || null,
      })
      .eq("id", params.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // Update user_metadata in auth
    await adminClient.auth.admin.updateUserById(params.id, {
      user_metadata: {
        full_name,
        role,
        manager_id: manager_id || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured" },
        { status: 500 }
      );
    }

    // Delete user from auth (cascades to profile and tasks based on schema)
    const { error: authError } = await adminClient.auth.admin.deleteUser(params.id);
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
