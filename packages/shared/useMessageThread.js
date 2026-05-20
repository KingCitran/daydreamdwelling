import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

// Order-scoped message thread between two parties (typically buyer <-> seller).
//
// Args:
//   user        : current auth user
//   orderId     : the order both parties share
//   partnerId   : the other user's id (their auth.uid())
//
// Returns:
//   messages    : array of message rows, oldest -> newest
//   loading     : initial load state
//   sending     : true while a send is in flight
//   send(body)  : send a message from `user` to `partnerId`
//   refresh()   : reload from DB
//   unreadCount : count of partner-sent messages that current user hasn't read
//
// Marks partner-sent messages as read automatically on first successful fetch.
export default function useMessageThread({ user, orderId, partnerId }) {
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [sending,  setSending]  = useState(false)

  const fetch = useCallback(async () => {
    if (!user || !orderId || !partnerId) return
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('id, from_user_id, to_user_id, body, created_at, read_at')
      .eq('order_id', orderId)
      .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${partnerId}),and(from_user_id.eq.${partnerId},to_user_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
    setLoading(false)

    // Mark partner-sent unread messages as read.
    const unreadIds = (data ?? [])
      .filter(m => m.to_user_id === user.id && !m.read_at)
      .map(m => m.id)
    if (unreadIds.length) {
      const now = new Date().toISOString()
      await supabase.from('messages').update({ read_at: now }).in('id', unreadIds)
    }
  }, [user, orderId, partnerId])

  useEffect(() => { fetch() }, [fetch])

  const send = useCallback(async (body) => {
    const trimmed = (body ?? '').trim()
    if (!trimmed || !user || !orderId || !partnerId) return { error: 'invalid' }
    setSending(true)
    const { data, error } = await supabase
      .from('messages')
      .insert({ order_id: orderId, from_user_id: user.id, to_user_id: partnerId, body: trimmed })
      .select()
      .single()
    setSending(false)
    if (error) return { error: error.message }
    setMessages(prev => [...prev, data])
    return { data }
  }, [user, orderId, partnerId])

  const unreadCount = messages.filter(m => m.to_user_id === user?.id && !m.read_at).length

  return { messages, loading, sending, send, refresh: fetch, unreadCount }
}
