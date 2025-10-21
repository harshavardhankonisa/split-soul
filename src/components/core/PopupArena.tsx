import Box from '@mui/material/Box'
import MobileStepper from '@mui/material/MobileStepper'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import { Divider } from '@mui/material'
import type { Tab } from '../../interface/ui'

export default function PopupArena({
  tabs,
  currentView,
  setCurrentView
}: {
  tabs: Tab[]
  currentView: number
  setCurrentView: React.Dispatch<React.SetStateAction<number>>
}) {
  const tabsLength = tabs.length

  const handleNext = () => {
    setCurrentView(preView => (preView + 1) % tabsLength)
  }

  const handleBack = () => {
    setCurrentView(preView => (preView - 1 + tabsLength) % tabsLength)
  }

  return (
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
      <Divider sx={{ width: '100%' }} />
      <MobileStepper
        variant='dots'
        steps={tabsLength}
        position='static'
        activeStep={currentView}
        nextButton={
          <Button size='small' onClick={handleNext}>
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size='small' onClick={handleBack}>
            <KeyboardArrowLeft />
          </Button>
        }
        sx={{
          width: '100%'
        }}
      />
    </Box>
  )
}
