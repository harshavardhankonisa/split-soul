import { useState } from 'react'
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
  ListItemText
} from '@mui/material'
import { db } from '../../services/dexie/client'

export default function ChatManager() {
  const chats = useLiveQuery(async () => db.chats.orderBy('createdAt').reverse().limit(50).toArray(), []) || []

  const [input, setInput] = useState('')

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg) return
    setInput('')
    await new Promise<void>(resolve =>
      chrome.runtime.sendMessage({ type: 'MAIN_BODY_CHAT', message: msg }, () => resolve())
    )
  }

  return (
    <Box>
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
      <Paper variant='outlined' sx={{ my: 2 }}>
        {chats.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ p: 2 }}>
            No chats yet
          </Typography>
        ) : (
          <List dense>
            {chats.map(c => {
              const initials = c.username?.[0]?.toUpperCase() || '?'
              const time = c.createdAt ? new Date(c.createdAt).toTimeString() : ''
              return (
                <ListItem key={c.id} alignItems='flex-start'>
                  <ListItemAvatar>
                    <Avatar>{initials}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant='subtitle1'>{c.username}</Typography>
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
    </Box>
  )
}
