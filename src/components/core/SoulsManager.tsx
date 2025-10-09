import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { getAllUsers, createUser, searchUsersByVector } from '../../services/dexie/collections/user'
import type { User } from '../../interface/database'

export default function SoulsManager() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<User>>({})
  const [searchResults, setSearchResults] = useState<User[]>([])

  useEffect(() => {
    getAllUsers().then(setUsers)
  }, [open])

  const handleSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedUserId(event.target.value as number)
  }

  const handleAddSoul = () => {
    setForm({})
    setOpen(true)
  }

  const handleEditSoul = () => {
    const user = users.find(u => u.id === selectedUserId)
    if (user) {
      setForm(user)
      setOpen(true)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!form.username) return
    const now = new Date()
    await createUser({
      id: form.id ?? Date.now(),
      username: form.username,
      description: form.description ?? '',
      avatarUrl: form.avatarUrl ?? '',
      createdAt: form.createdAt ?? now,
      modifiedAt: now,
      isActive: true,
      isEditable: true,
      vector: []
    })
    setOpen(false)
    getAllUsers().then(setUsers)
  }

  const handleSearch = async (query: string) => {
    const results = await searchUsersByVector(query)
    setSearchResults(results)
  }

  return (
    <Box>
      <Typography variant='subtitle1' gutterBottom>
        Select Soul
      </Typography>
      <Select fullWidth value={selectedUserId} onChange={() => handleSelect} displayEmpty>
        <MenuItem value=''>Choose a Soul</MenuItem>
        {users.map(user => (
          <MenuItem key={user.id} value={user.id}>
            {user.username}
          </MenuItem>
        ))}
      </Select>
      <Box mt={2} display='flex' gap={2}>
        <Button variant='outlined' onClick={handleAddSoul}>
          + Add Soul
        </Button>
        <Button variant='contained' disabled={!selectedUserId} onClick={handleEditSoul}>
          Edit Soul
        </Button>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{form.id ? 'Edit Soul' : 'Add Soul'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            name='username'
            label='Soul Name'
            type='text'
            fullWidth
            value={form.username ?? ''}
            onChange={handleChange}
          />
          <TextField
            margin='dense'
            name='description'
            label='Description'
            type='text'
            fullWidth
            value={form.description ?? ''}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Box mt={2}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder='Search souls by vector similarity...'
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch(form.username ?? '')
            }
          }}
          value={form.username ?? ''}
          onChange={handleChange}
          name='username'
        />
        <Button variant='contained' color='primary' onClick={() => handleSearch(form.username ?? '')}>
          Search
        </Button>
      </Box>
      <Box mt={2}>
        <Typography variant='h6'>Search Results</Typography>
        {searchResults.length === 0 ? (
          <Typography>No results found.</Typography>
        ) : (
          searchResults.map(user => (
            <Box key={user.id} mb={1} p={1} border='1px solid #ccc' borderRadius='4px'>
              <Typography variant='subtitle1'>{user.username}</Typography>
              <Typography variant='body2'>{user.description}</Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}
