'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { authApi } from '@/lib/api/auth'
import { subscriptionsApi } from '@/lib/api/subscriptions'
import { useAuthStore } from '@/store/auth'
import { formatBytes } from '@/lib/utils'
import { Crown, Loader2, Check, HardDrive } from 'lucide-react'
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
        setTiers(tiersResponse.data || [])
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
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>How much storage you're using</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsage ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : usage ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{formatBytes(usage.storageUsed || 0)} used</span>
                    <span className="text-muted-foreground">{formatBytes(usage.quota || 0)} total</span>
                  </div>
                  <Progress value={usage.usagePercentage || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatBytes(usage.remaining || 0)} available • {usage.usagePercentage || 0}% used
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{formatBytes(usage.storageUsed || 0)}</p>
                    <p className="text-xs text-muted-foreground">Used</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatBytes(usage.quota || 0)}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatBytes(usage.remaining || 0)}</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
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
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Choose the plan that fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTiers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {tiers.map((tier) => {
                  const isCurrentTier = user?.tier === tier.name
                  const isPremium = tier.name !== 'FREE'
                  
                  return (
                    <Card
                      key={tier.name}
                      className={isCurrentTier ? 'border-primary shadow-md' : 'border-muted'}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {tier.name}
                            {isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                          </CardTitle>
                          {isCurrentTier && (
                            <Badge variant="default">Current</Badge>
                          )}
                        </div>
                        <CardDescription>
                          <span className="text-2xl font-bold text-foreground">
                            {tier.price === 0 ? 'Free' : `$${tier.price}`}
                          </span>
                          {tier.price !== 0 && <span className="text-muted-foreground">/month</span>}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">{tier.quotaFormatted} Storage</p>
                          {tier.features && (
                            <ul className="space-y-2">
                              {tier.features.map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <Button
                          className="w-full"
                          variant={isCurrentTier ? 'secondary' : 'default'}
                          onClick={() => handleUpgrade(tier.name)}
                          disabled={isCurrentTier}
                        >
                          {isCurrentTier ? 'Current Plan' : 'Upgrade Now'}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
