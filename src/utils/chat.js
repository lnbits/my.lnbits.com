const CHAT_EMBED_PATH = '/chat/embed/'
const MAX_CHAT_ID_LENGTH = 255

const isValidChatId = chatId =>
  typeof chatId === 'string' &&
  chatId.length > 0 &&
  chatId.length <= MAX_CHAT_ID_LENGTH

const getChatIdFromUrl = value => {
  if (!value) return null

  try {
    const url = new URL(value)
    const pathIndex = url.pathname.indexOf(CHAT_EMBED_PATH)
    if (pathIndex < 0) return null

    const [, encodedChatId] = url.pathname
      .slice(pathIndex + CHAT_EMBED_PATH.length)
      .split('/')
    if (!encodedChatId) return null

    const chatId = decodeURIComponent(encodedChatId)

    return isValidChatId(chatId) ? chatId : null
  } catch {
    return null
  }
}

const getChatUrlForId = (chatId, templateUrl) => {
  if (!isValidChatId(chatId)) return null

  try {
    const url = new URL(templateUrl)
    const pathIndex = url.pathname.indexOf(CHAT_EMBED_PATH)
    if (pathIndex < 0) return null

    const [embedId] = url.pathname
      .slice(pathIndex + CHAT_EMBED_PATH.length)
      .split('/')
    if (!embedId) return null

    const pathStart = url.pathname.slice(
      0,
      pathIndex + CHAT_EMBED_PATH.length
    )
    url.pathname = `${pathStart}${embedId}/${encodeURIComponent(chatId)}`

    return url.toString()
  } catch {
    return null
  }
}

export {getChatIdFromUrl, getChatUrlForId, isValidChatId}
