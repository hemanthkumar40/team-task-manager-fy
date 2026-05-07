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
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Users, UserCheck, Loader2 } from 'lucide-react'

interface DemoAccount {
  name: string
  email: string
  role: 'Team Lead' | 'Team Member'
}

const teamLeadAccounts: DemoAccount[] = [
  { name: 'Alex Thompson', email: 'teamlead1@demo.local', role: 'Team Lead' },
  { name: 'Sarah Chen', email: 'teamlead2@demo.local', role: 'Team Lead' },
]

const teamMemberAccounts: DemoAccount[] = [
  { name: 'Mike Johnson', email: 'member1@demo.local', role: 'Team Member' },
  { name: 'Emily Davis', email: 'member2@demo.local', role: 'Team Member' },
]

const DEMO_PASSWORD = 'demo123456'

export default function DemoLoginPage() {
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDemoLogin = async (email: string) => {
    const supabase = createClient()
    setLoadingEmail(email)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: DEMO_PASSWORD,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoadingEmail(null)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Card className="border-border">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Demo / Test Accounts
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Click any button below to instantly login with a demo account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Team Lead Accounts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5" />
                <h3 className="font-semibold">Team Lead Accounts:</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {teamLeadAccounts.map((account) => (
                  <AccountCard
                    key={account.email}
                    account={account}
                    isLoading={loadingEmail === account.email}
                    onLogin={() => handleDemoLogin(account.email)}
                  />
                ))}
              </div>
            </div>

            {/* Team Member Accounts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground">
                <UserCheck className="h-5 w-5" />
                <h3 className="font-semibold">Team Member Accounts:</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {teamMemberAccounts.map((account) => (
                  <AccountCard
                    key={account.email}
                    account={account}
                    isLoading={loadingEmail === account.email}
                    onLogin={() => handleDemoLogin(account.email)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AccountCard({
  account,
  isLoading,
  onLogin,
}: {
  account: DemoAccount
  isLoading: boolean
  onLogin: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="space-y-1">
        <p className="font-medium text-card-foreground">
          {account.name}{' '}
          <span className="text-muted-foreground">({account.role})</span>
        </p>
        <p className="text-sm text-muted-foreground">{account.email}</p>
      </div>
      <Button
        onClick={onLogin}
        disabled={isLoading}
        className="w-full"
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </Button>
    </div>
  )
}
