import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LogoutButton } from './logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-md border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            You are logged in as a demo user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{user.email}</p>
          </div>
          <div className="space-y-2 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">User ID</p>
            <p className="font-mono text-sm text-foreground">{user.id}</p>
          </div>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  )
}
