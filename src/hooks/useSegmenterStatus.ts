import { useSyncExternalStore } from 'react'
import { onSegmenterStatus, segmenterStatus } from '../lib/segment'

export const useSegmenterStatus = () => useSyncExternalStore(onSegmenterStatus, segmenterStatus)
