import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material'
import { useState, useEffect } from 'react'

export default function SettingsManager() {
  const [settings, setSettings] = useState({
    apiKey: '',
    enableNotifications: true,
    enableActivityTracking: true,
    activityCheckInterval: 120
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load settings from chrome storage
    chrome.storage?.local?.get(['settings'], result => {
      if (result.settings) {
        setSettings(result.settings)
      }
    })
  }, [])

  const handleSave = () => {
    chrome.storage?.local?.set({ settings }, () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const handleChange = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Box>
      <Typography variant='subtitle1' gutterBottom fontWeight={600}>
        Extension Settings
      </Typography>

      {saved && (
        <Alert severity='success' sx={{ mb: 2 }} onClose={() => setSaved(false)}>
          Settings saved successfully!
        </Alert>
      )}

      <Paper variant='outlined' sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant='subtitle2' gutterBottom>
              API Configuration
            </Typography>
            <TextField
              fullWidth
              size='small'
              label='API Key (Optional)'
              type='password'
              placeholder='Enter your API key...'
              value={settings.apiKey}
              onChange={e => handleChange('apiKey', e.target.value)}
              sx={{ mb: 1 }}
            />
            <Typography variant='caption' color='text.secondary'>
              Used for advanced features and integrations
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant='subtitle2' gutterBottom>
              Tracking & Notifications
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableActivityTracking}
                    onChange={e => handleChange('enableActivityTracking', e.target.checked)}
                  />
                }
                label='Enable Activity Tracking'
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableNotifications}
                    onChange={e => handleChange('enableNotifications', e.target.checked)}
                  />
                }
                label='Enable Notifications'
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant='subtitle2' gutterBottom>
              Activity Check Interval (seconds)
            </Typography>
            <TextField
              fullWidth
              size='small'
              type='number'
              value={settings.activityCheckInterval}
              onChange={e => handleChange('activityCheckInterval', parseInt(e.target.value))}
              inputProps={{ min: 30, max: 600 }}
            />
            <Typography variant='caption' color='text.secondary'>
              How often to check for user activity (30-600 seconds)
            </Typography>
          </Box>

          <Button variant='contained' onClick={handleSave} fullWidth>
            Save Settings
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
