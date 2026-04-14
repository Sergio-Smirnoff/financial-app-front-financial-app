'use client'

import { useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUnreadCount, useLatestNotifications } from '@/lib/hooks/useNotifications'
import { NotificationDropdown } from './NotificationDropdown'
import { NotificationDialog } from './NotificationDialog'

export function NotificationBell() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { data: unreadData } = useUnreadCount()
  const unreadCount = unreadData?.count ?? 0

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setDropdownOpen(true)}
        onMouseLeave={() => setDropdownOpen(false)}
      >
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
          onClick={() => {
            setDropdownOpen(false)
            setDialogOpen(true)
          }}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
        {dropdownOpen && (
          <NotificationDropdown
            onOpenDialog={() => {
              setDropdownOpen(false)
              setDialogOpen(true)
            }}
            onClose={() => setDropdownOpen(false)}
          />
        )}
      </div>
      <NotificationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
