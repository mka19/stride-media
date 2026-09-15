import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { color } from "../shared/theme";
import { detailFor, type Breakpoint } from "../shared/responsive";

/**
 * The hero's 3D element — Anubis-Chain treatment, Stride's own form.
 *
 * A sculpted, bevel-extruded version of the Stride mark (chevron inside a
 * ring), lit as a soft gradient solid with a ruby rim rather than rendered as
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

/** The mark's chevron, drawn as a closed 2D path ready to extrude. */
function chevronShape() {
  const s = new THREE.Shape();
  const outer = 0.34; // stroke width
  s.moveTo(-1.0, -0.62);
  s.lineTo(-1.0 + outer * 1.25, -0.62);
  s.lineTo(0, 0.72 - outer * 1.5);
  s.lineTo(1.0 - outer * 1.25, -0.62);
  s.lineTo(1.0, -0.62);
  s.lineTo(0, 0.96);
  s.closePath();
  return s;
}

/** The bar beneath the chevron. */
function barShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.62, -1.02);
  s.lineTo(0.62, -1.02);
  s.lineTo(0.62, -0.82);
  s.lineTo(-0.62, -0.82);
  s.closePath();
  return s;
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, breakpoint === "mobile" ? 1.5 : 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const ruby = new THREE.Color(color.rubyBright);
    const deep = new THREE.Color(color.rubyDeep);

    // --- the mark, as a single solid ------------------------------------
    const detail = detailFor(breakpoint);

    const extrude: THREE.ExtrudeGeometryOptions = {
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.06,
      bevelSegments: Math.max(2, Math.round(6 * detail)),
      curveSegments: Math.max(8, Math.round(24 * detail)),
    };

    const chevron = new THREE.ExtrudeGeometry(chevronShape(), extrude);
    const bar = new THREE.ExtrudeGeometry(barShape(), extrude);
    // The chevron and bar are pulled well inside the ring. They are extruded
    // and the ring is flat, so at any angle the extrusion's front corners
    // project further out than their flat footprint: sized to just fit, they
    // break through the ring as the object turns.
    const core = mergeGeometries([chevron, bar], false)!;
    core.scale(0.74, 0.74, 0.74);

    // A ring around the mark, matching the aperture in the nav logo.
    // ExtrudeGeometry is non-indexed and TorusGeometry is indexed; merging
    // needs them to agree, so the ring is flattened before it joins.
    // Segment counts kept close to the chevron's vertex count: the dissolve
    // samples this geometry, and a denser ring makes the cloud nearly all ring.
    const ring = new THREE.TorusGeometry(
      1.34,
      0.046,
      Math.max(6, Math.round(12 * detail)),
      Math.max(36, Math.round(96 * detail)),
    ).toNonIndexed();
    ring.translate(0, 0, 0.155);

    const markGeo = mergeGeometries([core, ring], false)!;
    markGeo.center();
    markGeo.computeVertexNormals();

    const solidMat = new THREE.MeshStandardMaterial({
      color: deep.clone().multiplyScalar(1.5),
      emissive: ruby.clone().multiplyScalar(0.22),
      metalness: 0.35,
      roughness: 0.34,
      transparent: true,
      opacity: 1,
    });
    const solid = new THREE.Mesh(markGeo, solidMat);
    scene.add(solid);

    // Lighting: a cool key from the upper left, ruby fill from the right, so
    // the extrusion reads as a soft gradient rather than a flat silhouette.
    scene.add(new THREE.AmbientLight(ruby, 0.35));
    const key = new THREE.DirectionalLight(0xfff0f2, 2.6);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(ruby, 3.2);
    fill.position.set(4, -2, 2);
    scene.add(fill);
    const back = new THREE.PointLight(ruby, 18, 12);
    back.position.set(0, 0, -3);
    scene.add(back);

    const uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uRuby: { value: ruby },
    };

    // --- neon rim ---------------------------------------------------------
    // A slightly inflated back-face shell; only its silhouette survives, which
    // gives the neon edge without washing out the sculpted faces.
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
          uniform vec3 uRuby;
          uniform float uProgress;
          varying vec3 vNormalW;
          varying vec3 vViewDir;
          void main() {
            float fres = pow(1.0 - abs(dot(normalize(vNormalW), normalize(vViewDir))), 2.2);
            gl_FragColor = vec4(uRuby, fres * 0.8 * (1.0 - smoothstep(0.0, 0.45, uProgress)));
          }
        `,
      }),
    );
    scene.add(rim);

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
          uniform vec3 uRuby;
          varying float vFade;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            gl_FragColor = vec4(uRuby, (1.0 - smoothstep(0.1, 0.5, d)) * vFade * 0.85);
          }
        `,
      }),
    );
    scene.add(cloud);

    // --- dust -------------------------------------------------------------
    // The drifting specks in the Anubis reference, warm rather than green.
    const dustCount = Math.round(220 * detail);
    const dustPos = new Float32Array(dustCount * 3);
    const dustSeed = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 11;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 7;
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
          uniform vec3 uRuby;
          uniform float uProgress;
          varying float vA;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            if (length(c) > 0.5) discard;
            gl_FragColor = vec4(uRuby, vA * (1.0 - smoothstep(0.2, 0.8, uProgress)));
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
          uniform vec3 uRuby;
          uniform float uProgress;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            float a = pow(1.0 - clamp(d, 0.0, 1.0), 3.0) * 0.34;
            gl_FragColor = vec4(uRuby, a * (1.0 - smoothstep(0.1, 0.75, uProgress)));
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
      rim.rotation.copy(solid.rotation);
      rim.position.copy(solid.position);
      rim.scale.copy(solid.scale);
      cloud.rotation.copy(solid.rotation);
      cloud.position.copy(solid.position);

      camera.position.z = 6.4 + eased * 1.6;
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
      [chevron, bar, core, ring, markGeo, cloudGeo, dustGeo, halo.geometry].forEach((g) =>
        g.dispose(),
      );
      [solidMat, rim.material, cloud.material, dust.material, halo.material].forEach((m) =>
        (m as THREE.Material).dispose(),
      );
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [handleRef, breakpoint, pointerTracking]);

  return <div ref={mountRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
