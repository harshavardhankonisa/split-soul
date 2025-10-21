import { useEffect, useState } from 'react'
import { Box, Typography, Chip, Stack, Link, Divider, Button, CircularProgress, Alert } from '@mui/material'
import { PromptAPI } from '../../services/API/prompt'
import { SummarizerAPI } from '../../services/API/summarizer'
import { ProofreaderAPI } from '../../services/API/proofreader'
import { TranslatorAPI } from '../../services/API/translator'
import { WriterAPI } from '../../services/API/writer'
import { RewriterAPI } from '../../services/API/rewriter'

const DOC = 'https://developer.chrome.com/docs/ai/get-started'
const EXTENSION_DOC = 'https://github.com/harshavardhankonisa/split-soul'

type ApiStatus = 'available' | 'downloading' | 'downloadable' | 'unavailable'

interface ApiConfig {
  key: keyof ApiStatuses
  label: string
  check: () => Promise<ApiStatus>
  create: () => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any
}

interface ApiStatuses {
  prompt: ApiStatus
  summarizer: ApiStatus
  proofreader: ApiStatus
  translator: ApiStatus
  writer: ApiStatus
  rewriter: ApiStatus
}

interface LoadingStates {
  prompt: boolean
  summarizer: boolean
  proofreader: boolean
  translator: boolean
  writer: boolean
  rewriter: boolean
}

const Home = () => {
  const [apis, setApis] = useState<ApiStatuses | null>(null)
  const [loading, setLoading] = useState<LoadingStates>({
    prompt: false,
    summarizer: false,
    proofreader: false,
    translator: false,
    writer: false,
    rewriter: false
  })
  const [error, setError] = useState<string | null>(null)

  const apiConfigs: ApiConfig[] = [
    {
      key: 'prompt',
      label: 'Prompt',
      check: () => PromptAPI.checkAvailability(),
      create: () => PromptAPI.create()
    },
    {
      key: 'summarizer',
      label: 'Summarizer',
      check: () => SummarizerAPI.checkAvailability(),
      create: () => SummarizerAPI.create()
    },
    {
      key: 'proofreader',
      label: 'Proofreader',
      check: () => ProofreaderAPI.checkAvailability(),
      create: () => ProofreaderAPI.create()
    },
    {
      key: 'translator',
      label: 'Translator (en→es)',
      check: () => TranslatorAPI.checkAvailability({ sourceLanguage: 'en', targetLanguage: 'es' }),
      create: () => TranslatorAPI.create({ sourceLanguage: 'en', targetLanguage: 'es' })
    },
    {
      key: 'writer',
      label: 'Writer',
      check: () => WriterAPI.checkAvailability(),
      create: () => WriterAPI.create()
    },
    {
      key: 'rewriter',
      label: 'Rewriter',
      check: () => RewriterAPI.checkAvailability(),
      create: () => RewriterAPI.create()
    }
  ]

  const safeApiCall = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      const result = await fn()
      if (result === undefined || result === null) {
        return fallback
      }
      return result
    } catch (err) {
      console.error('API call failed:', err)
      return fallback
    }
  }

  const checkApiStatus = async (): Promise<void> => {
    setError(null)

    try {
      const statusPromises = apiConfigs.map(config => safeApiCall(config.check, 'unavailable' as ApiStatus))

      const statuses = await Promise.all(statusPromises)

      const newStatuses = apiConfigs.reduce((acc, config, index) => {
        acc[config.key] = statuses[index]
        return acc
      }, {} as ApiStatuses)

      setApis(newStatuses)
    } catch (err) {
      setError('Failed to check API statuses')
      console.error('Error checking API statuses:', err)
    }
  }

  const handleCreateApi = async (apiKey: keyof ApiStatuses): Promise<void> => {
    if (!apis) return

    const config = apiConfigs.find(c => c.key === apiKey)
    if (!config) return

    setError(null)
    setLoading(prev => ({ ...prev, [apiKey]: true }))
    setApis(prev => prev && { ...prev, [apiKey]: 'downloading' })

    try {
      await config.create()
      await checkApiStatus()
    } catch (err) {
      const errorMessage = `Failed to create ${config.label} API`
      setError(errorMessage)
      console.error(errorMessage, err)
      setApis(prev => prev && { ...prev, [apiKey]: 'unavailable' })
    } finally {
      setLoading(prev => ({ ...prev, [apiKey]: false }))
    }
  }

  const getChipColor = (status: ApiStatus) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'downloading':
        return 'warning'
      case 'downloadable':
        return 'primary'
      case 'unavailable':
        return 'default'
      default:
        return 'default'
    }
  }

  useEffect(() => {
    checkApiStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box>
      <Typography variant='h6'>Minimum system requirements</Typography>

      <Divider sx={{ my: 1 }} />

      <ul>
        <li>Modern Chrome browser version 138 and above</li>
        <li>At least 16GB of RAM and 4GB of VRAM</li>
        <li>Stable internet connection for initial API downloads</li>
      </ul>

      <Divider sx={{ my: 1 }} />

      <Typography variant='h6' gutterBottom>
        Environment & AI API Checks
      </Typography>

      <Typography variant='subtitle2'>AI Window APIs</Typography>

      <Divider sx={{ my: 1 }} />

      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {apis ? (
        <Stack spacing={1}>
          {apiConfigs.map(config => {
            const status = apis[config.key]
            const isLoading = loading[config.key]
            const isDownloadable = status === 'downloadable'
            const isDownloading = status === 'downloading' || isLoading

            return (
              <Stack key={config.key} direction='row' spacing={2} alignItems='flex-start'>
                <Typography variant='body2' sx={{ minWidth: 160 }}>
                  {config.label}
                </Typography>

                <Stack direction='column' spacing={1} alignItems='flex-start'>
                  <Chip size='small' label={status} color={getChipColor(status)} />

                  {isDownloadable && !isDownloading && (
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={() => handleCreateApi(config.key)}
                      disabled={isDownloading}
                    >
                      Download
                    </Button>
                  )}
                </Stack>

                {isDownloading && <CircularProgress size={18} thickness={4} />}
              </Stack>
            )
          })}
        </Stack>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <Divider sx={{ my: 1 }} />

      <Typography variant='h6' gutterBottom>
        Steps to setup the extension.
      </Typography>

      <ol>
        <li>Ensure you have a stable internet connection.</li>
        <li>Check the status of each AI API above.</li>
        <li>
          For any API marked as &quot;downloadable,&quot; click the &quot;Download&quot; button to initiate the setup.
        </li>
        <li>Wait for the status to change to &quot;available.&quot;</li>
        <li>
          If any API shows &quot;unavailable,&quot; try clicking the &quot;Download&quot; button again or check your
          internet connection. or read the api{' '}
          <Link href={EXTENSION_DOC} target='_blank' rel='noreferrer'>
            docs
          </Link>
          .
        </li>
        <li>Once all required APIs are &quot;available,&quot; you can start using the extension&apos;s features.</li>
        <li>
          First go to souls tab to create new souls or you can use preset button load demo souls. You need souls for
          this extension to work.
        </li>
        <li>After souls are created, you can start browsing sites as normal. The extension works in the background</li>
        <li>After some time monitor the chats tab. If chats are generated that means application is working</li>
        <li>After sometime you can also lookout for actions.</li>
        <li>
          Remember wasm files are required for the extension to work properly. They usually take some time to download.
          Please be patient.
        </li>
        <li>Wasm is used to load xenova models in the browser.</li>
        <li>
          For more information on setting up the extension, please refer to the official{' '}
          <Link href={DOC} target='_blank' rel='noreferrer'>
            documentation
          </Link>
          .
        </li>
      </ol>
    </Box>
  )
}

export default Home
