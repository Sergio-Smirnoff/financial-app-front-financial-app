export type NotificationType = 
  | 'PAYMENT_DUE' 
  | 'LOAN_REMINDER' 
  | 'INSTALLMENT_REMINDER' 
  | 'INVESTMENT_THRESHOLD' 
  | 'USER_REGISTERED' 
  | 'MONTHLY_SUMMARY'

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'BOTH'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  channel: NotificationChannel
  read: boolean
  metadata: string | null
  createdAt: string
}

export interface NotificationPreference {
  userId: number
  email: string
  monthlyEmailEnabled: boolean
}

export interface UnreadCount {
  count: number
}

export interface CreateNotificationRequest {
  userId: number
  type: NotificationType
  title: string
  message: string
  channel: NotificationChannel
  metadata?: string
}
