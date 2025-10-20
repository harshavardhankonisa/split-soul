import { useEffect, useState } from 'react'
import { Box, Typography, Chip, Stack, Link, Divider } from '@mui/material'
import { PromptAPI } from '../../services/API/prompt'
import { SummarizerAPI } from '../../services/API/summarizer'
import { ProofreaderAPI } from '../../services/API/proofreader'
import { TranslatorAPI } from '../../services/API/translator'
import { WriterAPI } from '../../services/API/writer'
import { RewriterAPI } from '../../services/API/rewriter'

const DOC = 'https://developer.chrome.com/docs/ai/get-started'

type Avail = 'available' | 'downloading' | 'downloadable' | 'unavailable'

type ApiStatuses = {
  prompt: Avail
  summarizer: Avail
  proofreader: Avail
  translator: Avail
  writer: Avail
  rewriter: Avail
}

const Home = () => {
  const [apis, setApis] = useState<ApiStatuses | null>(null)

  useEffect(() => {
    const checkAll = async () => {
      const safe = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
        try {
          return await fn()
        } catch {
          return fallback
        }
      }

      const [prompt, summarizer, proofreader, translator, writer, rewriter] = await Promise.all<Avail>([
        safe(() => PromptAPI.checkAvailability(), 'unavailable'),
        safe(() => SummarizerAPI.checkAvailability(), 'unavailable'),
        safe(() => ProofreaderAPI.checkAvailability(), 'unavailable'),
        safe(() => TranslatorAPI.checkAvailability({ sourceLanguage: 'en', targetLanguage: 'es' }), 'unavailable'),
        safe(() => WriterAPI.checkAvailability(), 'unavailable'),
        safe(() => RewriterAPI.checkAvailability(), 'unavailable')
      ])

      const statuses: ApiStatuses = { prompt, summarizer, proofreader, translator, writer, rewriter }
      setApis(statuses)

      const warmUps: Promise<void>[] = []

      if (warmUps.length) {
        await Promise.all(warmUps)
        const [prompt2, summarizer2, proofreader2, translator2, writer2, rewriter2] = await Promise.all<Avail>([
          safe(() => PromptAPI.checkAvailability(), 'unavailable'),
          safe(() => SummarizerAPI.checkAvailability(), 'unavailable'),
          safe(() => ProofreaderAPI.checkAvailability(), 'unavailable'),
          safe(() => TranslatorAPI.checkAvailability({ sourceLanguage: 'en', targetLanguage: 'es' }), 'unavailable'),
          safe(() => WriterAPI.checkAvailability(), 'unavailable'),
          safe(() => RewriterAPI.checkAvailability(), 'unavailable')
        ])
        setApis({
          prompt: prompt2,
          summarizer: summarizer2,
          proofreader: proofreader2,
          translator: translator2,
          writer: writer2,
          rewriter: rewriter2
        })
      }
    }
    checkAll()
  }, [])

  return (
    <Box sx={{ p: 2, maxWidth: 720 }}>
      <Typography variant='h6' gutterBottom>
        Environment & AI API Checks
      </Typography>

      <Typography variant='subtitle2'>AI Window APIs</Typography>
      <Divider sx={{ my: 1 }} />
      {apis ? (
        <Stack spacing={1}>
          {(
            [
              ['Prompt', apis.prompt],
              ['Summarizer', apis.summarizer],
              ['Proofreader', apis.proofreader],
              ['Translator (en→es)', apis.translator],
              ['Writer', apis.writer],
              ['Rewriter', apis.rewriter]
            ] as [string, Avail][]
          ).map(([name, status]) => (
            <Stack key={name} direction='row' spacing={1} alignItems='center'>
              <Typography variant='body2' sx={{ minWidth: 160 }}>
                {name}
              </Typography>
              <Chip
                size='small'
                label={status}
                color={status === 'available' ? 'success' : status === 'downloading' ? 'warning' : 'default'}
              />
            </Stack>
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant='body1' color='text.secondary'>
            Docs:{' '}
            <Link href={DOC} target='_blank' rel='noreferrer'>
              {DOC}
            </Link>
          </Typography>
        </Stack>
      ) : (
        <Typography variant='body2' color='text.secondary'>
          Checking…
        </Typography>
      )}
    </Box>
  )
}

export default Home
