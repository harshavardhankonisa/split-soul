import { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Chip, Stack, Link, Divider } from '@mui/material'
import { PromptAPI } from '../../services/API/prompt'
import { SummarizerAPI } from '../../services/API/summarizer'
import { ProofreaderAPI } from '../../services/API/proofreader'
import { TranslatorAPI } from '../../services/API/translator'
import { WriterAPI } from '../../services/API/writer'
import { RewriterAPI } from '../../services/API/rewriter'

const DEVELPER_DOC = 'https://developer.chrome.com/docs/ai/get-started'
const EXTENSION_DOC = 'https://github.com/harshavardhankonisa/split-soul'

type ApiStatus = 'available' | 'downloading' | 'downloadable' | 'unavailable'

interface ApiConfig {
  label: string
  check: () => Promise<ApiStatus>
}

const Home = () => {
  const [apis, setApis] = useState<ApiStatus[]>([])

  const apiConfigs = useMemo<ApiConfig[]>(
    () => [
      {
        label: 'Prompt',
        check: () => PromptAPI.checkAvailability()
      },
      {
        label: 'Summarizer',
        check: () => SummarizerAPI.checkAvailability()
      },
      {
        label: 'Proofreader',
        check: () => ProofreaderAPI.checkAvailability()
      },
      {
        label: 'Translator (en→es)',
        check: () => TranslatorAPI.checkAvailability({ sourceLanguage: 'en', targetLanguage: 'es' })
      },
      {
        label: 'Translator (en→fr)',
        check: () => TranslatorAPI.checkAvailability({ sourceLanguage: 'en', targetLanguage: 'fr' })
      },
      {
        label: 'Translator (en→ja)',
        check: () => TranslatorAPI.checkAvailability({ sourceLanguage: 'en', targetLanguage: 'ja' })
      },
      {
        label: 'Writer',
        check: () => WriterAPI.checkAvailability()
      },
      {
        label: 'Rewriter',
        check: () => RewriterAPI.checkAvailability()
      }
    ],
    []
  )

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
    const checkApis = () => {
      Promise.all(
        apiConfigs.map(async config => {
          try {
            return await config.check()
          } catch (err) {
            console.error(`API check failed for ${config.label}:`, err)
            return 'unavailable' as ApiStatus
          }
        })
      ).then(setApis)
    }

    checkApis()
    const interval = setInterval(checkApis, 5000)
    return () => clearInterval(interval)
  }, [apiConfigs])

  return (
    <Box>
      <Typography variant='h6'>Minimum system requirements</Typography>

      <Divider sx={{ my: 1 }} />

      <ul>
        <li>
          <Typography variant='subtitle2'>Modern Chrome browser version 138 and above</Typography>
        </li>
        <li>
          <Typography variant='subtitle2'>At least 16GB of RAM and 4GB of VRAM</Typography>
        </li>
        <li>
          <Typography variant='subtitle2'>Stable internet connection for initial API downloads</Typography>
        </li>
      </ul>

      <Divider sx={{ my: 1 }} />

      <Typography variant='h6' gutterBottom>
        Environment & AI API Checks
      </Typography>

      <Typography variant='subtitle2'>AI Window APIs</Typography>

      <Divider sx={{ my: 1 }} />

      <Stack spacing={1}>
        {apiConfigs.map((config, index) => {
          const status = apis[index] || 'unavailable'
          return (
            <Stack key={index} direction='row' spacing={2} alignItems='flex-start'>
              <Typography variant='body2' sx={{ minWidth: 160 }}>
                {config.label}
              </Typography>

              <Stack direction='column' spacing={1} alignItems='flex-start'>
                <Chip size='small' label={status} color={getChipColor(status)} />
              </Stack>
            </Stack>
          )
        })}
      </Stack>

      <Divider sx={{ my: 1 }} />

      <Typography variant='h6' gutterBottom>
        Steps to setup the extension.
      </Typography>

      <Typography variant='subtitle2' component='ol'>
        <li>Ensure you have a stable internet connection.</li>
        <li>Check the status of each AI API above.</li>
        <li>Wait for the status to change to &quot;available.&quot;</li>
        <li>
          If any API shows &quot;unavailable,&quot; read the api{' '}
          <Link href={DEVELPER_DOC} target='_blank' rel='noreferrer'>
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
        <li>
          Remember wasm files are required for the extension to work properly. They usually take some time to download.
          Please be patient. Where Wasm is used to load xenova models in the browser. We use this for vector search.
        </li>
        <li>
          For more information on setting up the extension, please refer to the official{' '}
          <Link href={EXTENSION_DOC} target='_blank' rel='noreferrer'>
            documentation
          </Link>
          .
        </li>
      </Typography>
    </Box>
  )
}

export default Home
