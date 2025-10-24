import { Box, Container, Divider, Paper, Typography } from '@mui/material'
import React from 'react'
import Home from '../components/core/Home'
import ActionsManager from '../components/core/ActionsManager'
import ChatManager from '../components/core/ChatManager'
import SoulsManager from '../components/core/SoulsManager'
import SettingsManager from '../components/core/SettingsManager'
import type { Tab } from '../interface/ui'
import HomeIcon from '@mui/icons-material/Home'
import CallToActionIcon from '@mui/icons-material/CallToAction'
import ChatIcon from '@mui/icons-material/Chat'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'

export default function Popup() {
  const tabs: Tab[] = [
    {
      label: 'Home',
      description: 'Welcome to Split Soul! Set up souls to get started.',
      component: <Home />,
      icon: <HomeIcon />
    },
    {
      label: 'Manage Souls',
      description: 'Enable, disable, or create, edit and delete new souls. Soul Names should be unique.',
      component: <SoulsManager />,
      icon: <PeopleIcon />
    },
    {
      label: 'Chat Manager',
      description: 'Talk with your split souls as Main Body.',
      component: <ChatManager />,
      icon: <ChatIcon />
    },
    {
      label: 'Action Manager',
      description: 'Manage your actions.',
      component: <ActionsManager />,
      icon: <CallToActionIcon />
    },
    {
      label: 'Settings',
      description: 'Configure extension preferences.',
      component: <SettingsManager />,
      icon: <SettingsIcon />
    }
  ]
  const [currentView, setCurrentView] = React.useState<number>(0)

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '400px',
        height: '600px',
        backgroundColor: 'background.paper',
        color: 'text.primary',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'end',
          alignItems: 'center',
          padding: 1.5,
          width: '100%',
          gap: 1
        }}
      >
        {tabs.map((tab, index) => (
          <Box
            sx={{
              height: 24,
              width: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentView === index ? 'primary.main' : 'text.secondary'
            }}
            onClick={() => setCurrentView(index)}
            key={index}
          >
            {tab.icon}
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <Box sx={{ width: '100%', height: '100%', overflowY: 'scroll', scrollbarWidth: 'none' }}>
          <Paper sx={{ px: 2, py: 1 }}>
            <Typography variant='h6'>{tabs[currentView].label}</Typography>
            <Typography variant='subtitle2'>{tabs[currentView].description}</Typography>
          </Paper>
          {tabs[currentView].component && <Box sx={{ px: 1, py: 2 }}>{tabs[currentView].component}</Box>}
        </Box>
        <Divider sx={{ width: '100%', mb: 2 }} />
      </Box>
    </Container>
  )
}
