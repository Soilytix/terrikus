/**
 * Living-backdrop filters (visual-direction §9) for the WebGL stage. Every one
 * reads a single `uTime` the stage freezes under reduced motion or with
 * ambient off; colour only ever darkens or grains, so the world register holds.
 */
import { Filter, GlProgram, UniformGroup, defaultFilterVert } from "pixi.js";

export { shadersFor, tierFor, type ShaderId, type Tier } from "./tiers";

const HEAD = `
in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
uniform highp vec4 uInputSize;
uniform vec4 uInputClamp;
uniform highp vec4 uOutputFrame;
uniform float uTime;
uniform float uSeed;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
}
vec4 at(vec2 uv) { return texture(uTexture, clamp(uv, uInputClamp.xy, uInputClamp.zw)); }
// 0..1 across the filtered frame.
vec2 frameUv() { return vTextureCoord * uInputSize.xy / uOutputFrame.zw; }
`;

/** S1 film grain on everything, plus S9 phase-contrast rims and vignette on micro scales. */
const BACKDROP = `${HEAD}
uniform float uGrain;
uniform float uMicro;
void main() {
  vec4 c = texture(uTexture, vTextureCoord);
  if (uMicro > 0.0) {
    vec2 d = uInputSize.zw * 1.5;
    vec3 w = vec3(0.333);
    float gx = dot(at(vTextureCoord + vec2(d.x, 0.0)).rgb - at(vTextureCoord - vec2(d.x, 0.0)).rgb, w);
    float gy = dot(at(vTextureCoord + vec2(0.0, d.y)).rgb - at(vTextureCoord - vec2(0.0, d.y)).rgb, w);
    c.rgb = mix(c.rgb, c.rgb * 0.55, smoothstep(0.1, 0.4, length(vec2(gx, gy))) * uMicro);
    c.rgb *= mix(1.0, smoothstep(0.95, 0.35, length(frameUv() - 0.5)), 0.35 * uMicro);
  }
  float g = hash(floor(vTextureCoord * uInputSize.xy / 1.5) + floor(uTime * 12.0)) - 0.5;
  c.rgb += g * 0.025 * uGrain * c.a;
  finalColor = c;
}`;

/** S3 painterly flow: a brush-like smear along a slow curl field, on the sky or deep wash. */
const FLOW = `${HEAD}
uniform float uSmear;
void main() {
  vec2 p = frameUv() * 3.0 + vec2(uTime * 0.02, uTime * 0.007);
  float e = 0.05;
  vec2 dir = vec2(vnoise(p + vec2(0.0, e)) - vnoise(p - vec2(0.0, e)),
                  vnoise(p - vec2(e, 0.0)) - vnoise(p + vec2(e, 0.0))) / (2.0 * e);
  dir *= uSmear * uInputSize.zw;
  vec4 acc = vec4(0.0);
  for (int i = -3; i <= 3; i++) acc += at(vTextureCoord + dir * float(i));
  finalColor = mix(texture(uTexture, vTextureCoord), acc / 7.0, 0.35);
}`;

/** S7 scale-transition dissolve: the arriving scene opens from the centre through noise. */
const DISSOLVE = `${HEAD}
uniform float uProgress;
void main() {
  vec2 uv = frameUv();
  float n = vnoise(uv * 6.0) * 0.6 + vnoise(uv * 13.0) * 0.4;
  float k = n * 0.5 + min(1.0, length(uv - 0.5) * 1.4) * 0.5;
  float p = uProgress * 1.2 - 0.1;
  finalColor = texture(uTexture, vTextureCoord) * (1.0 - smoothstep(p - 0.08, p + 0.08, k));
}`;

/**
 * S5 water film and meniscus (`filmLook` in src/sim/water.ts): water pools in
 * the darkest hollows first and films ring the edges, both shrinking as ψ falls.
 */
const FILM = `${HEAD}
uniform float uFilm;
uniform float uFill;
void main() {
  vec4 c = texture(uTexture, vTextureCoord);
  float lum = dot(c.rgb, vec3(0.333));
  vec2 d = uInputSize.zw * 2.0;
  float rim = abs(lum - dot(at(vTextureCoord + d).rgb, vec3(0.333)));
  float sheen = 0.9 + 0.1 * vnoise(frameUv() * 40.0 + uTime * 0.3);
  float filled = smoothstep(uFill * 0.35, uFill * 0.35 - 0.05, lum);
  float film = smoothstep(0.02, 0.12, rim) * uFilm;
  c.rgb *= 1.0 - max(filled, film) * 0.3 * sheen;
  finalColor = c;
}`;

/** S6 wetting front (`frontLook` in src/sim/water.ts): wet soil above the front is darker, with fingers below. */
const FRONT = `${HEAD}
uniform float uFront;
uniform float uFingering;
void main() {
  vec4 c = texture(uTexture, vTextureCoord);
  vec2 uv = frameUv();
  float fingers = pow(vnoise(vec2(uv.x * 8.0, 0.0)), 3.0) * uFingering;
  float front = uFront + fingers + (vnoise(vec2(uv.x * 20.0, uTime * 0.05)) - 0.5) * 0.01;
  float wet = smoothstep(front + 0.02, front - 0.02, uv.y);
  c.rgb *= mix(1.0, 0.78, wet);
  finalColor = c;
}`;

type Uniforms = Record<string, { value: number; type: "f32" }>;

function make<U extends string>(name: string, fragment: string, extra: Record<U, number>) {
  const u: Uniforms = { uTime: { value: 0, type: "f32" }, uSeed: { value: 0, type: "f32" } };
  for (const [k, v] of Object.entries<number>(extra)) u[k] = { value: v, type: "f32" };
  const group = new UniformGroup(u);
  const filter = new Filter({
    glProgram: GlProgram.from({ vertex: defaultFilterVert, fragment, name }),
    resources: { u: group },
  });
  return { filter, set: group.uniforms as Record<"uTime" | "uSeed" | U, number> };
}

export const backdropFilter = () => make("sw-backdrop", BACKDROP, { uGrain: 1, uMicro: 0 });
export const flowFilter = () => make("sw-flow", FLOW, { uSmear: 3 });
export const dissolveFilter = () => make("sw-dissolve", DISSOLVE, { uProgress: 0 });
export const filmFilter = () => make("sw-film", FILM, { uFilm: 1, uFill: 1 });
export const frontFilter = () => make("sw-front", FRONT, { uFront: 0, uFingering: 0 });
