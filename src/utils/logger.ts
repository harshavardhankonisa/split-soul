export const log = (name: string, msg: string, ...args: unknown[]) => {
  console.log(`[${name}] ${msg}`, ...args)
}
