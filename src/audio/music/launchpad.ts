/**
 * Launchpad Mini MK3 over Web MIDI, in Programmer mode (ported from soil-beats):
 * grid notes 11..88 (row 1 = bottom), top row CC 91..98, side column CC 19..89.
 */
import type { Frame, Press } from "./surface";

const HEADER = [0xf0, 0x00, 0x20, 0x29, 0x02, 0x0d];
const PROGRAMMER = [...HEADER, 0x0e, 0x01, 0xf7];
const LIVE = [...HEADER, 0x0e, 0x00, 0xf7];

const pick = <T extends MIDIPort>(ports: Map<string, T> | Iterable<[string, T]>) => {
  const lp = [...new Map(ports).values()].filter((p) => /launchpad|lpmini/i.test(p.name ?? ""));
  return lp.find((p) => /midi/i.test(p.name ?? "") && !/daw/i.test(p.name ?? "")) ?? lp[0];
};

export class Launchpad {
  private out: MIDIOutput | undefined;
  private leds = new Map<number, number>();
  constructor(private onPress: (p: Press) => void) {}

  async connect(): Promise<string> {
    const access = await navigator.requestMIDIAccess({ sysex: true });
    this.out = pick(access.outputs as unknown as Map<string, MIDIOutput>);
    const input = pick(access.inputs as unknown as Map<string, MIDIInput>);
    if (!this.out || !input) throw new Error("no Launchpad found");
    this.out.send(PROGRAMMER);
    this.leds.clear();
    input.onmidimessage = (e) => e.data && this.handle(e.data);
    addEventListener("pagehide", () => this.out?.send(LIVE));
    return this.out.name ?? "Launchpad";
  }

  private handle([status = 0, num = 0, val = 0]: Uint8Array) {
    const type = status & 0xf0;
    if (type === 0x80 || val === 0) return; // release
    if (type === 0x90) {
      const row = 8 - Math.floor(num / 10);
      const col = (num % 10) - 1;
      if (row >= 0 && row < 8 && col >= 0 && col < 8) this.onPress({ kind: "grid", row, col });
    } else if (type === 0xb0) {
      if (num >= 91 && num <= 98) this.onPress({ kind: "top", col: num - 91 });
      else if (num % 10 === 9 && num >= 19 && num <= 89)
        this.onPress({ kind: "side", row: 8 - Math.floor(num / 10) });
    }
  }

  /** Send only the LEDs that changed since the last frame. */
  render({ grid, top, side }: Frame) {
    const out = this.out;
    if (!out) return;
    const set = (status: number, num: number, color: number) => {
      const id = status * 256 + num;
      if (this.leds.get(id) === color) return;
      this.leds.set(id, color);
      out.send([status, num, color]);
    };
    grid.forEach((row, r) => row.forEach((color, c) => set(0x90, (8 - r) * 10 + c + 1, color)));
    top.forEach((color, c) => set(0xb0, 91 + c, color));
    side.forEach((color, r) => set(0xb0, (8 - r) * 10 + 9, color));
  }
}
