import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Paper, Stack, TextField } from '@mui/material'
import { getAllUsers, createUser, updateUser } from '../../services/dexie/collections/user'
import type { User } from '../../interface/database'
import { SoulCard } from '../common/SoulCard'

const addUserInitialState = {
  username: '',
  description: '',
  avatarUrl: ''
} as User

export default function SoulsManager() {
  const [users, setUsers] = useState<User[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalState, setAddModalState] = useState<User>(addUserInitialState)

  const handleSoulsMutation = useCallback(async (action: 'add' | 'edit', data?: User) => {
    if (action === 'add') {
      if (data)
        await createUser({
          username: data.username,
          description: data.description ?? '',
          avatarUrl: data.avatarUrl ?? '',
          isActive: true,
          vector: []
        })
      setShowAddModal(false)
      setAddModalState(addUserInitialState)
    }
    if (action === 'edit') {
      if (data) {
        await updateUser(data.id, {
          username: data.username,
          description: data.description ?? '',
          avatarUrl: data.avatarUrl ?? '',
          isActive: data.isActive ?? true,
          vector: data.vector ?? []
        })
      }
    }

    const updatedUsers = await getAllUsers()
    setUsers(updatedUsers)
  }, [])

  useEffect(() => {
    getAllUsers().then(setUsers)
  }, [])

  return (
    <Box>
      <Button variant='outlined' onClick={() => setShowAddModal(true)}>
        + Add Soul
      </Button>
      {showAddModal && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Box display='flex' flexDirection='column' gap={2}>
            <TextField
              size='small'
              label='Username'
              variant='outlined'
              value={addModalState.username}
              onChange={e => setAddModalState({ ...addModalState, username: e.target.value })}
              fullWidth
            />
            <TextField
              size='small'
              label='Description'
              variant='outlined'
              value={addModalState.description}
              onChange={e => setAddModalState({ ...addModalState, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <Stack direction='row' spacing={1}>
              <Button
                variant='contained'
                size='small'
                color='primary'
                onClick={() => handleSoulsMutation('add', addModalState)}
              >
                Add
              </Button>
              <Button variant='outlined' size='small' onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}
      <Box mt={2}>
        {users.map(user => (
          <SoulCard user={user} handleSoulsMutation={handleSoulsMutation} />
        ))}
      </Box>
    </Box>
  )
}
