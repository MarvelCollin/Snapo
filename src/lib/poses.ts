export const poses = [
  { id: 'finger-heart', sticker: 'hand-with-index-finger-and-thumb-crossed' },
  { id: 'big-heart', sticker: 'heart-hands' },
  { id: 'peace', sticker: 'victory-hand' },
  { id: 'surprised', sticker: 'face-with-hand-over-mouth' },
  { id: 'hide', sticker: 'see-no-evil-monkey' },
  { id: 'cat', sticker: 'cat-face' },
  { id: 'cool', sticker: 'smiling-face-with-sunglasses' },
  { id: 'kiss', sticker: 'face-blowing-a-kiss' },
  { id: 'wink', sticker: 'winking-face' },
  { id: 'laugh', sticker: 'beaming-face-with-smiling-eyes' },
  { id: 'puppy', sticker: 'pleading-face' },
  { id: 'silly', sticker: 'zany-face' },
  { id: 'hug', sticker: 'hugging-face' },
  { id: 'royal', sticker: 'crown' },
  { id: 'secret', sticker: 'shushing-face' },
  { id: 'thumbs', sticker: 'thumbs-up' },
  { id: 'wave', sticker: 'waving-hand' },
  { id: 'love-you', sticker: 'love-you-gesture' },
] as const

export type PoseId = (typeof poses)[number]['id']

export function nextPose(prev: PoseId | null): PoseId {
  const pool = poses.filter((p) => p.id !== prev)
  return pool[Math.floor(Math.random() * pool.length)].id
}

export const poseSticker = (id: PoseId) => poses.find((p) => p.id === id)?.sticker ?? 'sparkles'
