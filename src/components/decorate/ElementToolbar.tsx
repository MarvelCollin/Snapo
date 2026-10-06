import {
  ArrowArcLeft,
  ArrowArcRight,
  ArrowCounterClockwise,
  ArrowClockwise,
  ArrowsInSimple,
  ArrowsOutSimple,
  CopySimple,
  FlipHorizontal,
  Selection,
  StackSimple,
  Trash,
  CaretDoubleDown,
} from '@phosphor-icons/react'
import { useDesign } from '../../store/design'
import { IconButton } from '../ui/IconButton'
import { useElementName } from '../../hooks/useElementName'

export function ElementToolbar() {
  const elementName = useElementName()
  const { design, selectedId, updateElement, removeElement, duplicateElement, reorderElement, undo, redo, past, future } = useDesign()
  const el = design.elements.find((e) => e.id === selectedId)

  return (
    <div className="el-toolbar" role="toolbar" aria-label="Edit">
      <div className="el-toolbar__group">
        <IconButton label="Undo (Ctrl+Z)" tone="plain" icon={<ArrowCounterClockwise weight="bold" size={20} />} onClick={undo} disabled={!past.length} tooltipSide="bottom" />
        <IconButton label="Redo (Ctrl+Shift+Z)" tone="plain" icon={<ArrowClockwise weight="bold" size={20} />} onClick={redo} disabled={!future.length} tooltipSide="bottom" />
      </div>
      {el ? (
        <div className="el-toolbar__group el-toolbar__group--el">
          <span className="el-toolbar__name">{elementName(el)}</span>
          <IconButton label="Smaller" tone="plain" icon={<ArrowsInSimple weight="bold" size={20} />} onClick={() => updateElement(el.id, { w: Math.max(0.04, el.w / 1.15) })} tooltipSide="bottom" />
          <IconButton label="Bigger" tone="plain" icon={<ArrowsOutSimple weight="bold" size={20} />} onClick={() => updateElement(el.id, { w: Math.min(1.6, el.w * 1.15) })} tooltipSide="bottom" />
          <IconButton label="Rotate left" tone="plain" icon={<ArrowArcLeft weight="bold" size={20} />} onClick={() => updateElement(el.id, { rot: el.rot - 15 })} tooltipSide="bottom" />
          <IconButton label="Rotate right" tone="plain" icon={<ArrowArcRight weight="bold" size={20} />} onClick={() => updateElement(el.id, { rot: el.rot + 15 })} tooltipSide="bottom" />
          <IconButton label="Flip" tone="plain" icon={<FlipHorizontal weight="bold" size={20} />} pressed={el.flip} onClick={() => updateElement(el.id, { flip: !el.flip })} tooltipSide="bottom" />
          {el.kind === 'sticker' && (
            <IconButton
              label={el.outline ? 'Remove white border' : 'Add white border'}
              tone="plain"
              icon={<Selection weight="bold" size={20} />}
              pressed={el.outline}
              onClick={() => updateElement(el.id, { outline: !el.outline })}
              tooltipSide="bottom"
            />
          )}
          <IconButton label="Bring forward" tone="plain" icon={<StackSimple weight="bold" size={20} />} onClick={() => reorderElement(el.id, 'up')} tooltipSide="bottom" />
          <IconButton label="Send backward" tone="plain" icon={<CaretDoubleDown weight="bold" size={20} />} onClick={() => reorderElement(el.id, 'down')} tooltipSide="bottom" />
          <IconButton label="Duplicate (Ctrl+D)" tone="plain" icon={<CopySimple weight="bold" size={20} />} onClick={() => duplicateElement(el.id)} tooltipSide="bottom" />
          <IconButton label="Delete" tone="danger" icon={<Trash weight="bold" size={20} />} onClick={() => removeElement(el.id)} tooltipSide="bottom" />
        </div>
      ) : (
        <p className="el-toolbar__hint">
          {design.elements.length ? 'Tap a sticker to move it. Drag its corner to resize and spin.' : 'Add stickers and text from the panel. They land in the middle.'}
        </p>
      )}
    </div>
  )
}
