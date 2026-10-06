import { useMemo, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { stickers, stickerPacks, stickerSrc, wordArt, wordPresets, type StickerPack, type WordSpec } from '../../lib/stickers'
import { useAddElement } from '../../hooks/useAddElement'
import { useT } from '../../i18n'
import { Tabs } from '../ui/Tabs'
import { TextField } from '../ui/TextField'
import { Switch } from '../ui/Switch'

function WordTile({ spec, onPick }: { spec: WordSpec; onPick: () => void }) {
  const t = useT()
  const src = useMemo(() => wordArt(spec), [spec])
  return (
    <button type="button" className="sticker-tile sticker-tile--word" onClick={onPick} aria-label={t.stickers.addWord(spec.text)}>
      <img src={src} alt="" />
    </button>
  )
}

export function StickerPanel() {
  const t = useT()
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
        label={t.stickers.search}
        hideLabel
        placeholder={t.stickers.placeholder(stickers.length + wordPresets.length)}
        value={query}
        onChange={setQuery}
        icon={<MagnifyingGlass weight="bold" size={18} />}
        type="search"
      />
      {!q && (
        <Tabs
          label={t.stickers.packs}
          tabs={stickerPacks.map((p) => ({
            id: p.id,
            label: t.stickers.packNames[p.id],
            icon: <img src={stickerSrc(p.cover)} alt="" width={22} height={22} />,
          }))}
          active={pack}
          onChange={setPack}
          idPrefix="stickers"
          variant="chunky"
        />
      )}
      <Switch label={t.stickers.border} hint={t.stickers.borderHint} checked={outline} onChange={setOutline} />
      <div id="stickers-panel" role={q ? undefined : 'tabpanel'} aria-labelledby={q ? undefined : `stickers-tab-${pack}`} className="sticker-scroll">
        {q && (
          <p className="panel-note" aria-live="polite">
            {t.stickers.results(list.length + words.length, query.trim())}
          </p>
        )}
        {(q || pack !== 'words') && list.length > 0 && (
          <ul className="sticker-grid" aria-label={t.stickers.list}>
            {list.map((s) => (
              <li key={s.id}>
                <button type="button" className="sticker-tile" onClick={() => addSticker(s.id, outline)} aria-label={t.stickers.add(s.name)}>
                  <img src={stickerSrc(s.id)} alt="" width={64} height={64} loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {showWords && (
          <ul className="sticker-grid sticker-grid--words" aria-label={t.stickers.words}>
            {words.map((w) => (
              <li key={w.text}>
                <WordTile spec={w} onPick={() => addWord(w)} />
              </li>
            ))}
          </ul>
        )}
        {q && !list.length && !words.length && (
          <div className="empty-mini">
            <p>{t.stickers.none}</p>
            <button type="button" className="link-btn" onClick={() => setQuery('')}>
              {t.stickers.clear}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
