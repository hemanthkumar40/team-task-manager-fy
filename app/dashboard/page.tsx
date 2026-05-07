import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, User } from 'lucide-react'
import { LogoutButton } from './logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Get user profile from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isTeamLead = profile?.role === 'team_lead'

  return (
    <div className="min-h-svh bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back!</p>
          </div>
          <LogoutButton />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                {isTeamLead ? (
                  <Shield className="h-6 w-6 text-primary" />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle>{profile?.full_name || 'User'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <Badge variant={isTeamLead ? 'default' : 'secondary'}>
                {isTeamLead ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Team Lead
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 mr-1" />
                    Team Member
                  </>
                )}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><span className="font-medium">User ID:</span> {user.id}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Created:</span> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
            <CardDescription>
              {isTeamLead
                ? 'As a Team Lead, you have full access to manage the system.'
                : 'As a Team Member, you can view and update your assigned tasks.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {isTeamLead ? (
                <>
                  <li>Create and manage projects</li>
                  <li>Assign tasks to team members</li>
                  <li>Review and approve completed tasks</li>
                  <li>View all team activity</li>
                  <li>Send notifications to team members</li>
                </>
              ) : (
                <>
                  <li>View assigned tasks</li>
                  <li>Update task status and progress</li>
                  <li>Add progress notes</li>
                  <li>Submit tasks for review</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
