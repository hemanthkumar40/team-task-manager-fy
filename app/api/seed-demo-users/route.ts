import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const DEMO_PASSWORD = "demo123456"

const DEMO_USERS = [
  {
    email: "teamlead1@demo.local",
    full_name: "Alex Thompson",
    role: "team_lead",
  },
  {
    email: "teamlead2@demo.local",
    full_name: "Sarah Chen",
    role: "team_lead",
  },
  {
    email: "member1@demo.local",
    full_name: "Mike Johnson",
    role: "team_member",
  },
  {
    email: "member2@demo.local",
    full_name: "Emily Davis",
    role: "team_member",
  },
]

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const results = []

    for (const user of DEMO_USERS) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const exists = existingUsers?.users?.some((u) => u.email === user.email)

      if (exists) {
        results.push({ email: user.email, status: "already exists" })
        continue
      }

      // Create the user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
      })

      if (error) {
        results.push({ email: user.email, status: "error", error: error.message })
      } else {
        results.push({ email: user.email, status: "created", id: data.user?.id })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: "Failed to seed demo users" },
      { status: 500 }
    )
  }
}
