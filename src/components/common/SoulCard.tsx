import { Box, Typography, Button, IconButton, CardContent, Card, Stack, Paper, TextField } from '@mui/material'
import { Delete, Edit, ToggleOff, ToggleOn } from '@mui/icons-material'
import type { User } from '../../interface/database'
import { useState } from 'react'

export const SoulCard = ({
  user,
  handleSoulsMutation
}: {
  user: User
  handleSoulsMutation: (action: 'add' | 'edit' | 'delete', data?: User) => void
}) => {
  const [userData, setUserData] = useState<User>(user)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
    handleSoulsMutation('edit', userData)
  }

  return (
    <Card
      variant='outlined'
      sx={{
        borderRadius: 3,
        mb: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <CardContent sx={{ flexGrow: 1, py: 1 }}>
          <Typography variant='subtitle1' fontWeight={600}>
            {user.username}
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {user.description}
          </Typography>
        </CardContent>

        <Stack
          direction='row'
          spacing={1}
          pr={1}
          display={user.username === 'Main Body' || user.username === 'Main Soul' ? 'none' : 'flex'}
        >
          <IconButton
            color={user.isActive ? 'success' : 'default'}
            size='small'
            onClick={() => {
              handleSoulsMutation('edit', { ...user, isActive: !user.isActive })
            }}
          >
            {user.isActive ? <ToggleOn fontSize='small' /> : <ToggleOff fontSize='small' />}
          </IconButton>

          <IconButton color='primary' size='small' onClick={() => setIsEditing(true)}>
            <Edit fontSize='small' />
          </IconButton>
          <IconButton color='error' size='small' onClick={() => handleSoulsMutation('delete', user)}>
            <Delete fontSize='small' />
          </IconButton>
        </Stack>
      </Box>
      {isEditing && (
        <Paper sx={{ p: 2 }}>
          <Box display='flex' flexDirection='column' gap={2}>
            <TextField
              size='small'
              label='Username'
              variant='outlined'
              value={userData.username}
              onChange={e => setUserData({ ...userData, username: e.target.value })}
              fullWidth
            />
            <TextField
              size='small'
              label='Description'
              variant='outlined'
              value={userData.description}
              onChange={e => setUserData({ ...userData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <Stack direction='row' spacing={1}>
              <Button variant='contained' size='small' color='primary' onClick={handleSave}>
                Save
              </Button>
              <Button variant='outlined' size='small' onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}
    </Card>
  )
}
