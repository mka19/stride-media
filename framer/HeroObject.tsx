import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { color } from "./theme";
import { detailFor, type Breakpoint } from "./responsive";

/**
 * The hero's 3D element — Anubis-Chain treatment, Stride's own form.
 *
 * A sculpted, bevel-extruded version of the Stride mark (chevron inside a
 * ring), lit as a soft gradient solid with an accent rim rather than rendered as
 * a wireframe or a faceted rock: dimensional, glowing, slowly rotating, with
 * dust drifting around it. A point cloud sampled from the same geometry
 * handles phase 2 — as `progress` climbs, the solid fades while the cloud
 * disperses outward, which is the dissolve that hands the stage to the
 * headline.
 *
 * `progress` arrives through a ref rather than a prop so scrolling never
 * triggers a React render; the loop just reads the latest value.
 */
export type HeroObjectHandle = { setProgress: (p: number) => void };

/**
 * The logo, as SVG.
 *
 * ── THIS IS THE ONE THING TO EDIT TO CHANGE THE MARK ──────────────────────
 *
 * Paste a new SVG between the backticks and the 3D object becomes that shape.
 * Nothing else in this file needs to change: the geometry, the bevel, the
 * chrome, the pointer sway, the dissolve and the scroll handle all work from
 * whatever is here.
 *
 * What the SVG has to be:
 *   - filled closed paths only (`<path d="…">` with a fill). Strokes are not
 *     geometry — a stroked outline has no area to extrude, so it comes out
 *     empty. Outline any strokes before exporting.
 *   - no gradients, masks, clip-paths or text. Gradients are a paint, and
 *     this surface is chrome; text has to be converted to outlines.
 *   - holes are fine. A path wound against its parent becomes a real hole in
 *     the extrusion rather than filling solid.
 *
 * It is inlined as a string rather than fetched, which is what keeps this
 * component a single file with no asset to host when it moves into Framer.
 */
const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="19 12.25 80 80">
  <g fill="#000000">
    <path d="M 28 44 L 28 32 L 36 24 L 49 24 L 41 32 L 38 32 L 35.5 34.5 L 35.5 37 Z"/>
    <path d="M 90 44 L 90 32 L 82 24 L 69 24 L 77 32 L 80 32 L 82.5 34.5 L 82.5 37 Z"/>
    <path d="M 28 60.5 L 28 72.5 L 36 80.5 L 49 80.5 L 41 72.5 L 38 72.5 L 35.5 70 L 35.5 67.5 Z"/>
    <path d="M 90 60.5 L 90 72.5 L 82 80.5 L 69 80.5 L 77 72.5 L 80 72.5 L 82.5 70 L 82.5 67.5 Z"/>
    <path d="M 59 37.25 C 59 48.5 62.75 52.25 74 52.25 C 62.75 52.25 59 56 59 67.25 C 59 56 55.25 52.25 44 52.25 C 55.25 52.25 59 48.5 59 37.25 Z"/>
  </g>
</svg>`;

/**
 * Turn that SVG into shapes Three can extrude.
 *
 * Two things have to be corrected on the way in. SVG's y axis points down and
 * Three's points up, so every shape is mirrored vertically — miss this and
 * the mark comes out upside down. And SVG coordinates are in whatever units
 * the artboard used, which here is an 80-unit viewBox: the result is
 * normalised so the mark's longest side is a fixed size in world units, which
 * is what lets a different SVG drop in without everything around it moving.
 */
/**
 * The room the chrome reflects.
 *
 * RoomEnvironment — Three's own studio box — was the obvious choice and it
 * was wrong for this: it is lit fairly evenly, and a mirror reflecting an
 * evenly lit room has no contrast in it, so the mark came out looking like
 * grey paint rather than metal. What reads as polished is the *banding* —
 * hard bright strips against near-black, the light fittings of a studio
 * reflected in the surface. That is what this builds: a dark enclosure with
 * a few bright panels in it, which is about twenty lines and no asset file.
 */
function chromeEnvironment(): THREE.Scene {
  const env = new THREE.Scene();

  /*
   * The enclosure, and the single most important thing in it: a horizon.
   *
   * A uniform grey box gives the metal a body tone but every flat face then
   * reflects the same grey, which is why the large faces came out as flat
   * paint. Real chrome outdoors or in a studio always shows a division —
   * bright above, dark below — and the line between them sliding across the
   * surface as the object turns is most of what reads as "polished". So the
   * shell is a vertical gradient rather than a colour.
   */
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(9, 32, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: /* glsl */ `
        varying float vH;
        void main() {
          vH = normalize(position).y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vH;
        void main() {
          /*
           * A studio ceiling, not a gradient.
           *
           * A smooth sky-to-floor ramp gives a mirror nothing to reflect but
           * a smooth ramp, which is why the mark came out looking like light
           * grey paint. What makes chrome look like chrome is structure —
           * the hard edge between a lit strip and the dark between them,
           * sliding across the surface as the object turns. These are the
           * strips, over a bright ceiling, a hard horizon and a dark floor.
           */
          vec3 ceiling = vec3(1.35, 1.38, 1.46);
          vec3 gap     = vec3(0.24, 0.25, 0.32);
          vec3 wall    = vec3(0.60, 0.62, 0.70);
          vec3 floorC  = vec3(0.10, 0.10, 0.14);

          // Four strips across the upper hemisphere, hard-edged.
          float strip = step(0.55, fract(vH * 7.0));
          vec3 above = mix(gap, ceiling, strip);

          // Wall between the strips and the horizon, then the floor below it.
          float toWall = smoothstep(0.42, 0.14, vH);
          vec3 upper = mix(above, wall, toWall);
          float toFloor = smoothstep(0.04, -0.12, vH);
          gl_FragColor = vec4(mix(upper, floorC, toFloor), 1.0);
        }
      `,
    }),
  );
  env.add(shell);

  // The fittings: a wide key overhead, two verticals for the long highlights
  // down the sides of a bevel, and a dim bounce underneath so the lower faces
  // are not pure black.
  const panel = (w: number, h: number, intensity: number, pos: [number, number, number], rot: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    m.material.color.multiplyScalar(intensity);
    m.position.set(...pos);
    m.rotation.set(...rot);
    env.add(m);
  };

  panel(10, 3.2, 7.5, [0, 5.6, 0], [Math.PI / 2, 0, 0]);
  panel(2.4, 9, 5.5, [-5.6, 0, 1], [0, Math.PI / 2, 0]);
  panel(2.0, 9, 4.0, [5.6, 0, -1], [0, -Math.PI / 2, 0]);
  // The floor bounce and the back wall are what keep the faces turned away
  // from the key out of pure black, which is the difference between silver
  // and a dark mirror.
  panel(9, 9, 1.1, [0, -5.6, 0], [-Math.PI / 2, 0, 0]);
  panel(9, 9, 1.4, [0, 0, -5.6], [0, 0, 0]);
  // A broad soft source on the camera side: the faces pointing at the viewer
  // have to reflect something, and without this they reflect the back wall.
  panel(7, 4.5, 0.7, [-1.6, 1.4, 5.8], [0, Math.PI, 0]);

  return env;
}

function logoShapes(svg: string): THREE.Shape[] {
  const paths = new SVGLoader().parse(svg).paths;
  const shapes: THREE.Shape[] = [];
  for (const path of paths) {
    for (const shape of SVGLoader.createShapes(path)) shapes.push(shape);
  }
  return shapes;
}

export default function HeroObject({
  handleRef,
  className,
  breakpoint = "desktop",
  pointerTracking = true,
}: {
  handleRef: React.MutableRefObject<HeroObjectHandle | null>;
  className?: string;
  /** Drives vertex and particle counts — phones get a fraction of them. */
  breakpoint?: Breakpoint;
  /** Follow the pointer: the mark turns toward it as the cursor crosses. */
  pointerTracking?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // Capping DPR matters more than anything else for battery on phones.
    /*
     * Capped at 1, not at the display's own ratio.
     *
     * This was the most expensive thing on the page by a wide margin: at
     * devicePixelRatio 2 the mark is rendered into four times the fragments,
     * and measured frame by frame it cost about 33ms of every frame in the
     * hero — more than everything else on the section put together. The mark
     * is a soft, glowing point cloud with no hard edges to alias, so the
     * extra resolution buys nothing you can see.
     */
    renderer.setPixelRatio(1);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, mount.clientWidth / mount.clientHeight, 0.1, 100);

    /*
     * Something for the chrome to reflect.
     *
     * A metal surface has almost no diffuse response — what you see in it is
     * the room around it. At metalness 1 with no environment the mark renders
     * very nearly black, however many lights are pointed at it, because there
     * is nothing in the scene for those lights to be a reflection of.
     *
     * The studio is built in code rather than loaded as an HDR, which is the
     * reason this stays a single component that can be pasted into Framer
     * with nothing to host. It is run through PMREM once at mount and the
     * render target is released with everything else on teardown.
     */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = chromeEnvironment();
    const envRT = pmrem.fromScene(envScene, 0);
    scene.environment = envRT.texture;
    pmrem.dispose();
    envScene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      if (m.material) (m.material as THREE.Material).dispose();
    });

    /**
     * How many pixels tall the mark should read as.
     *
     * The canvas used to be a square box the size of the mark, which clipped
     * the dissolve: the particles travel outward and simply stopped at the
     * box's edges, so the scatter happened inside a visible rectangle. The
     * canvas now fills the frame, and the camera pulls back in proportion to
     * how much taller the frame is than the mark, so the mark itself stays
     * the size it was while the particles have the whole frame to cross.
     */
    const markPx = () => {
      const vmin = Math.min(window.innerWidth, window.innerHeight);
      if (breakpoint === "mobile") return vmin * 0.4;
      if (breakpoint === "tablet") return vmin * 0.58;
      return Math.min(600, window.innerWidth * 0.66);
    };
    const zScale = () => Math.max(1, mount.clientHeight / Math.max(1, markPx()));

    camera.position.set(0, 0, 6.4 * zScale());

    // The accent survives only in the rim, the fill light and the dust; the
    // mark itself is neutral metal now, so the deep purple it used to be
    // coloured with is gone.
    const accent = new THREE.Color(color.accentBright);

    // --- the mark, as a single solid ------------------------------------
    const detail = detailFor(breakpoint);

    const extrude: THREE.ExtrudeGeometryOptions = {
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.06,
      bevelSegments: Math.max(2, Math.round(6 * detail)),
      /*
       * Halved from 24. The only curves in the mark are the star's four
       * gentle beziers, and at 12 segments they are indistinguishable from 24
       * — but this number sets the vertex count, and the vertex count is also
       * the dissolve's particle count, so it is paid for twice on every
       * frame. 10,692 vertices to 5,712, with the silhouette unchanged.
       */
      curveSegments: Math.max(6, Math.round(12 * detail)),
    };

    /*
     * Every path in the SVG becomes its own extrusion and they are merged
     * into one geometry, because everything downstream expects a single mesh:
     * the rim shell reuses it, the dissolve samples it, and the pointer sway
     * turns it as one object. Five separate meshes would need five of each.
     */
    const parts = logoShapes(LOGO_SVG).map(
      (shape) => new THREE.ExtrudeGeometry(shape, extrude),
    );
    const markGeo = mergeGeometries(parts, false)!;

    /*
     * SVG's y axis points down and Three's points up, so the mark arrives
     * mirrored; flipping y here rather than rotating the mesh means the
     * geometry itself is the right way up and every effect built on it —
     * the outward dissolve vectors especially — points where it should.
     *
     * Then it is centred and normalised: whatever units the artboard used,
     * the mark ends up a fixed size in world units, so a different SVG can be
     * dropped in without the camera, the dust or the dissolve moving.
     */
    markGeo.scale(1, -1, 1);
    markGeo.center();

    const span = new THREE.Box3().setFromBufferAttribute(
      markGeo.attributes.position as THREE.BufferAttribute,
    ).getSize(new THREE.Vector3());
    const MARK_SIZE = 2.7; // the diameter the old mark read at
    markGeo.scale(
      MARK_SIZE / Math.max(span.x, span.y),
      MARK_SIZE / Math.max(span.x, span.y),
      1,
    );

    markGeo.computeVertexNormals();

    /*
     * Polished chrome.
     *
     * Three numbers carry the whole look. metalness 1 because it is metal and
     * anything less mixes in a plastic diffuse term that reads as painted.
     * roughness 0.06 because polished means the reflection stays sharp — at
     * 0.3 the same material is brushed steel. envMapIntensity above 1 because
     * RoomEnvironment is a modest studio and the mark wants to look lit.
     *
     * No emissive. A metal that glows from inside stops reading as metal, and
     * the glow on this mark now comes from the rim and the dust around it
     * rather than from the surface.
     */
    const solidMat = new THREE.MeshStandardMaterial({
      color: 0xf2f3f5,
      metalness: 1,
      roughness: 0.025,
      envMapIntensity: 1.35,
      transparent: true,
      opacity: 1,
    });
    const solid = new THREE.Mesh(markGeo, solidMat);
    scene.add(solid);

    // Lighting: a cool key from the upper left, accent fill from the right, so
    // the extrusion reads as a soft gradient rather than a flat silhouette.
    /*
     * The environment does the lighting now; these are for the highlights it
     * cannot give on its own — the hard specular streak that says polished.
     *
     * All three are neutral. The mark is silver, and a coloured light on a
     * mirror is a coloured mirror — a purple fill put a lilac cast down one
     * side of every bevel, which is the difference between polished metal and
     * metal-coloured plastic. The purple on this section now comes only from
     * what is behind and around the mark: the liquid field, the dust and the
     * page's own ground.
     */
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe6ff, 0.35);
    fill.position.set(4, -2, 2);
    scene.add(fill);
    const back = new THREE.PointLight(0xffffff, 5, 12);
    back.position.set(0, 0, -3);
    scene.add(back);

    const uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uAccent: { value: accent },
    };

    /*
     * --- edge shell -------------------------------------------------------
     *
     * A slightly inflated back-face shell whose silhouette is all that
     * survives. It existed to put a neon edge on a matte purple solid. Chrome
     * does not need it — the environment already puts a hard highlight on
     * every bevel, which is where an edge on metal comes from — and it costs
     * a second full draw of the mark's geometry on every frame. It is kept
     * for the dissolve, where the fading silhouette still reads well, and
     * switched off for the rest.
     */
    const rim = new THREE.Mesh(
      markGeo,
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        vertexShader: /* glsl */ `
          varying vec3 vNormalW;
          varying vec3 vViewDir;
          void main() {
            vec4 world = modelMatrix * vec4(position * 1.05, 1.0);
            vNormalW = normalize(mat3(modelMatrix) * normal);
            vViewDir = normalize(cameraPosition - world.xyz);
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uProgress;
          varying vec3 vNormalW;
          varying vec3 vViewDir;
          void main() {
            // A white edge, not a neon one: on polished metal the silhouette
            // catches the light rather than emitting a colour.
            float fres = pow(1.0 - abs(dot(normalize(vNormalW), normalize(vViewDir))), 2.6);
            gl_FragColor = vec4(1.0, 1.0, 1.0, fres * 0.22 * (1.0 - smoothstep(0.0, 0.45, uProgress)));
          }
        `,
      }),
    );
    scene.add(rim);
    // Only while the mark is coming apart. At rest the chrome carries its own
    // edges and this is one draw call of ~5,700 vertices for nothing.
    rim.visible = false;

    // --- dissolve cloud ---------------------------------------------------
    const cloudGeo = markGeo.clone();
    const count = cloudGeo.attributes.position.count;
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random() * 2 - 1;
    cloudGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));

    const cloud = new THREE.Points(
      cloudGeo,
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uProgress;
          attribute vec3 aSeed;
          varying float vFade;

          void main() {
            // Each particle leaves on its own vector, staggered by seed, so the
            // mark comes apart in waves instead of all at once.
            float stagger = 0.35 * (aSeed.x * 0.5 + 0.5);
            float t = clamp((uProgress - stagger) / (1.0 - stagger), 0.0, 1.0);
            float travel = t * t * 4.5;

            vec3 dir = normalize(normal + aSeed * 0.7);
            vec3 p = position + dir * travel;
            p.x += sin(uTime * 0.8 + aSeed.y * 6.283) * 0.09 * t;
            p.y += cos(uTime * 0.7 + aSeed.z * 6.283) * 0.09 * t;

            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (7.0 + aSeed.z * 3.0) * (1.0 / -mv.z) * 3.0;

            vFade = smoothstep(0.0, 0.2, uProgress) * (1.0 - smoothstep(0.55, 1.0, uProgress));
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uAccent;
          varying float vFade;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            gl_FragColor = vec4(uAccent, (1.0 - smoothstep(0.1, 0.5, d)) * vFade * 0.85);
          }
        `,
      }),
    );
    scene.add(cloud);

    // --- dust -------------------------------------------------------------
    const dustSpread = zScale() * 1.15;
    // The drifting specks in the Anubis reference, warm rather than green.
    const dustCount = Math.round(220 * detail);
    const dustPos = new Float32Array(dustCount * 3);
    const dustSeed = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      // Spread with the frame rather than with the old square, so the specks
      // reach the corners instead of ending in a block in the middle.
      dustPos[i * 3] = (Math.random() - 0.5) * 11 * dustSpread;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 7 * dustSpread;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
      dustSeed[i * 3] = Math.random();
      dustSeed[i * 3 + 1] = Math.random();
      dustSeed[i * 3 + 2] = Math.random();
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dustSeed, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          uniform float uTime;
          attribute vec3 aSeed;
          varying float vA;
          void main() {
            vec3 p = position;
            p.y += sin(uTime * 0.25 + aSeed.x * 6.283) * 0.5;
            p.x += cos(uTime * 0.18 + aSeed.y * 6.283) * 0.4;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (1.5 + aSeed.z * 3.0) * (1.0 / -mv.z) * 6.0;
            vA = 0.25 + aSeed.z * 0.5;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uAccent;
          uniform float uProgress;
          varying float vA;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            if (length(c) > 0.5) discard;
            gl_FragColor = vec4(uAccent, vA * (1.0 - smoothstep(0.2, 0.8, uProgress)));
          }
        `,
      }),
    );
    scene.add(dust);

    // A wide, dim halo behind the mark so the glow spills onto the page.
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 5.2),
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uAccent;
          uniform float uProgress;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            float a = pow(1.0 - clamp(d, 0.0, 1.0), 3.0) * 0.34;
            gl_FragColor = vec4(uAccent, a * (1.0 - smoothstep(0.1, 0.75, uProgress)));
          }
        `,
      }),
    );
    halo.position.z = -1.2;
    scene.add(halo);

    // --- loop -------------------------------------------------------------
    let progress = 0;
    let eased = 0;
    handleRef.current = { setProgress: (p) => (progress = p) };

    // Pointer parallax: the mark turns toward the cursor. Tracked on the
    // window rather than the canvas, since the canvas sits behind the copy
    // and takes no pointer events itself.
    let pointerX = 0;
    let pointerY = 0;
    let swayX = 0;
    let swayY = 0;
    const onPointer = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (pointerTracking) window.addEventListener("pointermove", onPointer, { passive: true });

    // THREE.Clock is deprecated; elapsed time comes straight from the
    // animation frame instead.
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number = performance.now()) => {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) / 1000;

      // Damp toward the scroll value so fast scrolls still dissolve smoothly.
      eased += (progress - eased) * 0.09;
      uniforms.uTime.value = t;
      uniforms.uProgress.value = eased;
      solidMat.opacity = 1 - THREE.MathUtils.smoothstep(eased, 0.0, 0.45);
      solidMat.visible = solidMat.opacity > 0.01;

      // Damped toward the pointer so the mark follows the cursor without
      // snapping to it, and keeps drifting when the pointer is still.
      swayX += (pointerX * 0.55 - swayX) * 0.045;
      swayY += (pointerY * 0.3 - swayY) * 0.045;

      // Sway, not spin. The ring is a flat circle, so an accumulating Y
      // rotation eventually turns it edge-on and it stops reading as a ring;
      // oscillating keeps the mark three-quarter-on the whole time.
      solid.rotation.y = Math.sin(t * 0.2) * 0.3 + swayX;
      solid.rotation.x = Math.sin(t * 0.15) * 0.1 + swayY;
      solid.position.y = Math.sin(t * 0.5) * 0.06 + eased * 0.35;
      // Shrinking as it goes hands the centre of the screen to the headline.
      const shrink = 1 - eased * 0.3;
      solid.scale.setScalar(shrink);
      rim.visible = eased > 0.01 && eased < 0.98;
      rim.rotation.copy(solid.rotation);
      rim.position.copy(solid.position);
      rim.scale.copy(solid.scale);
      cloud.rotation.copy(solid.rotation);
      cloud.position.copy(solid.position);

      camera.position.z = (6.4 + eased * 1.6) * zScale();
      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      handleRef.current = null;
      [...parts, markGeo, cloudGeo, dustGeo, halo.geometry].forEach((g) =>
        g.dispose(),
      );
      [solidMat, rim.material, cloud.material, dust.material, halo.material].forEach((m) =>
        (m as THREE.Material).dispose(),
      );
      envRT.texture.dispose();
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [handleRef, breakpoint, pointerTracking]);

  return <div ref={mountRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
