import { Box, Typography, TextField, Button } from '@mui/material'

export default function SettingsManager() {
  return (
    <Box>
      <Typography variant='subtitle1' gutterBottom>
        Settings
      </Typography>
      <TextField fullWidth size='small' label='API Key' placeholder='Enter your API key...' sx={{ mb: 2 }} />
      <Button variant='contained' sx={{ mb: 2 }}>
        Save
      </Button>
    </Box>
  )
}
