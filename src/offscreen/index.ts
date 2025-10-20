import { SummarizerAPI } from '../services/API/summarizer'
import { PromptAPI } from '../services/API/prompt'
import { ProofreaderAPI } from '../services/API/proofreader'
import { TranslatorAPI } from '../services/API/translator'
import { WriterAPI } from '../services/API/writer'
import { RewriterAPI } from '../services/API/rewriter'

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message?.type) {
    case 'SUMMARIZE_REQUEST':
      Promise.resolve(SummarizerAPI.summarize(message.text, message.options))
        .then(summary => sendResponse({ success: true, summary }))
        .catch(err => sendResponse({ success: false, error: err?.message || String(err) }))
      return true
    case 'PROMPT_REQUEST':
      Promise.resolve(PromptAPI.prompt(message.text, message.options))
        .then(response => sendResponse({ success: true, response }))
        .catch(err => sendResponse({ success: false, error: err?.message || String(err) }))
      return true
    case 'PROOFREAD_REQUEST':
      Promise.resolve(ProofreaderAPI.proofread(message.text, message.options))
        .then(result => sendResponse({ success: true, result }))
        .catch(err => sendResponse({ success: false, error: err?.message || String(err) }))
      return true
    case 'TRANSLATE_REQUEST':
      Promise.resolve(TranslatorAPI.translate(message.text, message.options))
        .then(result => sendResponse({ success: true, result }))
        .catch(err => sendResponse({ success: false, error: err?.message || String(err) }))
      return true
    case 'WRITE_REQUEST':
      Promise.resolve(WriterAPI.write(message.text, message.options))
        .then(content => sendResponse({ success: true, content }))
        .catch(err => sendResponse({ success: false, error: err?.message || String(err) }))
      return true
    case 'REWRITE_REQUEST':
      Promise.resolve(RewriterAPI.rewrite(message.text, message.options))
        .then(result => sendResponse({ success: true, result }))
        .catch(err => sendResponse({ success: false, error: err?.message || String(err) }))
      return true
  }
})
