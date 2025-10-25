import { Box, Typography, Button, Paper, Stack, Alert } from '@mui/material'
import { useState } from 'react'
import { db } from '../../services/dexie/client'

export default function SettingsManager() {
  const [notice, setNotice] = useState<string | null>(null)

  const clearChats = async () => {
    await db.chats.clear()
    setNotice('Cleared chats')
    setTimeout(() => setNotice(null), 2000)
  }

  const clearActions = async () => {
    await db.actions.clear()
    setNotice('Cleared actions')
    setTimeout(() => setNotice(null), 2000)
  }

  const clearActivities = async () => {
    await db.activities.clear()
    setNotice('Cleared activities')
    setTimeout(() => setNotice(null), 2000)
  }

  const resetDb = async () => {
    await db.delete()
    setNotice('Database reset')
    setTimeout(() => {
      setNotice(null)
      location.reload()
    }, 800)
  }

  return (
    <Box>
      {notice && (
        <Alert severity='info' sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}
      <Paper variant='outlined' sx={{ p: 2 }}>
        <Typography variant='body1' gutterBottom>
          Data Management
        </Typography>
        <Stack direction='column' spacing={1} flexWrap='wrap'>
          <Button variant='outlined' color='warning' onClick={clearChats}>
            Clear Chats
          </Button>
          <Button variant='outlined' color='warning' onClick={clearActions}>
            Clear Actions
          </Button>
          <Button variant='outlined' color='warning' onClick={clearActivities}>
            Clear Activities
          </Button>
          <Button variant='contained' color='error' onClick={resetDb}>
            Reset Database
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
