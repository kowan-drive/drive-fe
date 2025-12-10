import apiClient from './client'

export interface UpgradeTierRequest {
    tier: 'FREE' | 'PRO' | 'PREMIUM'
}

export const subscriptionsApi = {
    getTiers: async () => {
        const response = await apiClient.get('/api/v1/subscriptions/tiers')
        return response.data
    },

    getUsage: async () => {
        const response = await apiClient.get('/api/v1/subscriptions/usage')
        return response.data
    },

    upgradeTier: async (data: UpgradeTierRequest) => {
        const response = await apiClient.post('/api/v1/subscriptions/upgrade', data)
        return response.data
    },

    getHistory: async () => {
        const response = await apiClient.get('/api/v1/subscriptions/history')
        return response.data
    },
}
