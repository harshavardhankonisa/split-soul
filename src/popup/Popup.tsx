import { Container } from '@mui/material'
import PopupSettings from '../components/core/PopupSettings'
import PopupArena from '../components/core/PopupArena'
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
      description:
        'Welcome to Split Soul! Your digital companions are ready to assist you in the background while you continue working as usual.',
      component: <Home />,
      icon: <HomeIcon />
    },
    {
      label: 'Action Manager',
      description: 'Manage your actions.',
      component: <ActionsManager />,
      icon: <CallToActionIcon />
    },
    {
      label: 'Chat Manager',
      description: 'Talk with your split souls as Main Body.',
      component: <ChatManager />,
      icon: <ChatIcon />
    },
    {
      label: 'Manage Souls',
      description: 'Enable, disable, or create, edit and delete new souls.',
      component: <SoulsManager />,
      icon: <PeopleIcon />
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
      <PopupSettings tabs={tabs} setCurrentView={setCurrentView} />
      <PopupArena tabs={tabs} currentView={currentView} setCurrentView={setCurrentView} />
    </Container>
  )
}
