import { useLiveQuery } from 'dexie-react-hooks'
import type { Action } from '../../interface/database'
import { updateAction, deleteAction } from '../../services/dexie/collections/action'
import { db } from '../../services/dexie/client'
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
  Divider,
  IconButton,
  Button,
  CircularProgress,
  Collapse,
  Tooltip,
  TextField
} from '@mui/material'
import {
  PlayArrow as PlayArrowIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete
} from '@mui/icons-material'

interface ActionOutput {
  [key: number]: string
}

interface ExecutingState {
  [key: number]: boolean
}

const ActionsManager = () => {
  const actions =
    (useLiveQuery(async () => db.actions.orderBy('createdAt').reverse().limit(50).toArray(), []) as
      | Action[]
      | undefined) || []
  const [executingState, setExecutingState] = useState<ExecutingState>({})
  const [actionOutputs, setActionOutputs] = useState<ActionOutput>({})
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set())
  const [directInput, setDirectInput] = useState('')
  const [directOutput, setDirectOutput] = useState<{ executing: boolean; output: string }>({
    executing: false,
    output: ''
  })

  const handleRun = async (action: Action) => {
    setExecutingState(prev => ({ ...prev, [action.id]: true }))

    try {
      const output = await runActionDescription(action.description)
      setActionOutputs(prev => ({ ...prev, [action.id]: output }))

      await updateAction(action.id, { isCompleted: true })
    } catch (error) {
      setActionOutputs(prev => ({
        ...prev,
        [action.id]: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }))
    } finally {
      setExecutingState(prev => ({ ...prev, [action.id]: false }))
    }
  }

  const toggleExpand = (actionId: number) => {
    setExpandedActions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(actionId)) {
        newSet.delete(actionId)
      } else {
        newSet.add(actionId)
      }
      return newSet
    })
  }

  const handleDelete = async (action: Action) => {
    if (window.confirm(`Delete action "${action.description}"?`)) {
      await deleteAction(action.id)
    }
  }

  const isExecuting = (actionId: number) => executingState[actionId] || false
  const hasOutput = (actionId: number) => actionOutputs[actionId] !== undefined
  const isExpanded = (actionId: number) => expandedActions.has(actionId)

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
        <TextField
          size='small'
          placeholder='Run action directly...'
          value={directInput}
          onChange={e => setDirectInput(e.target.value)}
          onKeyDown={async (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && directInput.trim()) {
              setDirectOutput({ executing: true, output: '' })
              try {
                const output = await runActionDescription(directInput)
                setDirectOutput({ executing: false, output })
              } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error'
                setDirectOutput({ executing: false, output: `Error: ${msg}` })
              }
              setDirectInput('')
            }
          }}
          fullWidth
        />
        <Button
          variant='contained'
          startIcon={directOutput.executing ? <CircularProgress size={16} /> : <PlayArrowIcon />}
          onClick={async () => {
            if (!directInput.trim()) return
            setDirectOutput({ executing: true, output: '' })
            try {
              const output = await runActionDescription(directInput)
              setDirectOutput({ executing: false, output })
            } catch (error) {
              const msg = error instanceof Error ? error.message : 'Unknown error'
              setDirectOutput({ executing: false, output: `Error: ${msg}` })
            }
            setDirectInput('')
          }}
          disabled={!directInput.trim() || directOutput.executing}
        >
          Run
        </Button>
      </Box>
      {directOutput.output && (
        <Paper variant='outlined' sx={{ my: 1, p: 1.5, bgcolor: 'background.default' }}>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
            Output:
          </Typography>
          <Box
            sx={{
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 150,
              overflow: 'auto'
            }}
          >
            {directOutput.output}
          </Box>
        </Paper>
      )}
      <Divider sx={{ my: 2 }} />
      <Typography variant='h6' sx={{ my: 2 }}>
        Generated Actions
      </Typography>
      {actions.length === 0 ? (
        <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant='body1' color='text.secondary'>
            No generated actions yet
          </Typography>
        </Paper>
      ) : (
        <List disablePadding>
          {actions.map((action: Action) => {
            const time = new Date(action.createdAt).toLocaleTimeString()
            const executing = isExecuting(action.id)
            const output = actionOutputs[action.id]
            const expanded = isExpanded(action.id)

            const statusLabel = executing ? 'Running…' : action.isCompleted ? 'Done' : 'Pending'
            const statusColor: 'success' | 'warning' | 'default' = executing
              ? 'warning'
              : action.isCompleted
                ? 'success'
                : 'default'

            return (
              <Paper key={action.id} variant='outlined' sx={{ mb: 2 }}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => toggleExpand(action.id)} disabled={executing} sx={{ flex: 1 }}>
                    <ListItemText
                      primary={
                        <>
                          <Typography
                            variant='body1'
                            sx={{
                              flex: 1,
                              textDecoration: action.isCompleted ? 'line-through' : 'none',
                              color: action.isCompleted ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {action.description}
                          </Typography>
                          <Typography variant='caption' color='text.disabled'>
                            {time}
                          </Typography>
                        </>
                      }
                      secondary={
                        <Stack direction='row' spacing={2} alignItems='center' sx={{ mt: 0.5 }}>
                          <Chip
                            size='small'
                            color={statusColor}
                            label={statusLabel}
                            variant={action.isCompleted ? 'filled' : 'outlined'}
                          />
                          <Typography variant='caption' color='text.secondary'>
                            Priority: {action.priority}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>

                <Box sx={{ px: 2, py: 1 }}>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    {hasOutput(action.id) && (
                      <IconButton size='small' onClick={() => toggleExpand(action.id)}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )}
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={executing ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                      onClick={() => handleRun(action)}
                      disabled={executing || action.isCompleted}
                    >
                      {executing ? 'Running' : 'Run'}
                    </Button>
                    <Tooltip title='Delete action'>
                      <IconButton size='small' color='error' onClick={() => handleDelete(action)} disabled={executing}>
                        <Delete fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                <Collapse in={expanded && hasOutput(action.id)} timeout='auto' unmountOnExit>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 1 }}>
                      <Typography variant='caption' color='text.secondary' fontWeight='medium'>
                        Execution Output
                      </Typography>
                      <Chip
                        size='small'
                        label={action.isCompleted ? 'Completed' : 'Executed'}
                        color={action.isCompleted ? 'success' : 'info'}
                        variant='outlined'
                      />
                    </Stack>
                    <Paper
                      variant='outlined'
                      sx={{
                        p: 1.5,
                        bgcolor: 'background.default',
                        maxHeight: 200,
                        overflow: 'auto'
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem'
                        }}
                      >
                        {output}
                      </Typography>
                    </Paper>
                  </Box>
                </Collapse>
              </Paper>
            )
          })}
        </List>
      )}
    </Box>
  )
}

export default ActionsManager
