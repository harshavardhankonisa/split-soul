export const setupOnStartup = () => {
  chrome.runtime.onStartup.addListener(() => {
    console.log('Browser restarted')
  })
}
