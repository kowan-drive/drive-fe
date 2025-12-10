'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { authApi } from '@/lib/api/auth'
import { subscriptionsApi } from '@/lib/api/subscriptions'
import { useAuthStore } from '@/store/auth'
import { formatBytes } from '@/lib/utils'
import { Crown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [usage, setUsage] = useState<any>(null)
  const [tiers, setTiers] = useState<any[]>([])
  const [isLoadingUsage, setIsLoadingUsage] = useState(true)
  const [isLoadingTiers, setIsLoadingTiers] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usageResponse, tiersResponse] = await Promise.all([
        subscriptionsApi.getUsage(),
        subscriptionsApi.getTiers(),
      ])

      if (usageResponse.success) {
        setUsage(usageResponse.data)
      }

      if (tiersResponse.success) {
        setTiers(tiersResponse.data.tiers || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoadingUsage(false)
      setIsLoadingTiers(false)
    }
  }

  const handleUpgrade = async (tier: string) => {
    if (tier === user?.tier) {
      toast.info('You are already on this tier')
      return
    }

    try {
      const response = await subscriptionsApi.upgradeTier({ tier: tier as any })
      if (response.success) {
        toast.success(`Successfully upgraded to ${tier}`)
        window.location.reload()
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Failed to upgrade tier')
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account and subscription</p>
        </div>

        <Separator />

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username</span>
              <span className="font-medium">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Tier</span>
              <Badge>{user?.tier}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
            <CardDescription>How much storage you're using</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsage ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : usage ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">{formatBytes(usage.usedBytes || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{formatBytes(usage.quotaBytes || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium">
                    {formatBytes((usage.quotaBytes || 0) - (usage.usedBytes || 0))}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Failed to load usage data</p>
            )}
          </CardContent>
        </Card>

        {/* Subscription Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Tiers</CardTitle>
            <CardDescription>Choose the plan that fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTiers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {tiers.map((tier) => (
                  <Card
                    key={tier.name}
                    className={user?.tier === tier.name ? 'border-primary' : ''}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {tier.name}
                        {tier.name !== 'FREE' && <Crown className="h-4 w-4 text-yellow-500" />}
                      </CardTitle>
                      <CardDescription>{formatBytes(tier.quotaBytes)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        variant={user?.tier === tier.name ? 'secondary' : 'default'}
                        onClick={() => handleUpgrade(tier.name)}
                        disabled={user?.tier === tier.name}
                      >
                        {user?.tier === tier.name ? 'Current Plan' : 'Upgrade'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
