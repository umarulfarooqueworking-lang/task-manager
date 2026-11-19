import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnv() {
  const env = {};
  for (const file of [".env.local", ".env"]) {
    const fullPath = path.resolve(file);
    if (fs.existsSync(fullPath)) {
      const lines = fs.readFileSync(fullPath, "utf-8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [k, ...v] = trimmed.split("=");
        if (k && v.length > 0) {
          env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }
  return env;
}

async function testAll() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("=== SUPABASE STATUS CHECK ===");
  console.log("Project URL:", url);

  const supabase = createClient(url, anonKey);
  const adminClient = serviceKey ? createClient(url, serviceKey) : null;

  // Check profiles table
  const { count: profCount, error: profErr } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  console.log("Profiles Table:", profErr ? `Error: ${profErr.message}` : `Connected & Accessible (Rows: ${profCount ?? 0})`);

  // Check tasks table
  const { count: taskCount, error: taskErr } = await supabase.from("tasks").select("*", { count: "exact", head: true });
  console.log("Tasks Table:", taskErr ? `Error: ${taskErr.message}` : `Connected & Accessible (Rows: ${taskCount ?? 0})`);

  // Check Auth service
  if (adminClient) {
    const { data: users, error: authErr } = await adminClient.auth.admin.listUsers();
    console.log("Auth Service (Admin API):", authErr ? `Error: ${authErr.message}` : `Connected & Authorized (Users: ${users.users.length})`);
    if (users && users.users.length > 0) {
      console.log("Existing Users:", users.users.map(u => ({ email: u.email, id: u.id })));
    }
  }
}

testAll();
