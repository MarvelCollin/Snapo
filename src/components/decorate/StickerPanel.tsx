import { useMemo, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { stickers, stickerPacks, stickerSrc, wordArt, wordPresets, type StickerPack, type WordSpec } from '../../lib/stickers'
import { useAddElement } from '../../hooks/useAddElement'
import { Tabs } from '../ui/Tabs'
import { TextField } from '../ui/TextField'
import { Switch } from '../ui/Switch'

function WordTile({ spec, onPick }: { spec: WordSpec; onPick: () => void }) {
  const src = useMemo(() => wordArt(spec), [spec])
  return (
    <button type="button" className="sticker-tile sticker-tile--word" onClick={onPick} aria-label={`Add word sticker ${spec.text}`}>
      <img src={src} alt="" />
    </button>
  )
}

export function StickerPanel() {
  const [pack, setPack] = useState<StickerPack>('love')
  const [query, setQuery] = useState('')
  const [outline, setOutline] = useState(true)
  const { addSticker, addWord } = useAddElement()

  const q = query.trim().toLowerCase()
  const list = useMemo(() => (q ? stickers.filter((s) => s.name.toLowerCase().includes(q)) : stickers.filter((s) => s.pack === pack)), [q, pack])
  const words = useMemo(() => (q ? wordPresets.filter((w) => w.text.toLowerCase().includes(q)) : wordPresets), [q])
  const showWords = q ? words.length > 0 : pack === 'words'

  return (
    <div className="panel-stack">
      <TextField
        label="Search stickers"
        hideLabel
        placeholder={`Search ${stickers.length + wordPresets.length} stickers`}
        value={query}
        onChange={setQuery}
        icon={<MagnifyingGlass weight="bold" size={18} />}
        type="search"
      />
      {!q && (
        <Tabs
          label="Sticker packs"
          tabs={stickerPacks.map((p) => ({
            id: p.id,
            label: p.label,
            icon: <img src={stickerSrc(p.cover)} alt="" width={22} height={22} />,
          }))}
          active={pack}
          onChange={setPack}
          idPrefix="stickers"
          variant="chunky"
        />
      )}
      <Switch label="White sticker border" hint="Die cut edge like real vinyl stickers" checked={outline} onChange={setOutline} />
      <div id="stickers-panel" role={q ? undefined : 'tabpanel'} aria-labelledby={q ? undefined : `stickers-tab-${pack}`} className="sticker-scroll">
        {q && (
          <p className="panel-note" aria-live="polite">
            {list.length + words.length} {list.length + words.length === 1 ? 'match' : 'matches'} for "{query.trim()}"
          </p>
        )}
        {(q || pack !== 'words') && list.length > 0 && (
          <ul className="sticker-grid" aria-label="Stickers">
            {list.map((s) => (
              <li key={s.id}>
                <button type="button" className="sticker-tile" onClick={() => addSticker(s.id, outline)} aria-label={`Add ${s.name}`}>
                  <img src={stickerSrc(s.id)} alt="" width={64} height={64} loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {showWords && (
          <ul className="sticker-grid sticker-grid--words" aria-label="Word stickers">
            {words.map((w) => (
              <li key={w.text}>
                <WordTile spec={w} onPick={() => addWord(w)} />
              </li>
            ))}
          </ul>
        )}
        {q && !list.length && !words.length && (
          <div className="empty-mini">
            <p>No stickers match that. Try "heart", "cat" or "star".</p>
            <button type="button" className="link-btn" onClick={() => setQuery('')}>
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
