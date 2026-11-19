import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createUserSchema } from "@/types";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createUserSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, full_name, role, manager_id } = parsed.data;

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured" },
        { status: 500 }
      );
    }

    // Verify current user is admin
    const cookieStore = cookies();
    const supabaseUserClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user: caller },
    } = await supabaseUserClient.auth.getUser();

    if (caller) {
      const { data: profile } = await supabaseUserClient
        .from("profiles")
        .select("role")
        .eq("id", caller.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // 1. Create user in Supabase Auth
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        manager_id: manager_id || null,
      },
    });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create auth user" },
        { status: 400 }
      );
    }

    // 2. Ensure profile is updated/inserted
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        id: authUser.user.id,
        email,
        full_name,
        role,
        manager_id: manager_id || null,
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: authUser.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
