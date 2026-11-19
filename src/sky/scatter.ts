// A small single-scattering atmosphere: Rayleigh scattering from the air and
// Mie scattering from haze, over an Earth-sized planet, the way the classic
// precomputed-sky papers set it up (Nishita et al. 1993; the constants are the
// usual ones from Bruneton and Neyret 2008). It is slow next to a shader, so it
// runs on a small image that the browser scales up, which a sky forgives.

const EARTH = 6360e3
const TOP = 6420e3
const H_R = 7994 // Rayleigh scale height, m
const H_M = 1200 // Mie scale height, m
const BETA_R = [5.8e-6, 13.5e-6, 33.1e-6] // per metre, for red, green, blue
const BETA_M = 21e-6
// ozone absorbs orange light and scatters none; it is why the zenith stays
// blue at dusk (absorption per metre at peak density, from Bruneton 2017)
const BETA_O = [0.65e-6, 1.881e-6, 0.085e-6]
/** ozone density: a tent around 25 km, 30 km wide */
const ozone = (h: number) => Math.max(0, 1 - Math.abs(h - 25e3) / 15e3)
const G = 0.76 // how forward the haze scatters
const SUN = 20 // sun intensity, before exposure

const VIEW_STEPS = 10
const LIGHT_STEPS = 5

/** Distance along a ray from `o` (height above centre `oh`, cos of zenith angle `mu`) to a sphere of radius `r`, or -1. */
function toSphere(oh: number, mu: number, r: number): number {
  const b = oh * mu
  const c = oh * oh - r * r
  const d = b * b - c
  if (d < 0) return -1
  const t = -b + Math.sqrt(d)
  return t > 0 ? t : -1
}

/** Whether a ray from height `oh` at cos zenith `mu` hits the ground. */
function hitsGround(oh: number, mu: number): boolean {
  if (mu >= 0) return false
  const b = oh * mu
  return b * b - (oh * oh - EARTH * EARTH) >= 0
}

/**
 * The light reaching the eye along one view direction, as linear RGB.
 * `view` and `sun` are unit vectors with y up; the eye is 1 m above the ground.
 */
export function skyRadiance(
  view: [number, number, number],
  sun: [number, number, number],
): [number, number, number] {
  const oh = EARTH + 1
  const muView = view[1]
  const length = hitsGround(oh, muView)
    ? Math.max(
        0,
        -oh * muView -
          Math.sqrt(Math.max(0, oh * oh * muView * muView - (oh * oh - EARTH * EARTH))),
      )
    : toSphere(oh, muView, TOP)
  if (length <= 0) return [0, 0, 0]

  const cosTheta = view[0] * sun[0] + view[1] * sun[1] + view[2] * sun[2]
  const phaseR = (3 / (16 * Math.PI)) * (1 + cosTheta * cosTheta)
  const phaseM =
    ((3 / (8 * Math.PI)) * ((1 - G * G) * (1 + cosTheta * cosTheta))) /
    ((2 + G * G) * Math.pow(1 + G * G - 2 * G * cosTheta, 1.5))

  const ds = length / VIEW_STEPS
  let odR = 0
  let odM = 0
  let odO = 0
  let r0 = 0
  let r1 = 0
  let r2 = 0
  let m0 = 0
  let m1 = 0
  let m2 = 0
  for (let i = 0; i < VIEW_STEPS; i++) {
    const t = (i + 0.5) * ds
    // the sample point, in a frame where the eye is at (0, oh, 0)
    const px = view[0] * t
    const py = oh + view[1] * t
    const pz = view[2] * t
    const ph = Math.sqrt(px * px + py * py + pz * pz)
    const h = ph - EARTH
    const dR = Math.exp(-h / H_R) * ds
    const dM = Math.exp(-h / H_M) * ds
    odR += dR
    odM += dM
    odO += ozone(h) * ds

    // towards the sun from the sample: in shadow if the planet is in the way
    const muSun = (px * sun[0] + py * sun[1] + pz * sun[2]) / ph
    if (hitsGround(ph, muSun)) continue
    const lightLen = toSphere(ph, muSun, TOP)
    const dl = lightLen / LIGHT_STEPS
    let lR = 0
    let lM = 0
    let lO = 0
    for (let j = 0; j < LIGHT_STEPS; j++) {
      const tl = (j + 0.5) * dl
      const qx = px + sun[0] * tl
      const qy = py + sun[1] * tl
      const qz = pz + sun[2] * tl
      const qh = Math.sqrt(qx * qx + qy * qy + qz * qz) - EARTH
      lR += Math.exp(-qh / H_R) * dl
      lM += Math.exp(-qh / H_M) * dl
      lO += ozone(qh) * dl
    }
    const tau = (k: number) =>
      BETA_R[k] * (odR + lR) + BETA_M * 1.1 * (odM + lM) + BETA_O[k] * (odO + lO)
    const a0 = Math.exp(-tau(0))
    const a1 = Math.exp(-tau(1))
    const a2 = Math.exp(-tau(2))
    r0 += a0 * dR
    r1 += a1 * dR
    r2 += a2 * dR
    m0 += a0 * dM
    m1 += a1 * dM
    m2 += a2 * dM
  }
  return [
    SUN * (r0 * BETA_R[0] * phaseR + m0 * BETA_M * phaseM),
    SUN * (r1 * BETA_R[1] * phaseR + m1 * BETA_M * phaseM),
    SUN * (r2 * BETA_R[2] * phaseR + m2 * BETA_M * phaseM),
  ]
}

/**
 * Linear light to 8-bit display values: exposure, a little more colour than
 * the bare model (a sky's saturation is what the eye remembers), then gamma.
 */
export function toDisplay(
  rgb: [number, number, number],
  exposure = 1.25,
): [number, number, number] {
  const e = rgb.map((x) => 1 - Math.exp(-x * exposure))
  const luma = 0.2126 * e[0] + 0.7152 * e[1] + 0.0722 * e[2]
  return e.map((x) => {
    const sat = Math.min(1, Math.max(0, luma + (x - luma) * 1.35))
    return Math.round(255 * Math.pow(sat, 1 / 2.2))
  }) as [number, number, number]
}

/** A unit vector from azimuth (0 = straight ahead) and elevation, both in radians. */
export function direction(azimuth: number, elevation: number): [number, number, number] {
  const c = Math.cos(elevation)
  return [Math.sin(azimuth) * c, Math.sin(elevation), -Math.cos(azimuth) * c]
}
