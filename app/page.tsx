'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Users, UserCheck, Loader2, Shield, User } from 'lucide-react'

interface DemoAccount {
  name: string
  email: string
  role: 'team_lead' | 'team_member'
  roleLabel: string
}

const teamLeadAccounts: DemoAccount[] = [
  { name: 'Alex Thompson', email: 'teamlead1@demo.local', role: 'team_lead', roleLabel: 'Team Lead' },
  { name: 'Sarah Chen', email: 'teamlead2@demo.local', role: 'team_lead', roleLabel: 'Team Lead' },
]

const teamMemberAccounts: DemoAccount[] = [
  { name: 'Mike Johnson', email: 'member1@demo.local', role: 'team_member', roleLabel: 'Team Member' },
  { name: 'Emily Davis', email: 'member2@demo.local', role: 'team_member', roleLabel: 'Team Member' },
]

const DEMO_PASSWORD = 'demo123456'

export default function DemoLoginPage() {
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const seedDemoUsers = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/seed-demo-users', { method: 'POST' })
      const data = await res.json()
      return data.success
    } catch {
      return false
    } finally {
      setSeeding(false)
    }
  }

  const handleDemoLogin = async (email: string) => {
    setLoadingEmail(email)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: DEMO_PASSWORD,
      })

      if (signInError) {
        // If login fails, seed demo users and retry
        const seeded = await seedDemoUsers()
        if (seeded) {
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password: DEMO_PASSWORD,
          })
          if (retryError) {
            setError(retryError.message)
            return
          }
        } else {
          setError('Failed to set up demo accounts. Please try again.')
          return
        }
      }

      router.push('/dashboard')
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoadingEmail(null)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Demo / Test Accounts</h1>
          <p className="text-muted-foreground">
            Click any button below to instantly login with a demo account.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {seeding && (
          <div className="rounded-md bg-primary/10 border border-primary/20 p-4 text-center text-sm text-primary flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Setting up demo accounts...
          </div>
        )}

        {/* Team Lead Accounts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Team Lead Accounts</CardTitle>
            </div>
            <CardDescription>
              Full access to manage projects, tasks, and team members
            </CardDescription>
            <Badge variant="secondary" className="w-fit">
              <Users className="h-3 w-3 mr-1" />
              Admin Privileges
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamLeadAccounts.map((account) => (
              <AccountCard
                key={account.email}
                account={account}
                isLoading={loadingEmail === account.email}
                disabled={loadingEmail !== null}
                onLogin={() => handleDemoLogin(account.email)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Team Member Accounts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Team Member Accounts</CardTitle>
            </div>
            <CardDescription>
              View assigned tasks and update progress
            </CardDescription>
            <Badge variant="outline" className="w-fit">
              <UserCheck className="h-3 w-3 mr-1" />
              Member Access
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamMemberAccounts.map((account) => (
              <AccountCard
                key={account.email}
                account={account}
                isLoading={loadingEmail === account.email}
                disabled={loadingEmail !== null}
                onLogin={() => handleDemoLogin(account.email)}
              />
            ))}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          These are demo accounts for testing purposes only.
        </p>
      </div>
    </div>
  )
}

function AccountCard({
  account,
  isLoading,
  disabled,
  onLogin,
}: {
  account: DemoAccount
  isLoading: boolean
  disabled: boolean
  onLogin: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {account.role === 'team_lead' ? (
            <Shield className="h-5 w-5 text-primary" />
          ) : (
            <User className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{account.name}</p>
          <p className="text-sm text-muted-foreground">{account.email}</p>
        </div>
      </div>
      <Button
        onClick={onLogin}
        disabled={disabled}
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </Button>
    </div>
  )
}
