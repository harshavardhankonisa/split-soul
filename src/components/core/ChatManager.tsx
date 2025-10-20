import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Stack
} from '@mui/material'
import { db } from '../../services/dexie/client'
import type { Chat, User } from '../../interface/database'
import { createChat } from '../../services/dexie/collections/chat'

export default function ChatManager() {
  const chats =
    (useLiveQuery(async () => db.chats.orderBy('createdAt').reverse().limit(50).toArray(), []) as Chat[] | undefined) ||
    []
  const users = useLiveQuery(async () => db.users.toArray(), []) as User[] | undefined

  const userMap = useMemo(() => {
    const map = new Map<string, User>()
    for (const u of users ?? []) map.set(u.username, u)
    return map
  }, [users])

  const [input, setInput] = useState('')

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg) return
    setInput('')
    await createChat({ username: 'Main Body', message: msg })
  }

  return (
    <Box>
      <Paper variant='outlined' sx={{ height: 260, overflowY: 'auto', mb: 2, p: 1 }}>
        {chats.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ p: 2 }}>
            No chats yet
          </Typography>
        ) : (
          <List dense>
            {chats.map(c => {
              const user = userMap.get(c.username)
              const avatarSrc = user?.avatarUrl || undefined
              const initials = c.username?.[0]?.toUpperCase() || '?'
              const time = c.createdAt ? new Date(c.createdAt as unknown as number).toLocaleTimeString() : ''
              return (
                <ListItem key={c.id} alignItems='flex-start'>
                  <ListItemAvatar>
                    <Avatar src={avatarSrc}>{!avatarSrc && initials}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Typography variant='subtitle2'>{c.username}</Typography>
                          {user?.description && (
                            <Typography variant='caption' color='text.secondary'>
                              {user.description}
                            </Typography>
                          )}
                        </Stack>
                        {time && (
                          <Typography variant='caption' color='text.disabled'>
                            {time}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={<Typography variant='body2'>{c.message}</Typography>}
                  />
                </ListItem>
              )
            })}
          </List>
        )}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size='small'
          placeholder='Type a message as Main Body...'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend()
          }}
          fullWidth
        />
        <Button variant='contained' onClick={handleSend} disabled={!input.trim()}>
          Send
        </Button>
      </Box>
    </Box>
  )
}
