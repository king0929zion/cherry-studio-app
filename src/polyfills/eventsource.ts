import EventSource from 'react-native-sse'

if (typeof global.EventSource === 'undefined') {
  // @ts-ignore
  global.EventSource = EventSource
}

export { EventSource }
export default EventSource

