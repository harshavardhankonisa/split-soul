import { useLiveQuery } from 'dexie-react-hooks'
import type { Action } from '../../interface/database'
import { getAllActions, updateAction, deleteAction } from '../../services/dexie/collections/action'
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Collapse,
  Tooltip
} from '@mui/material'
import {
  Edit as EditIcon,
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
  const actions = (useLiveQuery(async () => getAllActions(), []) as Action[] | undefined) || []
  const [executingState, setExecutingState] = useState<ExecutingState>({})
  const [actionOutputs, setActionOutputs] = useState<ActionOutput>({})
  const [editingAction, setEditingAction] = useState<Action | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set())

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

  const handleEditClick = (action: Action) => {
    setEditingAction(action)
    setEditDescription(action.description)
  }

  const handleSaveEdit = async () => {
    if (editingAction && editDescription.trim()) {
      await updateAction(editingAction.id, {
        description: editDescription.trim(),
        isCompleted: false
      })
      setEditingAction(null)
      setEditDescription('')
    }
  }

  const handleCancelEdit = () => {
    setEditingAction(null)
    setEditDescription('')
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
      {/* Edit Dialog */}
      <Dialog open={!!editingAction} onClose={handleCancelEdit} maxWidth='sm' fullWidth>
        <DialogTitle>Edit Action</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Action Description'
            fullWidth
            variant='outlined'
            multiline
            rows={3}
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant='contained' disabled={!editDescription.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions List */}
      {actions.length === 0 ? (
        <Paper variant='outlined' sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant='body1' color='text.secondary'>
            No active actions
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
                <ListItem
                  disablePadding
                  secondaryAction={
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Chip
                        size='small'
                        color={statusColor}
                        label={statusLabel}
                        variant={action.isCompleted ? 'filled' : 'outlined'}
                      />
                      {hasOutput(action.id) && (
                        <IconButton size='small' onClick={() => toggleExpand(action.id)}>
                          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      )}
                    </Stack>
                  }
                >
                  <ListItemButton onClick={() => toggleExpand(action.id)} disabled={executing} sx={{ flex: 1 }}>
                    <ListItemText
                      primary={
                        <Stack direction='row' alignItems='center' spacing={1}>
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
                        </Stack>
                      }
                      secondary={
                        <Stack direction='row' spacing={2} alignItems='center' sx={{ mt: 0.5 }}>
                          <Typography variant='caption' color='text.secondary'>
                            Priority: {action.priority}
                          </Typography>
                          {action.isCompleted && (
                            <Chip size='small' label='Completed' color='success' variant='filled' />
                          )}
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>

                {/* Action Controls */}
                <Box sx={{ px: 2, pb: 1 }}>
                  <Stack direction='row' spacing={1} justifyContent='flex-end'>
                    <Tooltip title='Edit action'>
                      <IconButton size='small' onClick={() => handleEditClick(action)} disabled={executing}>
                        <EditIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
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

                {/* Output Section */}
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
