import apiClient from './client'
import { handleApiError } from './error-handler'

export interface UpgradeTierRequest {
    tier: 'FREE' | 'PRO' | 'PREMIUM'
}

export const subscriptionsApi = {
    getTiers: async () => {
        try {
            const response = await apiClient.get('/api/v1/subscriptions/tiers')
            return response.data
        } catch (error: any) {
            handleApiError(error, 'load subscription tiers')
            throw error
        }
    },

    getUsage: async () => {
        try {
            const response = await apiClient.get('/api/v1/subscriptions/usage')
            return response.data
        } catch (error: any) {
            handleApiError(error, 'load storage usage')
            throw error
        }
    },

    upgradeTier: async (data: UpgradeTierRequest) => {
        try {
            const response = await apiClient.post('/api/v1/subscriptions/upgrade', data)
            return response.data
        } catch (error: any) {
            handleApiError(error, 'upgrade subscription')
            throw error
        }
    },

    getHistory: async () => {
        try {
            const response = await apiClient.get('/api/v1/subscriptions/history')
            return response.data
        } catch (error: any) {
            handleApiError(error, 'load subscription history')
            throw error
        }
    },
}
