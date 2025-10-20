import { useLiveQuery } from 'dexie-react-hooks'
import type { Action } from '../../interface/database'
import { getAllActions } from '../../services/dexie/collections/action'
import { useState } from 'react'
import { runActionDescription } from '../../services/agents/ActionExecutionAgent/index'
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Stack,
  Divider
} from '@mui/material'

const ActionsManager = () => {
  const actions = (useLiveQuery(async () => getAllActions(), []) as Action[] | undefined) || []
  const [executingId, setExecutingId] = useState<number | null>(null)
  const [lastOutput, setLastOutput] = useState<string>('')

  const handleRun = async (action: Action) => {
    setExecutingId(action.id)
    const output = await runActionDescription(action.description)
    setLastOutput(output)
    setExecutingId(null)
  }

  return (
    <Box sx={{ p: 2 }}>
      {lastOutput && (
        <Paper variant='outlined' sx={{ mb: 2, p: 1.5 }}>
          <Typography variant='caption' color='text.secondary'>
            Tool output
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
            {lastOutput}
          </Typography>
        </Paper>
      )}

      <Paper variant='outlined'>
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant='subtitle1'>Live Actions</Typography>
        </Box>

        {actions.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ p: 2 }}>
            No active actions
          </Typography>
        ) : (
          <List dense disablePadding>
            {actions.map((action: Action) => {
              const time = new Date(action.createdAt as unknown as number).toLocaleTimeString()
              const statusLabel = executingId === action.id ? 'Running…' : action.isCompleted ? 'Done' : 'Pending'
              const statusColor: 'success' | 'warning' | 'default' =
                executingId === action.id ? 'warning' : action.isCompleted ? 'success' : 'warning'

              return (
                <ListItem
                  key={action.id}
                  disablePadding
                  secondaryAction={<Chip size='small' color={statusColor} label={statusLabel} variant='filled' />}
                >
                  <ListItemButton onClick={() => handleRun(action)} disabled={executingId === action.id}>
                    <ListItemText
                      primary={
                        <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1}>
                          <Typography variant='body1'>{action.description}</Typography>
                          <Typography variant='caption' color='text.disabled'>
                            {time}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Typography variant='caption' color='text.secondary'>
                          Priority: {action.priority}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        )}
      </Paper>
    </Box>
  )
}

export default ActionsManager
