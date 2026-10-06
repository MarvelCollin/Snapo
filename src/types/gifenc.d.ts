declare module 'gifenc' {
  type Palette = number[][]
  export function GIFEncoder(): {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: { palette?: Palette; delay?: number; repeat?: number; transparent?: boolean }): void
    finish(): void
    bytes(): Uint8Array
  }
  export function quantize(data: Uint8ClampedArray, maxColors: number, opts?: { format?: string }): Palette
  export function applyPalette(data: Uint8ClampedArray, palette: Palette, format?: string): Uint8Array
}
