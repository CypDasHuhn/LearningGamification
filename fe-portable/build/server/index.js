import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, Link, useLoaderData, useNavigate, redirect, useSearchParams, data, useActionData, useNavigation, Form } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, User2 } from "lucide-react";
const streamTimeout = 5e3;
function handleRequest(request2, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request2.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request2.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request2.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [];
function Layout({
  children
}) {
  const runtimeApiBase = (typeof process !== "undefined" ? process.env?.BACKEND_URL : void 0) ?? void 0 ?? "http://localhost:8080";
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    suppressHydrationWarning: true,
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {}), /* @__PURE__ */ jsx("script", {
        dangerouslySetInnerHTML: {
          __html: `window.__API_BASE__ = ${JSON.stringify(runtimeApiBase)};`
        }
      })]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const COOKIE_TOKEN$1 = "auth_token";
const COOKIE_USER_ID$1 = "auth_user_id";
const COOKIE_USER_NAME$1 = "auth_user_name";
const COOKIE_GUEST$1 = "auth_guest";
function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}
function getCookie(name) {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
  );
  const value = match ? match[1] : null;
  return value ? decodeURIComponent(value) : null;
}
function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`;
}
function getAuthFromCookies() {
  const token = getCookie(COOKIE_TOKEN$1);
  const userId = getCookie(COOKIE_USER_ID$1);
  const userName = getCookie(COOKIE_USER_NAME$1);
  if (!token || !userId || !userName) return null;
  const id = parseInt(userId, 10);
  if (Number.isNaN(id)) return null;
  return { token, userId: id, userName };
}
function setGuestCookies() {
  setCookie(COOKIE_GUEST$1, "true");
  deleteCookie(COOKIE_TOKEN$1);
  deleteCookie(COOKIE_USER_ID$1);
  deleteCookie(COOKIE_USER_NAME$1);
}
function isGuestFromCookies() {
  return getCookie(COOKIE_GUEST$1) === "true";
}
function isAuthenticated() {
  return getAuthFromCookies() !== null || isGuestFromCookies();
}
function clearAuthCookies() {
  deleteCookie(COOKIE_TOKEN$1);
  deleteCookie(COOKIE_USER_ID$1);
  deleteCookie(COOKIE_USER_NAME$1);
  deleteCookie(COOKIE_GUEST$1);
}
function parseAuthFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((s) => s.trim());
  const get = (name) => {
    const prefix = name + "=";
    const part = parts.find((p) => p.startsWith(prefix));
    return part ? decodeURIComponent(part.slice(prefix.length)) : null;
  };
  const token = get(COOKIE_TOKEN$1);
  const userId = get(COOKIE_USER_ID$1);
  const userName = get(COOKIE_USER_NAME$1);
  if (!token || !userId || !userName) return null;
  const id = parseInt(userId, 10);
  if (Number.isNaN(id)) return null;
  return { token, userId: id, userName };
}
function isGuestFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${COOKIE_GUEST$1}=true`);
}
function useClientAuth() {
  const [state, setState] = useState({ loading: true, isAuth: false, auth: null });
  useEffect(() => {
    setState({
      loading: false,
      isAuth: isAuthenticated(),
      auth: getAuthFromCookies()
    });
  }, []);
  function logout() {
    clearAuthCookies();
    setState({ loading: false, isAuth: false, auth: null });
  }
  function loginAsGuest(onSuccess) {
    setGuestCookies();
    setState({ loading: false, isAuth: true, auth: null });
    onSuccess?.();
  }
  return { ...state, logout, loginAsGuest };
}
function IngameHeader({
  siteName,
  username,
  backTo = "/",
  backLabel = "MENÜ"
}) {
  const { auth: auth2, loading } = useClientAuth();
  const displayName = loading ? "Gast" : username ?? auth2?.userName ?? "Gast";
  return /* @__PURE__ */ jsx("header", { className: "shrink-0 bg-linear-to-b from-sky-500 via-sky-600 to-sky-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-b-4 border-b-slate-900 shadow-[0_8px_0_rgba(15,23,42,0.9)]", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2", children: [
    /* @__PURE__ */ jsx(Link, { to: backTo, className: "group", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "inline-flex items-center gap-1.5 sm:gap-2 rounded-md border-[3px] border-slate-900 bg-sky-700/90 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[9px] sm:text-xs font-pixel text-amber-100 shadow-[0_3px_0_rgba(15,23,42,0.9)] group-hover:-translate-y-0.5 group-hover:shadow-[0_5px_0_rgba(15,23,42,0.9)] group-active:translate-y-0 group-active:shadow-[0_2px_0_rgba(15,23,42,0.9)] transition-all",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3 w-3 sm:h-4 sm:w-4" }),
          /* @__PURE__ */ jsx("span", { children: backLabel })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(
      "h1",
      {
        className: "flex-1 text-center font-pixel text-xs sm:text-base text-sky-50 truncate px-2",
        style: {
          textShadow: "2px 2px 0 #0f172a, -1px -1px 0 rgba(255,255,255,0.18)"
        },
        children: siteName.toUpperCase()
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 sm:gap-2 rounded-md border-[3px] border-slate-900 bg-sky-800/90 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[9px] sm:text-xs font-pixel text-amber-50 shadow-[0_3px_0_rgba(15,23,42,0.9)]", children: [
      /* @__PURE__ */ jsx("span", { className: "max-w-20 sm:max-w-30 truncate", children: displayName }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full bg-amber-400 blur-[3px] opacity-60" }),
        /* @__PURE__ */ jsx("div", { className: "relative flex items-center justify-center rounded-full bg-rose-500 h-5 w-5 sm:h-6 sm:w-6 border-2 border-slate-900 text-slate-50", children: /* @__PURE__ */ jsx(User2, { className: "h-3 w-3 sm:h-3.5 sm:w-3.5" }) })
      ] })
    ] })
  ] }) });
}
const API_BASE$1 = (typeof process !== "undefined" ? process.env?.BACKEND_URL : void 0) ?? void 0 ?? "http://localhost:8080";
async function apiGetServer(cookieHeader, path) {
  const auth2 = parseAuthFromCookieHeader(cookieHeader);
  if (!auth2?.token) return null;
  try {
    const res = await fetch(`${API_BASE$1}${path}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${auth2.token}`
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
const MAP_WIDTH = 1840;
const MAP_HEIGHT = 430;
const NODE_RADIUS = 36;
const CHARACTER_WALK_SPEED = 4;
const CHARACTER_VERTICAL_OFFSET = -54;
function useGameLoop({
  samples,
  maxSampleIndex,
  scrollRef,
  initialSampleIndex
}) {
  const pressedKeys = useRef({ left: false, right: false });
  const animFrameRef = useRef(0);
  const sampleIndexRef = useRef(initialSampleIndex);
  const isFacingLeftRef = useRef(false);
  const [sampleIndex, setSampleIndex] = useState(initialSampleIndex);
  const [facingLeft, setFacingLeft] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  useEffect(() => {
    if (samples.length === 0) return;
    function gameLoop() {
      const { left, right } = pressedKeys.current;
      let moved = false;
      if (right && !left) {
        const next = Math.min(sampleIndexRef.current + CHARACTER_WALK_SPEED, maxSampleIndex);
        if (next !== sampleIndexRef.current) {
          sampleIndexRef.current = next;
          setSampleIndex(next);
          if (isFacingLeftRef.current) {
            isFacingLeftRef.current = false;
            setFacingLeft(false);
          }
          moved = true;
        }
      } else if (left && !right) {
        const next = Math.max(sampleIndexRef.current - CHARACTER_WALK_SPEED, 0);
        if (next !== sampleIndexRef.current) {
          sampleIndexRef.current = next;
          setSampleIndex(next);
          if (!isFacingLeftRef.current) {
            isFacingLeftRef.current = true;
            setFacingLeft(true);
          }
          moved = true;
        }
      }
      setIsMoving(moved);
      if (moved && scrollRef.current && samples[sampleIndexRef.current]) {
        const containerWidth = scrollRef.current.clientWidth;
        const targetScrollLeft = samples[sampleIndexRef.current].x - containerWidth / 2;
        scrollRef.current.scrollLeft += (targetScrollLeft - scrollRef.current.scrollLeft) * 0.08;
      }
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [samples, maxSampleIndex, scrollRef]);
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        pressedKeys.current.left = true;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        pressedKeys.current.right = true;
      }
    }
    function onKeyUp(e) {
      if (e.key === "ArrowLeft") pressedKeys.current.left = false;
      if (e.key === "ArrowRight") pressedKeys.current.right = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);
  return { sampleIndex, sampleIndexRef, facingLeft, isMoving, pressedKeys };
}
function useDragScroll(scrollMultiplier = 1.4) {
  const ref = useRef(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 });
  function onMouseDown(event) {
    dragState.current = {
      active: true,
      startX: event.pageX - (ref.current?.offsetLeft ?? 0),
      scrollLeft: ref.current?.scrollLeft ?? 0
    };
    if (ref.current) ref.current.style.cursor = "grabbing";
  }
  function onMouseMove(event) {
    if (!dragState.current.active || !ref.current) return;
    event.preventDefault();
    const currentX = event.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = dragState.current.scrollLeft - (currentX - dragState.current.startX) * scrollMultiplier;
  }
  function onDragEnd() {
    dragState.current.active = false;
    if (ref.current) ref.current.style.cursor = "grab";
  }
  return {
    ref,
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp: onDragEnd,
      onMouseLeave: onDragEnd
    }
  };
}
function buildPathSamples(levels, samplesPerSegment = 150) {
  const allPoints = [];
  for (let levelIndex = 1; levelIndex < levels.length; levelIndex++) {
    const previousLevel = levels[levelIndex - 1];
    const currentLevel = levels[levelIndex];
    const controlPointX = (previousLevel.x + currentLevel.x) / 2;
    for (let t = 0; t <= 1; t += 1 / samplesPerSegment) {
      const inversT = 1 - t;
      const x = inversT * inversT * inversT * previousLevel.x + 3 * inversT * inversT * t * controlPointX + 3 * inversT * t * t * controlPointX + t * t * t * currentLevel.x;
      const y = inversT * inversT * inversT * previousLevel.y + 3 * inversT * inversT * t * previousLevel.y + 3 * inversT * t * t * currentLevel.y + t * t * t * currentLevel.y;
      allPoints.push({ x, y });
    }
  }
  return allPoints.filter(
    (point, index) => index === 0 || Math.abs(point.x - allPoints[index - 1].x) > 0.01 || Math.abs(point.y - allPoints[index - 1].y) > 0.01
  );
}
function findClosestSampleIndex(samples, level) {
  let closestIndex = 0;
  let closestDistance = Infinity;
  for (let index = 0; index < samples.length; index++) {
    const distance = Math.abs(samples[index].x - level.x);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }
  return closestIndex;
}
function buildSvgPathD(levels) {
  if (levels.length === 0) return "";
  let pathData = `M ${levels[0].x} ${levels[0].y}`;
  for (let index = 1; index < levels.length; index++) {
    const previousLevel = levels[index - 1];
    const currentLevel = levels[index];
    const controlPointX = (previousLevel.x + currentLevel.x) / 2;
    pathData += ` C ${controlPointX},${previousLevel.y} ${controlPointX},${currentLevel.y} ${currentLevel.x},${currentLevel.y}`;
  }
  return pathData;
}
function findNearestByX(items, targetX) {
  return items.reduce(
    (nearest, item) => Math.abs(item.x - targetX) < Math.abs(nearest.x - targetX) ? item : nearest
  );
}
const FLOWER_COLORS = [
  "#f87171",
  "#f472b6",
  "#fb923c",
  "#a78bfa",
  "#fbbf24",
  "#38bdf8",
  "#4ade80"
];
const PLACEMENT_CONFIG = {
  tree: {
    count: 55,
    minScale: 0.72,
    maxScale: 1.15,
    clearanceFromPath: 52,
    clearanceFromNode: 70,
    clearanceFromSelf: 30
  },
  rock: {
    count: 10,
    minScale: 0.7,
    maxScale: 1,
    clearanceFromPath: 40,
    clearanceFromNode: 60,
    clearanceFromSelf: 50
  },
  flower: {
    count: 18,
    clearanceFromPath: 30,
    clearanceFromNode: 55,
    clearanceFromSelf: 40
  }
};
function cubicBezierY(t, y0, y1, y2, y3) {
  const mt = 1 - t;
  return mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
}
function cubicBezierX(t, x0, x1, x2, x3) {
  const mt = 1 - t;
  return mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
}
const RIVER_TOP_SEGMENTS = [
  [-5, 33, 110, 20, 240, 70, 405, 54],
  [405, 54, 570, 38, 710, 78, 900, 62],
  [900, 62, 1090, 46, 1230, 84, 1410, 67],
  [1410, 67, 1590, 50, 1710, 74, 1845, 60]
];
const RIVER_BOTTOM_SEGMENTS = [
  [1845, 108, 1710, 122, 1590, 98, 1410, 115],
  [1410, 115, 1230, 132, 1090, 94, 900, 110],
  [900, 110, 710, 126, 570, 86, 405, 102],
  [405, 102, 240, 118, 110, 68, -5, 85]
];
function sampleRiverEdge(segments, targetX) {
  let bestY = 0;
  let bestDist = Infinity;
  const steps = 60;
  for (const [x0, y0, cx1, cy1, cx2, cy2, x3, y3] of segments) {
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const sampleX = cubicBezierX(t, x0, cx1, cx2, x3);
      const dist = Math.abs(sampleX - targetX);
      if (dist < bestDist) {
        bestDist = dist;
        bestY = cubicBezierY(t, y0, cy1, cy2, y3);
      }
    }
  }
  return bestY;
}
const RIVER_SAMPLE_COUNT = 200;
const RIVER_PADDING = 8;
const riverBands = (() => {
  const bands = [];
  for (let i = 0; i <= RIVER_SAMPLE_COUNT; i++) {
    const x = i / RIVER_SAMPLE_COUNT * MAP_WIDTH;
    const topY = sampleRiverEdge(RIVER_TOP_SEGMENTS, x) - RIVER_PADDING;
    const bottomY = sampleRiverEdge(RIVER_BOTTOM_SEGMENTS, x) + RIVER_PADDING;
    bands.push({ topY, bottomY });
  }
  return bands;
})();
function isInsideRiver(x, y) {
  const bandIndex = Math.round(x / MAP_WIDTH * RIVER_SAMPLE_COUNT);
  const clampedIndex = Math.max(0, Math.min(RIVER_SAMPLE_COUNT, bandIndex));
  const band = riverBands[clampedIndex];
  if (!band) return false;
  return y >= band.topY && y <= band.bottomY;
}
function seededRandom(seed) {
  let value = seed;
  return function next() {
    value = value * 1664525 + 1013904223 & 4294967295;
    return (value >>> 0) / 4294967295;
  };
}
function distanceBetween(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}
function isTooCloseToPath(x, y, pathSamples, minDistance) {
  for (const sample of pathSamples) {
    if (distanceBetween(x, y, sample.x, sample.y) < minDistance) return true;
  }
  return false;
}
function isTooCloseToAnyLevel(x, y, levels, minDistance) {
  for (const level of levels) {
    if (distanceBetween(x, y, level.x, level.y) < minDistance) return true;
  }
  return false;
}
function isTooCloseToPlaced(x, y, placed, minDistance) {
  for (const other of placed) {
    if (distanceBetween(x, y, other.x, other.y) < minDistance) return true;
  }
  return false;
}
function tryPlacePoint(random, pathSamples, levels, placed, clearanceFromPath, clearanceFromNode, clearanceFromSelf, maxAttempts = 120) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = Math.round(random() * (MAP_WIDTH - 40) + 20);
    const y = Math.round(random() * (MAP_HEIGHT - 40) + 20);
    if (isInsideRiver(x, y)) continue;
    if (isTooCloseToPath(x, y, pathSamples, clearanceFromPath)) continue;
    if (isTooCloseToAnyLevel(x, y, levels, clearanceFromNode + NODE_RADIUS))
      continue;
    if (isTooCloseToPlaced(x, y, placed, clearanceFromSelf)) continue;
    return { x, y };
  }
  return null;
}
function generateDecorationPositions(levels, seed = 42) {
  const random = seededRandom(seed);
  const pathSamples = buildPathSamples(levels, 80);
  const allPlaced = [];
  const trees = [];
  const rocks = [];
  const flowers = [];
  const { tree, rock, flower } = PLACEMENT_CONFIG;
  for (let i = 0; i < tree.count; i++) {
    const point = tryPlacePoint(
      random,
      pathSamples,
      levels,
      allPlaced,
      tree.clearanceFromPath,
      tree.clearanceFromNode,
      tree.clearanceFromSelf
    );
    if (!point) continue;
    const scale = tree.minScale + random() * (tree.maxScale - tree.minScale);
    trees.push({
      x: point.x,
      y: point.y,
      scale: Math.round(scale * 100) / 100
    });
    allPlaced.push(point);
  }
  for (let i = 0; i < rock.count; i++) {
    const point = tryPlacePoint(
      random,
      pathSamples,
      levels,
      allPlaced,
      rock.clearanceFromPath,
      rock.clearanceFromNode,
      rock.clearanceFromSelf
    );
    if (!point) continue;
    const scale = rock.minScale + random() * (rock.maxScale - rock.minScale);
    rocks.push({
      x: point.x,
      y: point.y,
      scale: Math.round(scale * 100) / 100
    });
    allPlaced.push(point);
  }
  for (let i = 0; i < flower.count; i++) {
    const point = tryPlacePoint(
      random,
      pathSamples,
      levels,
      allPlaced,
      flower.clearanceFromPath,
      flower.clearanceFromNode,
      flower.clearanceFromSelf
    );
    if (!point) continue;
    const color = FLOWER_COLORS[Math.floor(random() * FLOWER_COLORS.length)];
    flowers.push({ x: point.x, y: point.y, color });
    allPlaced.push(point);
  }
  return { trees, rocks, flowers };
}
function TreeSVG({ x, y, scale = 1 }) {
  const lobeRadius = 11 * scale;
  const lobeOffset = lobeRadius * 1.05;
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx("circle", { cx: x, cy: y - lobeOffset, r: lobeRadius, fill: "#1e5820" }),
    /* @__PURE__ */ jsx("circle", { cx: x + lobeOffset, cy: y, r: lobeRadius, fill: "#1e5820" }),
    /* @__PURE__ */ jsx("circle", { cx: x, cy: y + lobeOffset, r: lobeRadius, fill: "#1e5820" }),
    /* @__PURE__ */ jsx("circle", { cx: x - lobeOffset, cy: y, r: lobeRadius, fill: "#1e5820" }),
    /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: lobeRadius * 0.88, fill: "#265e26" })
  ] });
}
function RockSVG({ x, y, scale = 1 }) {
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx(
      "ellipse",
      {
        cx: x + 4 * scale,
        cy: y + 4 * scale,
        rx: 13 * scale,
        ry: 8 * scale,
        fill: "rgba(0,0,0,0.16)"
      }
    ),
    /* @__PURE__ */ jsx("ellipse", { cx: x, cy: y, rx: 13 * scale, ry: 8 * scale, fill: "#7c7468" }),
    /* @__PURE__ */ jsx(
      "ellipse",
      {
        cx: x - 2 * scale,
        cy: y - 2 * scale,
        rx: 4.5 * scale,
        ry: 3 * scale,
        fill: "#b0a898"
      }
    )
  ] });
}
function FlowerSVG({ x, y, color }) {
  return /* @__PURE__ */ jsxs("g", { opacity: 0.85, children: [
    [0, 1, 2, 3].map((petalIndex) => {
      const angle = petalIndex * Math.PI / 2;
      return /* @__PURE__ */ jsx(
        "circle",
        {
          cx: x + Math.cos(angle) * 5,
          cy: y + Math.sin(angle) * 5,
          r: 3,
          fill: color
        },
        petalIndex
      );
    }),
    /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: 2.2, fill: "#fde68a" })
  ] });
}
function RiverSVG() {
  const riverHighlightXPositions = [80, 450, 820, 1200, 1580];
  const lilyPadXPositions = [182, 704, 1108, 1648];
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M -5,33 C 110,20 240,70 405,54 C 570,38 710,78 900,62 C 1090,46 1230,84 1410,67 C 1590,50 1710,74 1845,60 L 1845,108 C 1710,122 1590,98 1410,115 C 1230,132 1090,94 900,110 C 710,126 570,86 405,102 C 240,118 110,68 -5,85 Z",
        fill: "#2563eb",
        opacity: 0.88
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M -5,52 C 110,44 240,72 405,63 C 570,54 710,76 900,68 C 1090,60 1230,80 1410,73 C 1590,66 1710,78 1845,72 L 1845,88 C 1710,95 1590,90 1410,96 C 1230,102 1090,88 900,95 C 710,101 570,83 405,92 C 240,100 110,74 -5,82 Z",
        fill: "#1e40af",
        opacity: 0.45
      }
    ),
    riverHighlightXPositions.map((xPosition, index) => /* @__PURE__ */ jsx(
      "path",
      {
        d: `M ${xPosition},${62 + index % 2 * 6} Q ${xPosition + 80},${55 + index % 2 * 6} ${xPosition + 160},${62 + index % 2 * 6}`,
        stroke: "rgba(255,255,255,0.28)",
        fill: "none",
        strokeWidth: 2.5,
        strokeLinecap: "round"
      },
      index
    )),
    lilyPadXPositions.map((xPosition, index) => /* @__PURE__ */ jsx(
      "ellipse",
      {
        cx: xPosition,
        cy: 68 + index % 2 * 5,
        rx: 10,
        ry: 6,
        fill: "#166534",
        opacity: 0.75
      },
      index
    ))
  ] });
}
function PlatformSVG({
  x,
  y,
  isCompleted,
  isCurrent,
  isLocked,
  isCharacterNearby
}) {
  const rimColor = isLocked ? "#6b6156" : isCompleted ? "#b8860b" : isCurrent ? "#0369a1" : "#7c6a4e";
  const surfaceColor = isLocked ? "#a09088" : isCompleted ? "#e8b840" : isCurrent ? "#38bdf8" : "#d4bfa0";
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx(
      "circle",
      {
        cx: x + 5,
        cy: y + 7,
        r: NODE_RADIUS + 5,
        fill: "rgba(0,0,0,0.25)"
      }
    ),
    /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: NODE_RADIUS + 4, fill: rimColor }),
    /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: NODE_RADIUS, fill: surfaceColor }),
    /* @__PURE__ */ jsx("circle", { cx: x - 10, cy: y - 7, r: 3, fill: "rgba(0,0,0,0.07)" }),
    /* @__PURE__ */ jsx("circle", { cx: x + 8, cy: y + 8, r: 2.5, fill: "rgba(0,0,0,0.07)" }),
    /* @__PURE__ */ jsx("circle", { cx: x + 4, cy: y - 13, r: 2, fill: "rgba(0,0,0,0.05)" }),
    /* @__PURE__ */ jsx("circle", { cx: x - 9, cy: y - 11, r: 8, fill: "rgba(255,255,255,0.22)" }),
    isCurrent && /* @__PURE__ */ jsx(
      "circle",
      {
        cx: x,
        cy: y,
        r: NODE_RADIUS + 10,
        fill: "none",
        stroke: "rgba(56,189,248,0.45)",
        strokeWidth: 5
      }
    ),
    isCharacterNearby && !isLocked && /* @__PURE__ */ jsx(
      "circle",
      {
        cx: x,
        cy: y,
        r: NODE_RADIUS + 13,
        fill: "none",
        stroke: "rgba(252,211,77,0.75)",
        strokeWidth: 3,
        strokeDasharray: "6 4"
      }
    )
  ] });
}
const RUNWAY_Y = 215;
const CHAPTER_START_X = 300;
const CHAPTER_END_PADDING = 300;
const CHAPTER_MAX_SPACING = 620;
const CHAPTER_MIN_SPACING = NODE_RADIUS * 2 + 50;
const FALLBACK_CHAPTERS = [{
  id: 1,
  x: 300,
  y: RUNWAY_Y,
  stars: 1,
  title: "Einführung"
}, {
  id: 2,
  x: 920,
  y: RUNWAY_Y,
  stars: 0,
  title: "Variablen"
}, {
  id: 3,
  x: 1540,
  y: RUNWAY_Y,
  stars: -1,
  title: "Schleifen"
}];
function computeChapterSpacing(chapterCount) {
  if (chapterCount <= 1) return CHAPTER_MAX_SPACING;
  const availableWidth = MAP_WIDTH - CHAPTER_START_X - CHAPTER_END_PADDING;
  const fitSpacing = Math.floor(availableWidth / (chapterCount - 1));
  return Math.max(CHAPTER_MIN_SPACING, Math.min(CHAPTER_MAX_SPACING, fitSpacing));
}
function computeMapWidth(chapters) {
  if (chapters.length === 0) return MAP_WIDTH;
  const maxX = chapters.reduce((largestX, chapter) => Math.max(largestX, chapter.x), CHAPTER_START_X);
  return Math.max(MAP_WIDTH, maxX + CHAPTER_END_PADDING);
}
function themesToChapters(themes2) {
  if (themes2.length === 0) return FALLBACK_CHAPTERS;
  const chapterSpacing = computeChapterSpacing(themes2.length);
  return themes2.map((t, i) => ({
    id: t.themeId,
    x: CHAPTER_START_X + i * chapterSpacing,
    y: RUNWAY_Y,
    stars: i === 0 ? 1 : i === 1 ? 0 : -1,
    title: t.name
  }));
}
async function loader$2({
  request: request2
}) {
  const cookieHeader = request2.headers.get("Cookie");
  const hasAuth = parseAuthFromCookieHeader(cookieHeader) !== null;
  const isGuest = isGuestFromCookieHeader(cookieHeader);
  if (!hasAuth && !isGuest) return redirect("/");
  const themes2 = await apiGetServer(cookieHeader, "/themes");
  const chapters = themes2 ? themesToChapters(themes2) : FALLBACK_CHAPTERS;
  return {
    chapters
  };
}
const RW_TOP = 181;
const RW_BOTTOM = 249;
const RW_HEIGHT = RW_BOTTOM - RW_TOP;
const RW_CENTER = (RW_TOP + RW_BOTTOM) / 2;
const JET_H = 36;
const JET_KEYFRAMES = `
@keyframes jetIdle {
  0%,100% { transform: translateX(-50%); }
  30%      { transform: translateX(calc(-50% + 0.6px)); }
  70%      { transform: translateX(calc(-50% - 0.6px)); }
}
`;
function JetSprite({
  facingLeft = false,
  isMoving = false
}) {
  return /* @__PURE__ */ jsxs("div", {
    style: {
      position: "relative",
      width: 84,
      height: JET_H,
      transform: facingLeft ? "scaleX(-1)" : "scaleX(1)",
      filter: "drop-shadow(1px 5px 2px rgba(0,0,0,0.6))"
    },
    children: [/* @__PURE__ */ jsx("div", {
      style: {
        position: "absolute",
        left: 10,
        top: 10,
        width: 60,
        height: 16,
        background: "#f1f5f9",
        borderRadius: "4px 50% 50% 4px"
      }
    }), /* @__PURE__ */ jsx("div", {
      style: {
        position: "absolute",
        left: 58,
        top: 7,
        width: 26,
        height: 22,
        background: "#93c5fd",
        borderRadius: "2px 60% 60% 2px"
      }
    }), /* @__PURE__ */ jsx("div", {
      style: {
        position: "absolute",
        left: 10,
        top: 17,
        width: 52,
        height: 4,
        background: "#fbbf24"
      }
    }), [44, 34, 22].map((wx) => /* @__PURE__ */ jsx("div", {
      style: {
        position: "absolute",
        left: wx,
        top: 11,
        width: 7,
        height: 7,
        background: "#1d4ed8",
        borderRadius: 2,
        opacity: 0.85
      }
    }, wx)), /* @__PURE__ */ jsx("div", {
      style: {
        position: "absolute",
        left: 20,
        top: 24,
        width: 38,
        height: 12,
        background: "#e2e8f0",
        borderRadius: "1px 3px 6px 1px",
        transform: "skewX(14deg)"
      }
    }), /* @__PURE__ */ jsx("div", {
      style: {
        position: "absolute",
        left: 7,
        top: 1,
        width: 12,
        height: 14,
        background: "#e2e8f0",
        borderRadius: "4px 4px 0 0",
        transform: "skewX(10deg)"
      }
    }), /* @__PURE__ */ jsx("div", {
      style: {
        position: "absolute",
        left: 3,
        top: 19,
        width: 22,
        height: 7,
        background: "#e2e8f0",
        borderRadius: "2px 4px 4px 2px"
      }
    }), /* @__PURE__ */ jsx("div", {
      style: {
        position: "absolute",
        left: -5,
        top: 15,
        width: 16,
        height: 6,
        background: "linear-gradient(to left, #fbbf24 0%, #f97316 55%, transparent 100%)",
        borderRadius: "4px 0 0 4px",
        opacity: isMoving ? 1 : 0.45,
        transition: "opacity 0.15s"
      }
    })]
  });
}
function ChapterNode({
  chapter
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "absolute flex flex-col items-center gap-1.5",
    style: {
      left: chapter.x,
      top: chapter.y - NODE_RADIUS,
      transform: "translateX(-50%)",
      width: NODE_RADIUS * 2 + 48,
      pointerEvents: "none"
    },
    children: [/* @__PURE__ */ jsx(Link, {
      to: `/level-selection?chapter=${chapter.id}`,
      className: "flex items-center justify-center rounded-full font-pixel hover:scale-110 active:scale-95 transition-transform",
      style: {
        width: NODE_RADIUS * 2,
        height: NODE_RADIUS * 2,
        fontSize: "18px",
        color: "#1c1917",
        textShadow: "1px 1px 0 rgba(255,255,255,0.7)",
        pointerEvents: "all"
      },
      children: chapter.id
    }), /* @__PURE__ */ jsx("div", {
      className: "font-pixel text-center leading-tight",
      style: {
        fontSize: "9px",
        color: "#f5f0e8",
        textShadow: "1px 1px 0 rgba(0,0,0,0.9)",
        maxWidth: NODE_RADIUS * 2 + 48,
        pointerEvents: "none"
      },
      children: chapter.title.toUpperCase()
    })]
  });
}
function RunwaySVG({
  chapters,
  mapWidth
}) {
  const dashCount = Math.ceil(mapWidth / 50);
  const dashW = 32;
  const dashH = 8;
  const dashY = RW_CENTER - dashH / 2;
  return /* @__PURE__ */ jsxs("g", {
    children: [/* @__PURE__ */ jsx("rect", {
      x: 0,
      y: RW_TOP - 8,
      width: mapWidth,
      height: RW_HEIGHT + 16,
      fill: "#5c5c46"
    }), /* @__PURE__ */ jsx("rect", {
      x: 0,
      y: RW_TOP,
      width: mapWidth,
      height: RW_HEIGHT,
      fill: "#373737"
    }), /* @__PURE__ */ jsx("rect", {
      x: 0,
      y: RW_TOP,
      width: mapWidth,
      height: 6,
      fill: "rgba(255,255,255,0.04)"
    }), /* @__PURE__ */ jsx("rect", {
      x: 0,
      y: RW_TOP,
      width: mapWidth,
      height: 5,
      fill: "white",
      opacity: 0.85
    }), /* @__PURE__ */ jsx("rect", {
      x: 0,
      y: RW_BOTTOM - 5,
      width: mapWidth,
      height: 5,
      fill: "white",
      opacity: 0.85
    }), Array.from({
      length: dashCount
    }, (_, i) => /* @__PURE__ */ jsx("rect", {
      x: i * 50 + 4,
      y: dashY,
      width: dashW,
      height: dashH,
      rx: 2,
      fill: "#fbbf24",
      opacity: 0.72
    }, i)), chapters.map((ch) => [-1, 1].map((side) => [0, 1, 2, 3].map((row) => {
      const blockH = 9;
      const gap = 3;
      const totalH = 4 * blockH + 3 * gap;
      const startY = RW_CENTER - totalH / 2;
      const bx = side === -1 ? ch.x - 38 : ch.x + 28;
      const by = startY + row * (blockH + gap);
      return /* @__PURE__ */ jsx("rect", {
        x: bx,
        y: by,
        width: 10,
        height: blockH,
        rx: 1,
        fill: "white",
        opacity: 0.65
      }, `${ch.id}-${side}-${row}`);
    })))]
  });
}
const chapterSelection = UNSAFE_withComponentProps(function ChapterSelection() {
  const {
    chapters
  } = useLoaderData();
  const navigate = useNavigate();
  const mapWidth = computeMapWidth(chapters);
  const pathSamples = useRef([]);
  if (pathSamples.current.length === 0 && chapters.length > 1) {
    pathSamples.current = buildPathSamples(chapters, 150);
  }
  const samples = pathSamples.current;
  const decorations = useRef(generateDecorationPositions(chapters));
  const {
    trees,
    rocks,
    flowers
  } = decorations.current;
  const maxReachableSampleIndex = samples.length > 0 ? samples.length - 1 : 0;
  const startChapter = chapters.find((c) => c.stars === 0) ?? chapters[0];
  const initialSampleIndex = samples.length > 0 ? findClosestSampleIndex(samples, startChapter) : 0;
  const {
    ref: scrollContainerRef,
    handlers: dragHandlers
  } = useDragScroll();
  const {
    sampleIndex: characterSampleIndex,
    sampleIndexRef: characterSampleIndexRef,
    facingLeft: isFacingLeft,
    isMoving
  } = useGameLoop({
    samples,
    maxSampleIndex: maxReachableSampleIndex,
    scrollRef: scrollContainerRef,
    initialSampleIndex
  });
  const characterPosition = samples[characterSampleIndex] ?? {
    x: chapters[0]?.x ?? 0,
    y: chapters[0]?.y ?? 0
  };
  const nearestChapter = chapters.length > 0 ? findNearestByX(chapters, characterPosition.x) : null;
  const isCharacterOnNode = nearestChapter !== null && Math.abs(nearestChapter.x - characterPosition.x) < NODE_RADIUS;
  const currentProgressChapter = chapters.find((c) => c.stars === 0);
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== "Enter") return;
      const pos = samples[characterSampleIndexRef.current];
      if (!pos || chapters.length === 0) return;
      const nearest = findNearestByX(chapters, pos.x);
      if (Math.abs(nearest.x - pos.x) < NODE_RADIUS) {
        navigate(`/level-selection?chapter=${nearest.id}`);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, samples, chapters, characterSampleIndexRef]);
  return /* @__PURE__ */ jsxs("main", {
    className: "min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200",
    children: [/* @__PURE__ */ jsx("style", {
      children: JET_KEYFRAMES
    }), /* @__PURE__ */ jsx(IngameHeader, {
      siteName: "Kapitel Auswahl",
      backTo: "/",
      backLabel: "MENÜ"
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex-1 flex flex-col items-center justify-center py-4",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex items-center w-full gap-2 px-2",
        children: [/* @__PURE__ */ jsx("button", {
          onClick: () => scrollContainerRef.current?.scrollBy({
            left: -320,
            behavior: "smooth"
          }),
          className: "shrink-0 font-pixel text-stone-200 bg-stone-700/80 dark:bg-stone-900/80 border-4 border-stone-800 rounded px-3 py-3 hover:brightness-125 active:scale-95 transition-all",
          style: {
            boxShadow: "3px 3px 0 rgba(0,0,0,0.4)"
          },
          "aria-label": "Scroll left",
          children: "◀"
        }), /* @__PURE__ */ jsx("div", {
          ref: scrollContainerRef,
          className: "flex-1 overflow-x-scroll overflow-y-hidden select-none rounded-xl border-4 border-stone-800/40",
          style: {
            cursor: "grab"
          },
          ...dragHandlers,
          children: /* @__PURE__ */ jsxs("div", {
            className: "relative",
            style: {
              width: mapWidth,
              height: MAP_HEIGHT
            },
            children: [/* @__PURE__ */ jsxs("svg", {
              className: "absolute inset-0 pointer-events-none",
              width: mapWidth,
              height: MAP_HEIGHT,
              children: [/* @__PURE__ */ jsx("rect", {
                width: mapWidth,
                height: MAP_HEIGHT,
                fill: "#3d7a20"
              }), Array.from({
                length: Math.ceil(mapWidth / 600)
              }).map((_, segmentIndex) => /* @__PURE__ */ jsx("rect", {
                x: segmentIndex * 600,
                y: 0,
                width: 600,
                height: MAP_HEIGHT,
                fill: segmentIndex % 2 === 0 ? "#448c22" : "#3a7018",
                opacity: segmentIndex % 2 === 0 ? 0.25 : 0.2
              }, segmentIndex)), rocks.map((rock, i) => /* @__PURE__ */ jsx(RockSVG, {
                x: rock.x,
                y: rock.y,
                scale: rock.scale
              }, i)), flowers.map((flower, i) => /* @__PURE__ */ jsx(FlowerSVG, {
                x: flower.x,
                y: flower.y,
                color: flower.color
              }, i)), /* @__PURE__ */ jsx(RunwaySVG, {
                chapters,
                mapWidth
              }), chapters.map((ch) => /* @__PURE__ */ jsx(PlatformSVG, {
                x: ch.x,
                y: ch.y,
                isCompleted: ch.stars > 0,
                isCurrent: currentProgressChapter?.id === ch.id,
                isLocked: false,
                isCharacterNearby: isCharacterOnNode && nearestChapter?.id === ch.id
              }, ch.id)), trees.map((tree, i) => /* @__PURE__ */ jsx(TreeSVG, {
                x: tree.x,
                y: tree.y,
                scale: tree.scale
              }, i))]
            }), chapters.map((ch) => /* @__PURE__ */ jsx(ChapterNode, {
              chapter: ch
            }, ch.id)), samples.length > 0 && /* @__PURE__ */ jsx("div", {
              style: {
                position: "absolute",
                left: characterPosition.x,
                top: characterPosition.y - JET_H / 2,
                animation: isMoving ? void 0 : "jetIdle 2s ease-in-out infinite",
                pointerEvents: "none",
                zIndex: 20,
                willChange: "transform"
              },
              children: /* @__PURE__ */ jsx(JetSprite, {
                facingLeft: isFacingLeft,
                isMoving
              })
            })]
          })
        }), /* @__PURE__ */ jsx("button", {
          onClick: () => scrollContainerRef.current?.scrollBy({
            left: 320,
            behavior: "smooth"
          }),
          className: "shrink-0 font-pixel text-stone-200 bg-stone-700/80 dark:bg-stone-900/80 border-4 border-stone-800 rounded px-3 py-3 hover:brightness-125 active:scale-95 transition-all",
          style: {
            boxShadow: "3px 3px 0 rgba(0,0,0,0.4)"
          },
          "aria-label": "Scroll right",
          children: "▶"
        })]
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-3 font-pixel text-stone-600 dark:text-stone-400 opacity-60",
        style: {
          fontSize: "8px"
        },
        children: "← → TAXI  |  ↵ KAPITEL STARTEN"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex justify-between items-center px-4 py-2 text-stone-600 dark:text-stone-500 font-pixel text-xs",
      children: [/* @__PURE__ */ jsx("span", {
        children: "Learning Gamification v1.0"
      }), /* @__PURE__ */ jsx("span", {
        className: "opacity-80",
        children: "© 2025"
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: chapterSelection,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const MOCK_LEVELS = [
  { id: 1, x: 125, y: 295, stars: 3, title: "Grundlagen" },
  { id: 2, x: 340, y: 215, stars: 2, title: "Variablen" },
  { id: 3, x: 555, y: 280, stars: 1, title: "Schleifen" },
  { id: 4, x: 765, y: 200, stars: 0, title: "Funktionen" },
  { id: 5, x: 975, y: 268, stars: -1, title: "Arrays" },
  { id: 6, x: 1185, y: 208, stars: -1, title: "Objekte" },
  { id: 7, x: 1395, y: 275, stars: -1, title: "Klassen" },
  { id: 8, x: 1605, y: 210, stars: -1, title: "Algorithmen" }
];
const MOCK_LEVEL_DATA = {
  1: {
    questionSetId: 1,
    title: "Grundlagen",
    questions: [
      {
        questionId: 101,
        questionSetId: 1,
        questionType: "MC",
        startText: "Was ist JavaScript?",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          {
            answerId: 1,
            optionText: "Eine Skriptsprache für den Browser",
            optionOrder: 0
          },
          { answerId: 2, optionText: "Eine Datenbank", optionOrder: 1 },
          { answerId: 3, optionText: "Ein Betriebssystem", optionOrder: 2 },
          {
            answerId: 4,
            optionText: "Eine Sprache für Microcontroller",
            optionOrder: 3
          }
        ],
        gapFields: []
      },
      {
        questionId: 102,
        questionSetId: 1,
        questionType: "TF",
        startText: "HTML ist eine Programmiersprache.",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 5, optionText: "true", optionOrder: 0 },
          { answerId: 6, optionText: "false", optionOrder: 1 }
        ],
        gapFields: []
      },
      {
        questionId: 103,
        questionSetId: 1,
        questionType: "MC",
        startText: "Welches Keyword deklariert eine Konstante in JavaScript?",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 7, optionText: "var", optionOrder: 0 },
          { answerId: 8, optionText: "let", optionOrder: 1 },
          { answerId: 9, optionText: "const", optionOrder: 2 },
          { answerId: 10, optionText: "def", optionOrder: 3 }
        ],
        gapFields: []
      }
    ]
  },
  2: {
    questionSetId: 2,
    title: "Variablen",
    questions: [
      {
        questionId: 201,
        questionSetId: 2,
        questionType: "TF",
        startText: "Eine mit const deklarierte Variable kann nicht neu zugewiesen werden.",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 11, optionText: "true", optionOrder: 0 },
          { answerId: 12, optionText: "false", optionOrder: 1 }
        ],
        gapFields: []
      },
      {
        questionId: 202,
        questionSetId: 2,
        questionType: "GAP",
        startText: "Vervollständige die Variablendeklaration:",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [],
        gapFields: [
          {
            gapId: 1,
            gapIndex: 0,
            options: [
              { gapOptionId: 1, optionText: "==", optionOrder: 0 },
              { gapOptionId: 2, optionText: "===", optionOrder: 1 },
              { gapOptionId: 3, optionText: "=", optionOrder: 2 },
              { gapOptionId: 4, optionText: ":=", optionOrder: 3 }
            ]
          }
        ]
      },
      {
        questionId: 203,
        questionSetId: 2,
        questionType: "MC",
        startText: "Was ist der Unterschied zwischen let und var?",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          {
            answerId: 13,
            optionText: "let hat Block-Scope, var Funktions-Scope",
            optionOrder: 0
          },
          {
            answerId: 14,
            optionText: "var hat Block-Scope, let Funktions-Scope",
            optionOrder: 1
          },
          {
            answerId: 15,
            optionText: "Es gibt keinen Unterschied",
            optionOrder: 2
          },
          {
            answerId: 16,
            optionText: "let ist nur für Zahlen",
            optionOrder: 3
          }
        ],
        gapFields: []
      }
    ]
  },
  3: {
    questionSetId: 3,
    title: "Schleifen",
    questions: [
      {
        questionId: 301,
        questionSetId: 3,
        questionType: "MC",
        startText: "Welche Schleife eignet sich am besten bei bekannter Iterationszahl?",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 17, optionText: "while", optionOrder: 0 },
          { answerId: 18, optionText: "do-while", optionOrder: 1 },
          { answerId: 19, optionText: "for", optionOrder: 2 },
          { answerId: 20, optionText: "forEach", optionOrder: 3 }
        ],
        gapFields: []
      },
      {
        questionId: 302,
        questionSetId: 3,
        questionType: "GAP",
        startText: "Vervollständige die for-Schleife:",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [],
        gapFields: [
          {
            gapId: 2,
            gapIndex: 0,
            options: [
              { gapOptionId: 5, optionText: "i > 5", optionOrder: 0 },
              { gapOptionId: 6, optionText: "i != 5", optionOrder: 1 },
              { gapOptionId: 7, optionText: "i < 5", optionOrder: 2 },
              { gapOptionId: 8, optionText: "i == 5", optionOrder: 3 }
            ]
          }
        ]
      },
      {
        questionId: 303,
        questionSetId: 3,
        questionType: "TF",
        startText: "Eine while-Schleife prüft die Bedingung vor dem ersten Durchlauf.",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 21, optionText: "true", optionOrder: 0 },
          { answerId: 22, optionText: "false", optionOrder: 1 }
        ],
        gapFields: []
      }
    ]
  },
  4: {
    questionSetId: 4,
    title: "Funktionen",
    questions: [
      {
        questionId: 401,
        questionSetId: 4,
        questionType: "MC",
        startText: "Was gibt eine Funktion ohne return-Statement zurück?",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 23, optionText: "0", optionOrder: 0 },
          { answerId: 24, optionText: "null", optionOrder: 1 },
          { answerId: 25, optionText: "undefined", optionOrder: 2 },
          { answerId: 26, optionText: "false", optionOrder: 3 }
        ],
        gapFields: []
      },
      {
        questionId: 402,
        questionSetId: 4,
        questionType: "TF",
        startText: "Arrow Functions haben kein eigenes this.",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [
          { answerId: 27, optionText: "true", optionOrder: 0 },
          { answerId: 28, optionText: "false", optionOrder: 1 }
        ],
        gapFields: []
      },
      {
        questionId: 403,
        questionSetId: 4,
        questionType: "GAP",
        startText: "Vervollständige die Arrow Function:",
        endText: null,
        imageUrl: null,
        allowsMultiple: false,
        completed: false,
        mcAnswers: [],
        gapFields: [
          {
            gapId: 3,
            gapIndex: 0,
            options: [
              { gapOptionId: 9, optionText: "->", optionOrder: 0 },
              { gapOptionId: 10, optionText: "=>", optionOrder: 1 },
              { gapOptionId: 11, optionText: "==", optionOrder: 2 },
              { gapOptionId: 12, optionText: "=>>", optionOrder: 3 }
            ]
          }
        ]
      }
    ]
  }
};
function levelPositions(n) {
  if (n <= 0) return [];
  const xStart = 125;
  const xEnd = 1605;
  const yBase = [295, 215, 280, 200, 268, 208, 275, 210];
  return Array.from({ length: n }, (_, i) => ({
    x: n === 1 ? xStart : Math.round(xStart + i / (n - 1) * (xEnd - xStart)),
    y: yBase[i % yBase.length] ?? 215
  }));
}
function questionSetsToLevels(sets) {
  if (sets.length === 0) return [];
  const positions = levelPositions(sets.length);
  return sets.map((s, i) => ({
    id: s.questionSetId,
    title: s.title,
    x: positions[i].x,
    y: positions[i].y,
    stars: i === 0 ? 0 : -1
  }));
}
async function fetchLevels() {
  return MOCK_LEVELS;
}
function LevelNode({
  level,
  chapterTitle = "",
  chapterId = ""
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "absolute flex flex-col items-center gap-1.5",
      style: {
        left: level.x,
        top: level.y - NODE_RADIUS,
        transform: "translateX(-50%)",
        width: NODE_RADIUS * 2 + 48,
        pointerEvents: "none"
      },
      children: /* @__PURE__ */ jsx(
        Link,
        {
          to: `/level/${level.id}?chapterTitle=${encodeURIComponent(chapterTitle)}&chapter=${chapterId}`,
          className: "flex items-center justify-center rounded-full font-pixel hover:scale-110 active:scale-95 transition-transform",
          style: {
            width: NODE_RADIUS * 2,
            height: NODE_RADIUS * 2,
            fontSize: "18px",
            color: "#1c1917",
            textShadow: "1px 1px 0 rgba(255,255,255,0.7)",
            pointerEvents: "all"
          },
          children: level.id
        }
      )
    }
  );
}
const PIXEL_SIZE = 3;
const SPRITE_COLORS = {
  skin: "#f5c89a",
  hair: "#3d2b1f",
  shirt: "#e63946",
  pants: "#1d3557",
  boot: "#3a2010",
  eye: "#1c1917",
  belt: "#8b6914"
};
function PixelBlock({
  column,
  row,
  color,
  width = 1,
  height = 1
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        position: "absolute",
        left: column * PIXEL_SIZE,
        top: row * PIXEL_SIZE,
        width: width * PIXEL_SIZE,
        height: height * PIXEL_SIZE,
        background: color
      }
    }
  );
}
function PixelCharacter({ facingLeft, isWalking }) {
  const { skin, hair, shirt, pants, boot, eye, belt } = SPRITE_COLORS;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        position: "relative",
        width: 8 * PIXEL_SIZE,
        height: 18 * PIXEL_SIZE,
        transform: facingLeft ? "scaleX(-1)" : "scaleX(1)",
        imageRendering: "pixelated",
        filter: "drop-shadow(1px 3px 0 rgba(0,0,0,0.55))"
      },
      children: [
        /* @__PURE__ */ jsx(PixelBlock, { column: 1, row: 0, color: hair, width: 6 }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 0, row: 1, color: hair }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 7, row: 1, color: hair }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 1, row: 1, color: skin, width: 6 }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 0, row: 2, color: skin, width: 8 }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 0, row: 3, color: skin, width: 8 }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 2, row: 2, color: eye }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 5, row: 2, color: eye }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 1, row: 4, color: shirt, width: 6, height: 4 }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 0, row: 4, color: skin, height: 3 }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 7, row: 4, color: skin, height: 3 }),
        /* @__PURE__ */ jsx(PixelBlock, { column: 1, row: 8, color: belt, width: 6 }),
        isWalking ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(PixelBlock, { column: 1, row: 9, color: pants, width: 3, height: 3 }),
          /* @__PURE__ */ jsx(PixelBlock, { column: 1, row: 12, color: pants, width: 3, height: 1 }),
          /* @__PURE__ */ jsx(PixelBlock, { column: 1, row: 13, color: boot, width: 3, height: 2 }),
          /* @__PURE__ */ jsx(PixelBlock, { column: 4, row: 9, color: pants, width: 3, height: 3 }),
          /* @__PURE__ */ jsx(PixelBlock, { column: 4, row: 12, color: pants, width: 3, height: 1 }),
          /* @__PURE__ */ jsx(PixelBlock, { column: 4, row: 13, color: boot, width: 3, height: 2 })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(PixelBlock, { column: 1, row: 9, color: pants, width: 6, height: 4 }),
          /* @__PURE__ */ jsx(PixelBlock, { column: 1, row: 13, color: boot, width: 3, height: 2 }),
          /* @__PURE__ */ jsx(PixelBlock, { column: 4, row: 13, color: boot, width: 3, height: 2 })
        ] })
      ]
    }
  );
}
const CHARACTER_KEYFRAMES = `
@keyframes charBob {
  0%,100% { transform: translateY(0px) translateX(-50%); }
  50%      { transform: translateY(-3px) translateX(-50%); }
}
@keyframes charIdle {
  0%,100% { transform: translateY(0px) translateX(-50%); }
  50%      { transform: translateY(-1px) translateX(-50%); }
}
`;
const CHAPTER_TITLES = {
  "1": "Einführung",
  "2": "Variablen",
  "3": "Schleifen"
};
function LevelSelection({ levels }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chapterTitle = CHAPTER_TITLES[searchParams.get("chapter") ?? ""] ?? "";
  const pathSamples = useRef([]);
  if (pathSamples.current.length === 0 && levels.length > 1) {
    pathSamples.current = buildPathSamples(levels, 150);
  }
  const samples = pathSamples.current;
  const decorations = useRef(
    generateDecorationPositions(levels)
  );
  const { trees, rocks, flowers } = decorations.current;
  const maxReachableSampleIndex = samples.length > 0 ? samples.length - 1 : 0;
  const startLevel = levels.find((level) => level.stars === 0) ?? levels[0];
  const initialSampleIndex = samples.length > 0 ? findClosestSampleIndex(samples, startLevel) : 0;
  const { ref: scrollContainerRef, handlers: dragHandlers } = useDragScroll();
  const {
    sampleIndex: characterSampleIndex,
    sampleIndexRef: characterSampleIndexRef,
    facingLeft: isFacingLeft,
    isMoving: isWalking
  } = useGameLoop({
    samples,
    maxSampleIndex: maxReachableSampleIndex,
    scrollRef: scrollContainerRef,
    initialSampleIndex
  });
  const characterPosition = samples[characterSampleIndex] ?? {
    x: levels[0]?.x ?? 0,
    y: levels[0]?.y ?? 0
  };
  const nearestLevelToCharacter = levels.length > 0 ? findNearestByX(levels, characterPosition.x) : null;
  const isCharacterOnNode = nearestLevelToCharacter !== null && Math.abs(nearestLevelToCharacter.x - characterPosition.x) < NODE_RADIUS;
  const svgPathD = buildSvgPathD(levels);
  const currentProgressLevel = levels.find((level) => level.stars === 0);
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== "Enter") return;
      const currentPosition = samples[characterSampleIndexRef.current];
      if (!currentPosition || levels.length === 0) return;
      const nearestLevel = findNearestByX(levels, currentPosition.x);
      const isOnNode = Math.abs(nearestLevel.x - currentPosition.x) < NODE_RADIUS;
      if (isOnNode) {
        navigate(
          `/level/${nearestLevel.id}?chapterTitle=${encodeURIComponent(chapterTitle)}&chapter=${searchParams.get("chapter") ?? ""}`
        );
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    levels,
    navigate,
    samples,
    chapterTitle,
    searchParams,
    characterSampleIndexRef
  ]);
  return /* @__PURE__ */ jsxs("main", { className: "min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200", children: [
    /* @__PURE__ */ jsx("style", { children: CHARACTER_KEYFRAMES }),
    /* @__PURE__ */ jsx(
      IngameHeader,
      {
        siteName: "Level Auswahl",
        backTo: "/chapter-selection",
        backLabel: "KAPITEL"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center w-full gap-2 px-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => scrollContainerRef.current?.scrollBy({
              left: -320,
              behavior: "smooth"
            }),
            className: "shrink-0 font-pixel text-stone-200 bg-stone-700/80 dark:bg-stone-900/80 border-4 border-stone-800 rounded px-3 py-3 hover:brightness-125 active:scale-95 transition-all",
            style: { boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" },
            "aria-label": "Scroll left",
            children: "◀"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: scrollContainerRef,
            className: "flex-1 overflow-x-scroll overflow-y-hidden select-none rounded-xl border-4 border-stone-800/40",
            style: { cursor: "grab" },
            ...dragHandlers,
            children: /* @__PURE__ */ jsxs(
              "div",
              {
                className: "relative",
                style: { width: MAP_WIDTH, height: MAP_HEIGHT },
                children: [
                  /* @__PURE__ */ jsxs(
                    "svg",
                    {
                      className: "absolute inset-0 pointer-events-none",
                      width: MAP_WIDTH,
                      height: MAP_HEIGHT,
                      children: [
                        /* @__PURE__ */ jsx("rect", { width: MAP_WIDTH, height: MAP_HEIGHT, fill: "#3d7a20" }),
                        /* @__PURE__ */ jsx(
                          "rect",
                          {
                            x: 0,
                            y: 0,
                            width: 600,
                            height: MAP_HEIGHT,
                            fill: "#448c22",
                            opacity: 0.25
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "rect",
                          {
                            x: 700,
                            y: 0,
                            width: 500,
                            height: MAP_HEIGHT,
                            fill: "#3a7018",
                            opacity: 0.2
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "rect",
                          {
                            x: 1300,
                            y: 0,
                            width: 540,
                            height: MAP_HEIGHT,
                            fill: "#448c22",
                            opacity: 0.22
                          }
                        ),
                        /* @__PURE__ */ jsx(RiverSVG, {}),
                        rocks.map((rock, index) => /* @__PURE__ */ jsx(
                          RockSVG,
                          {
                            x: rock.x,
                            y: rock.y,
                            scale: rock.scale
                          },
                          index
                        )),
                        flowers.map((flower, index) => /* @__PURE__ */ jsx(
                          FlowerSVG,
                          {
                            x: flower.x,
                            y: flower.y,
                            color: flower.color
                          },
                          index
                        )),
                        /* @__PURE__ */ jsx(
                          "path",
                          {
                            d: svgPathD,
                            fill: "none",
                            stroke: "#3d2208",
                            strokeWidth: 30,
                            strokeLinecap: "round",
                            strokeLinejoin: "round"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "path",
                          {
                            d: svgPathD,
                            fill: "none",
                            stroke: "#c8922a",
                            strokeWidth: 22,
                            strokeLinecap: "round",
                            strokeLinejoin: "round"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "path",
                          {
                            d: svgPathD,
                            fill: "none",
                            stroke: "#e8c070",
                            strokeWidth: 10,
                            strokeLinecap: "round",
                            strokeLinejoin: "round"
                          }
                        ),
                        levels.map((level) => /* @__PURE__ */ jsx(
                          PlatformSVG,
                          {
                            x: level.x,
                            y: level.y,
                            isCompleted: level.stars > 0,
                            isCurrent: currentProgressLevel?.id === level.id,
                            isLocked: false,
                            isCharacterNearby: isCharacterOnNode && nearestLevelToCharacter?.id === level.id
                          },
                          level.id
                        )),
                        trees.map((tree, index) => /* @__PURE__ */ jsx(
                          TreeSVG,
                          {
                            x: tree.x,
                            y: tree.y,
                            scale: tree.scale
                          },
                          index
                        ))
                      ]
                    }
                  ),
                  levels.map((level) => /* @__PURE__ */ jsx(
                    LevelNode,
                    {
                      level,
                      chapterTitle,
                      chapterId: searchParams.get("chapter") ?? ""
                    },
                    level.id
                  )),
                  samples.length > 0 && /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        position: "absolute",
                        left: characterPosition.x,
                        top: characterPosition.y + CHARACTER_VERTICAL_OFFSET,
                        animation: isWalking ? "charBob 0.3s ease-in-out infinite" : "charIdle 1.8s ease-in-out infinite",
                        pointerEvents: "none",
                        zIndex: 20,
                        willChange: "transform"
                      },
                      children: /* @__PURE__ */ jsx(
                        PixelCharacter,
                        {
                          facingLeft: isFacingLeft,
                          isWalking
                        }
                      )
                    }
                  )
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => scrollContainerRef.current?.scrollBy({
              left: 320,
              behavior: "smooth"
            }),
            className: "shrink-0 font-pixel text-stone-200 bg-stone-700/80 dark:bg-stone-900/80 border-4 border-stone-800 rounded px-3 py-3 hover:brightness-125 active:scale-95 transition-all",
            style: { boxShadow: "3px 3px 0 rgba(0,0,0,0.4)" },
            "aria-label": "Scroll right",
            children: "▶"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "p",
        {
          className: "mt-3 font-pixel text-stone-600 dark:text-stone-400 opacity-60",
          style: { fontSize: "8px" },
          children: "← → BEWEGEN  |  ↵ LEVEL STARTEN"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center px-4 py-2 text-stone-600 dark:text-stone-500 font-pixel text-xs", children: [
      /* @__PURE__ */ jsx("span", { children: "Learning Gamification v1.0" }),
      /* @__PURE__ */ jsx("span", { className: "opacity-80", children: "© 2025" })
    ] })
  ] });
}
async function loader$1({
  request: request2
}) {
  const url = new URL(request2.url);
  const themeId = url.searchParams.get("chapter");
  const cookieHeader = request2.headers.get("Cookie");
  if (themeId) {
    const id = parseInt(themeId, 10);
    if (!Number.isNaN(id)) {
      const sets = await apiGetServer(cookieHeader, `/themes/${id}/question-sets`);
      if (sets && sets.length > 0) {
        return {
          levels: questionSetsToLevels(sets)
        };
      }
    }
  }
  const levels = await fetchLevels();
  return {
    levels
  };
}
const levelSelection = UNSAFE_withComponentProps(function LevelSelectionRoute() {
  const {
    levels
  } = useLoaderData();
  return /* @__PURE__ */ jsx(LevelSelection, {
    levels
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: levelSelection,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const einstellungen = UNSAFE_withComponentProps(function Einstellungen() {
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200",
    children: [/* @__PURE__ */ jsx(IngameHeader, {
      siteName: "Einstellungen"
    }), /* @__PURE__ */ jsx("div", {
      className: "flex-1 flex flex-col items-center gap-6 px-4 py-8",
      children: /* @__PURE__ */ jsx(Link, {
        to: "/",
        className: "mt-4 block w-full max-w-md",
        children: /* @__PURE__ */ jsx("button", {
          type: "button",
          className: "menu-button block w-full py-3 px-6 font-pixel text-sm sm:text-base text-stone-200 bg-stone-600 dark:bg-stone-700 border-4 border-stone-800 dark:border-stone-800 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all text-center",
          style: {
            boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), 4px 4px 0 rgba(0,0,0,0.4)"
          },
          children: "← Zurück zum Menü"
        })
      })
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: einstellungen
}, Symbol.toStringTag, { value: "Module" }));
const MOCK_PROGRESS = [{
  chapter: "Kapitel 1",
  title: "Grundlagen",
  levels: 8,
  completed: 8,
  xp: 320
}, {
  chapter: "Kapitel 2",
  title: "Variablen & Typen",
  levels: 6,
  completed: 5,
  xp: 190
}, {
  chapter: "Kapitel 3",
  title: "Kontrollstrukturen",
  levels: 7,
  completed: 2,
  xp: 80
}, {
  chapter: "Kapitel 4",
  title: "Funktionen",
  levels: 5,
  completed: 0,
  xp: 0
}];
const TOTAL_XP = MOCK_PROGRESS.reduce((sum, c) => sum + c.xp, 0);
const TOTAL_LEVELS = MOCK_PROGRESS.reduce((sum, c) => sum + c.levels, 0);
const COMPLETED_LEVELS = MOCK_PROGRESS.reduce((sum, c) => sum + c.completed, 0);
function ProgressBar$1({
  value,
  max
}) {
  const pct = max === 0 ? 0 : Math.round(value / max * 100);
  return /* @__PURE__ */ jsx("div", {
    className: "w-full h-3 rounded bg-stone-900 border-2 border-stone-800 overflow-hidden",
    style: {
      boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.5)"
    },
    children: /* @__PURE__ */ jsx("div", {
      className: "h-full rounded bg-amber-400 transition-all",
      style: {
        width: `${pct}%`,
        boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3)"
      }
    })
  });
}
function NotLoggedIn() {
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-emerald-200 to-emerald-500",
    children: [/* @__PURE__ */ jsx(IngameHeader, {
      siteName: "Fortschritt"
    }), /* @__PURE__ */ jsx("div", {
      className: "flex-1 flex flex-col items-center justify-center gap-5 px-4 py-6",
      children: /* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-md rounded-3xl border-4 border-stone-900 bg-stone-700 dark:bg-stone-800 overflow-hidden",
        style: {
          boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.08), 0 16px 0 rgba(15,23,42,0.85)"
        },
        children: [/* @__PURE__ */ jsx("div", {
          className: "bg-stone-800 dark:bg-stone-900 border-b-4 border-stone-900 px-4 py-3 text-center",
          children: /* @__PURE__ */ jsx("h2", {
            className: "font-pixel text-sm sm:text-base text-amber-100",
            style: {
              textShadow: "2px 2px 0 #0f172a"
            },
            children: "🔒 KEIN ZUGRIFF"
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "px-6 py-8 flex flex-col items-center gap-4 text-center",
          children: [/* @__PURE__ */ jsxs("p", {
            className: "font-pixel text-[10px] sm:text-xs text-stone-300 leading-relaxed",
            style: {
              textShadow: "1px 1px 0 #000"
            },
            children: ["Du musst angemeldet sein,", /* @__PURE__ */ jsx("br", {}), "um deinen Fortschritt", /* @__PURE__ */ jsx("br", {}), "sehen zu können."]
          }), /* @__PURE__ */ jsx(Link, {
            to: "/",
            className: "mt-2 block w-full py-3 px-6 font-pixel text-xs sm:text-sm text-stone-200 bg-amber-700 border-4 border-stone-800 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all text-center",
            style: {
              boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), 4px 4px 0 rgba(0,0,0,0.4)"
            },
            children: "→ Zum Login"
          })]
        })]
      })
    })]
  });
}
const fortschritt = UNSAFE_withComponentProps(function Fortschritt() {
  const {
    loading,
    isAuth
  } = useClientAuth();
  if (loading) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-emerald-200 to-emerald-500",
      children: /* @__PURE__ */ jsx(IngameHeader, {
        siteName: "Fortschritt"
      })
    });
  }
  if (!isAuth) {
    return /* @__PURE__ */ jsx(NotLoggedIn, {});
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-emerald-200 to-emerald-500",
    children: [/* @__PURE__ */ jsx(IngameHeader, {
      siteName: "Fortschritt"
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex-1 flex flex-col items-center gap-5 px-4 py-6 sm:py-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-md rounded-3xl border-4 border-stone-900 bg-stone-700 dark:bg-stone-800 overflow-hidden",
        style: {
          boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.08), 0 16px 0 rgba(15,23,42,0.85)"
        },
        children: [/* @__PURE__ */ jsxs("div", {
          className: "bg-stone-800 dark:bg-stone-900 border-b-4 border-stone-900 px-4 py-3 text-center",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "font-pixel text-sm sm:text-base text-amber-100",
            style: {
              textShadow: "2px 2px 0 #0f172a"
            },
            children: "📊 MEIN FORTSCHRITT"
          }), /* @__PURE__ */ jsx("p", {
            className: "font-pixel text-[8px] sm:text-[9px] text-stone-400 mt-1",
            children: "GESAMT-ÜBERSICHT"
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "grid grid-cols-3 divide-x-2 divide-stone-800 border-b-4 border-stone-800",
          children: [{
            label: "XP",
            value: TOTAL_XP.toLocaleString("de-DE")
          }, {
            label: "Level",
            value: `${COMPLETED_LEVELS}/${TOTAL_LEVELS}`
          }, {
            label: "Kapitel",
            value: `${MOCK_PROGRESS.filter((c) => c.completed === c.levels).length}/${MOCK_PROGRESS.length}`
          }].map(({
            label,
            value
          }) => /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col items-center py-3 px-2 bg-stone-700 dark:bg-stone-800",
            children: [/* @__PURE__ */ jsx("span", {
              className: "font-pixel text-base sm:text-lg text-amber-300",
              style: {
                textShadow: "1px 1px 0 #000"
              },
              children: value
            }), /* @__PURE__ */ jsx("span", {
              className: "font-pixel text-[7px] sm:text-[8px] text-stone-400 uppercase mt-0.5",
              children: label
            })]
          }, label))
        }), /* @__PURE__ */ jsxs("div", {
          className: "px-4 py-3 bg-stone-600 dark:bg-stone-700 border-b-4 border-stone-800",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex justify-between mb-1.5",
            children: [/* @__PURE__ */ jsx("span", {
              className: "font-pixel text-[8px] sm:text-[9px] text-stone-300 uppercase",
              children: "Gesamtfortschritt"
            }), /* @__PURE__ */ jsxs("span", {
              className: "font-pixel text-[8px] sm:text-[9px] text-amber-300",
              children: [Math.round(COMPLETED_LEVELS / TOTAL_LEVELS * 100), "%"]
            })]
          }), /* @__PURE__ */ jsx(ProgressBar$1, {
            value: COMPLETED_LEVELS,
            max: TOTAL_LEVELS
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-md mb-5 rounded-3xl border-4 border-stone-900 bg-stone-700 dark:bg-stone-800 overflow-hidden",
        style: {
          boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.08), 0 16px 0 rgba(15,23,42,0.85)"
        },
        children: [/* @__PURE__ */ jsx("div", {
          className: "bg-stone-800 dark:bg-stone-900 border-b-4 border-stone-900 px-4 py-3 text-center",
          children: /* @__PURE__ */ jsx("h2", {
            className: "font-pixel text-sm sm:text-base text-amber-100",
            style: {
              textShadow: "2px 2px 0 #0f172a"
            },
            children: "📚 KAPITEL"
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-[1fr_80px_56px] sm:grid-cols-[1fr_96px_64px] gap-2 px-4 py-2 bg-stone-600 dark:bg-stone-700 border-b-2 border-stone-800 font-pixel text-[8px] sm:text-[9px] text-stone-400 uppercase tracking-wide",
          children: [/* @__PURE__ */ jsx("span", {
            children: "Kapitel"
          }), /* @__PURE__ */ jsx("span", {
            className: "text-center",
            children: "Level"
          }), /* @__PURE__ */ jsx("span", {
            className: "text-right",
            children: "XP"
          })]
        }), /* @__PURE__ */ jsx("ul", {
          className: "divide-y-2 divide-stone-800 dark:divide-stone-700",
          children: MOCK_PROGRESS.map(({
            chapter,
            title,
            levels,
            completed,
            xp
          }) => {
            const done = completed === levels;
            const started = completed > 0;
            return /* @__PURE__ */ jsxs("li", {
              className: "px-4 py-3 bg-stone-700 odd:bg-stone-600 dark:bg-stone-800 dark:odd:bg-stone-700",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "grid grid-cols-[1fr_80px_56px] sm:grid-cols-[1fr_96px_64px] gap-2 items-center mb-2",
                children: [/* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "font-pixel text-[8px] sm:text-[9px] text-stone-400 block",
                    children: chapter
                  }), /* @__PURE__ */ jsx("span", {
                    className: "font-pixel text-xs sm:text-sm text-stone-100 truncate block",
                    children: title
                  })]
                }), /* @__PURE__ */ jsx("span", {
                  className: "font-pixel text-xs sm:text-sm text-stone-200 text-center",
                  children: done ? /* @__PURE__ */ jsxs("span", {
                    className: "text-emerald-400",
                    children: ["✓ ", levels]
                  }) : `${completed}/${levels}`
                }), /* @__PURE__ */ jsx("span", {
                  className: "font-pixel text-xs sm:text-sm text-amber-300 text-right",
                  children: xp > 0 ? xp.toLocaleString("de-DE") : "—"
                })]
              }), started && /* @__PURE__ */ jsx(ProgressBar$1, {
                value: completed,
                max: levels
              }), !started && /* @__PURE__ */ jsx("div", {
                className: "w-full h-3 rounded bg-stone-900 border-2 border-stone-800",
                style: {
                  boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.5)"
                },
                children: /* @__PURE__ */ jsx("span", {
                  className: "sr-only",
                  children: "Noch nicht begonnen"
                })
              })]
            }, chapter);
          })
        })]
      }), /* @__PURE__ */ jsx(Link, {
        to: "/",
        className: "block w-full max-w-md",
        children: /* @__PURE__ */ jsx("button", {
          type: "button",
          className: "menu-button block w-full py-3 px-6 font-pixel text-sm sm:text-base text-stone-200 bg-stone-600 dark:bg-stone-700 border-4 border-stone-800 dark:border-stone-800 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all text-center",
          style: {
            boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), 4px 4px 0 rgba(0,0,0,0.4)"
          },
          children: "← Zurück zum Menü"
        })
      })]
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: fortschritt
}, Symbol.toStringTag, { value: "Module" }));
const BASE_URL = "http://localhost:8080";
let authToken = null;
function setAuthToken(token) {
  authToken = token;
}
function getAuthToken() {
  return authToken;
}
class ApiError extends Error {
  constructor(status, body) {
    super(body.message);
    this.status = status;
    this.body = body;
    this.name = "ApiError";
  }
}
async function request(method, path, body) {
  const headers = {
    "Content-Type": "application/json"
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== void 0 ? JSON.stringify(body) : void 0
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({
      message: res.statusText
    }));
    throw new ApiError(res.status, err);
  }
  if (res.status === 204) return void 0;
  return res.json();
}
const auth = {
  register(data2) {
    return request("POST", "/auth/register", data2);
  },
  login(data2) {
    return request("POST", "/auth/login", data2);
  },
  me() {
    return request("GET", "/auth/me");
  }
};
const themes = {
  list() {
    return request("GET", "/themes");
  },
  questionSets(themeId) {
    return request("GET", `/themes/${themeId}/question-sets`);
  }
};
const questionSets = {
  questions(questionSetId) {
    return request("GET", `/question-sets/${questionSetId}/questions`);
  }
};
const questions = {
  list(questionSetId) {
    const query = questionSetId !== void 0 ? `?questionSetId=${questionSetId}` : "";
    return request("GET", `/questions${query}`);
  },
  answers(questionId) {
    return request("GET", `/questions/${questionId}/answers`);
  },
  submit(questionId, body) {
    return request("POST", `/questions/${questionId}/submit`, body);
  }
};
const leaderboard = {
  list(limit) {
    const query = limit !== void 0 ? `?limit=${limit}` : "";
    return request("GET", `/leaderboard${query}`);
  }
};
async function loginAndStore(data2) {
  const res = await auth.login(data2);
  setAuthToken(res.token);
  return res;
}
async function registerAndStore(data2) {
  const res = await auth.register(data2);
  setAuthToken(res.token);
  return res;
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ApiError,
  auth,
  getAuthToken,
  leaderboard,
  loginAndStore,
  questionSets,
  questions,
  registerAndStore,
  setAuthToken,
  themes
}, Symbol.toStringTag, { value: "Module" }));
const API_BASE = (typeof process !== "undefined" ? process.env?.BACKEND_URL : void 0) ?? void 0 ?? "http://localhost:8080";
async function fetchLevelData(levelId, cookieHeader) {
  const auth2 = parseAuthFromCookieHeader(cookieHeader ?? null);
  if (auth2?.token) {
    try {
      const query = new URLSearchParams({ questionSetId: String(levelId) }).toString();
      const res = await fetch(`${API_BASE}/questions?${query}`, {
        headers: {
          Authorization: `Bearer ${auth2.token}`,
          Accept: "application/json"
        }
      });
      if (res.ok) {
        const questions2 = await res.json();
        const mockEntry = MOCK_LEVEL_DATA[levelId];
        return {
          questionSetId: levelId,
          title: mockEntry?.title ?? `Level ${levelId}`,
          questions: questions2
        };
      }
    } catch {
    }
  }
  const mock = MOCK_LEVEL_DATA[levelId];
  return mock ? { questionSetId: mock.questionSetId, title: mock.title, questions: mock.questions } : null;
}
const DEFAULT_API_BASE = "http://localhost:8080";
const REQUEST_TIMEOUT_MS = 1e4;
function resolveApiBase() {
  if (typeof window !== "undefined") {
    const runtimeApiBase = window.__API_BASE__;
    if (runtimeApiBase) return runtimeApiBase;
  }
  const serverRuntimeBase = (typeof process !== "undefined" ? process.env?.BACKEND_URL : void 0) ?? void 0;
  return serverRuntimeBase ?? DEFAULT_API_BASE;
}
async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;
  const reqHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers
  };
  if (!skipAuth) {
    const auth2 = getAuthFromCookies();
    if (auth2?.token) {
      reqHeaders["Authorization"] = `Bearer ${auth2.token}`;
    }
  }
  const url = endpoint.startsWith("http") ? endpoint : `${resolveApiBase()}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: reqHeaders,
      signal: controller.signal,
      ...body !== void 0 && { body: JSON.stringify(body) }
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`API request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.message ?? json.error ?? text;
    } catch {
    }
    throw new Error(message || `API error: ${res.status}`);
  }
  const contentType = res.headers.get("Content-Type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return res.text();
}
function buildQuery(params) {
  const entries = Object.entries(params).filter(
    (entry2) => entry2[1] != null
  );
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}
async function getLeaderboard(limit) {
  return apiRequest(`/leaderboard${buildQuery({ limit })}`);
}
async function submitQuestionAnswer(questionId, body) {
  return apiRequest(`/questions/${questionId}/submit`, {
    method: "POST",
    body
  });
}
function getButtonColors(state) {
  const bg = state === "correct" ? COLORS.correctBg : state === "wrong" ? COLORS.wrongBg : state === "missed" ? "#1a1000" : state === "selected" ? COLORS.selectedBg : COLORS.bgMid;
  const borderColor = state === "correct" ? COLORS.correctBorder : state === "wrong" ? COLORS.wrongBorder : state === "missed" ? COLORS.amberDark : state === "selected" ? COLORS.selectedBorder : COLORS.rim2;
  const textColor = state === "correct" ? COLORS.correctText : state === "wrong" ? COLORS.wrongText : state === "missed" ? COLORS.amber : state === "selected" ? COLORS.selectedText : COLORS.textMid;
  const animStyle = state === "correct" ? { animation: "answerCorrect 0.4s ease" } : state === "wrong" ? { animation: "answerWrong 0.4s ease" } : {};
  return { bg, borderColor, textColor, animStyle };
}
const QUESTION_KEYFRAMES = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes answerCorrect {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  @keyframes answerWrong {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-5px); }
    40%     { transform: translateX(5px); }
    60%     { transform: translateX(-3px); }
    80%     { transform: translateX(3px); }
  }
  @keyframes starPop {
    0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
    60%  { transform: scale(1.3) rotate(10deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes snapIn {
    0%   { opacity: 0; transform: scale(0.7); }
    70%  { transform: scale(1.08); }
    100% { opacity: 1; transform: scale(1); }
  }

  .q-pixel        { font-family: 'Press Start 2P', monospace; }
  .q-fade-in      { animation: fadeSlideIn 0.35s ease both; }
  .q-anim-correct { animation: answerCorrect 0.4s ease; }
  .q-anim-wrong   { animation: answerWrong 0.4s ease; }
`;
const COLORS = {
  bgDeep: "#1c1917",
  bgMid: "#292524",
  rim1: "#44403c",
  rim2: "#57534e",
  amber: "#e8b840",
  amberDark: "#b8860b",
  amberLight: "#fcd34d",
  skyBright: "#38bdf8",
  correctBg: "#14532d",
  correctBorder: "#16a34a",
  correctText: "#4ade80",
  wrongBg: "#7f1d1d",
  wrongBorder: "#dc2626",
  wrongText: "#f87171",
  selectedBg: "#0c2a3d",
  selectedBorder: "#0369a1",
  selectedText: "#7dd3fc",
  textBright: "#e7e5e4",
  textMid: "#d6d3d1",
  textDim: "#a8a29e",
  textFaint: "#57534e"
};
const PIXEL_SHADOW = "4px 4px 0 rgba(0,0,0,0.5)";
const INSET_SHADOW = "inset 2px 2px 0 rgba(255,255,255,0.12), inset -2px -2px 0 rgba(0,0,0,0.35)";
function ProgressBar({ current, total }) {
  const pct = (current - 1) / total * 100;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: { width: "100%", display: "flex", alignItems: "center", gap: 10 },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              flex: 1,
              height: 14,
              background: COLORS.bgMid,
              border: `3px solid ${COLORS.rim1}`,
              boxShadow: INSET_SHADOW,
              overflow: "hidden"
            },
            children: /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  width: `${pct}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${COLORS.amberDark}, ${COLORS.amber})`,
                  transition: "width 0.4s ease"
                }
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs(
          "span",
          {
            className: "q-pixel",
            style: { fontSize: 8, color: COLORS.textDim, whiteSpace: "nowrap" },
            children: [
              current - 1,
              "/",
              total
            ]
          }
        )
      ]
    }
  );
}
function QuestionHeader({
  levelNum,
  questionNum,
  totalQuestions
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px 10px",
        borderBottom: `3px solid ${COLORS.rim1}`,
        gap: 14
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          style: { flex: 1, display: "flex", flexDirection: "column", gap: 7 },
          children: [
            /* @__PURE__ */ jsxs(
              "span",
              {
                className: "q-pixel",
                style: { fontSize: 8, color: COLORS.textMid },
                children: [
                  "LEVEL ",
                  levelNum
                ]
              }
            ),
            /* @__PURE__ */ jsx(ProgressBar, { current: questionNum, total: totalQuestions })
          ]
        }
      )
    }
  );
}
function FeedbackBar({
  isCorrect,
  correctText,
  wrongText
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "q-pixel",
      style: {
        padding: "10px 12px",
        fontSize: 8,
        lineHeight: 1.9,
        background: isCorrect ? COLORS.correctBg : COLORS.wrongBg,
        border: `3px solid ${isCorrect ? COLORS.correctBorder : COLORS.wrongBorder}`,
        color: isCorrect ? COLORS.correctText : COLORS.wrongText
      },
      children: isCorrect ? correctText : wrongText
    }
  );
}
function optionLabel$1(index) {
  return index < 26 ? String.fromCharCode(65 + index) : String(index + 1);
}
function OptionButton$1({
  label,
  text,
  state,
  isMulti,
  onClick
}) {
  const { bg, borderColor, textColor, animStyle } = getButtonColors(state);
  const isLocked = state === "correct" || state === "wrong" || state === "missed";
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      style: {
        width: "100%",
        padding: "14px 16px",
        background: bg,
        border: `3px solid ${borderColor}`,
        boxShadow: isLocked ? "none" : PIXEL_SHADOW,
        color: textColor,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 10,
        textAlign: "left",
        cursor: isLocked ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "background 0.15s, border-color 0.15s",
        lineHeight: 1.8,
        ...animStyle
      },
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              minWidth: 26,
              height: 26,
              background: borderColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: bg,
              flexShrink: 0
            },
            children: label
          }
        ),
        isMulti && /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              minWidth: 18,
              height: 18,
              border: `2px solid ${borderColor}`,
              background: state === "selected" || state === "correct" ? borderColor : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: bg,
              flexShrink: 0
            },
            children: state === "selected" || state === "correct" ? "✓" : ""
          }
        ),
        text
      ]
    }
  );
}
function MultipleChoiceQuestion({
  levelNum,
  questionNum,
  totalQuestions,
  data: data2,
  onAnswer,
  onSubmit
}) {
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [revealed, setRevealed] = useState(false);
  const [evaluatedCorrect, setEvaluatedCorrect] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const correctIndices = Array.isArray(data2.correctIndices) ? data2.correctIndices : [];
  const hasLocalCorrectness = correctIndices.length > 0;
  const isMulti = data2.allowsMultiple ?? correctIndices.length > 1;
  const isCorrect = evaluatedCorrect ?? (revealed && hasLocalCorrectness && selected.size === correctIndices.length && correctIndices.every((i) => selected.has(i)));
  function toggleOption(index) {
    if (revealed || isSubmitting) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (isMulti) {
        next.has(index) ? next.delete(index) : next.add(index);
      } else {
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.clear();
          next.add(index);
        }
      }
      return next;
    });
  }
  async function handleConfirm() {
    if (revealed || selected.size === 0 || isSubmitting) return;
    setSubmitError(null);
    const selectedIndices = [...selected];
    let correct = selected.size === correctIndices.length && correctIndices.every((i) => selected.has(i));
    try {
      if (onSubmit) {
        setIsSubmitting(true);
        const submitResult = await onSubmit(selectedIndices);
        if (typeof submitResult === "boolean") {
          correct = submitResult;
        }
      }
      setEvaluatedCorrect(correct);
      setRevealed(true);
      onAnswer(correct);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Antwort konnte nicht gesendet werden."
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  function getState(index) {
    const isCorrectOption = correctIndices.includes(index);
    const wasSelected = selected.has(index);
    if (!revealed) return wasSelected ? "selected" : "idle";
    if (evaluatedCorrect === true) return wasSelected ? "correct" : "idle";
    if (evaluatedCorrect === false) return wasSelected ? "wrong" : "idle";
    if (isCorrectOption && wasSelected) return "correct";
    if (!isCorrectOption && wasSelected) return "wrong";
    if (isCorrectOption && !wasSelected) return "missed";
    return "idle";
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: QUESTION_KEYFRAMES }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          background: COLORS.bgDeep,
          border: `4px solid ${COLORS.rim2}`,
          boxShadow: "6px 6px 0 rgba(0,0,0,0.6)",
          overflow: "hidden",
          animation: "fadeSlideIn 0.35s ease both"
        },
        children: [
          /* @__PURE__ */ jsx(
            QuestionHeader,
            {
              levelNum,
              questionNum,
              totalQuestions
            }
          ),
          /* @__PURE__ */ jsxs("div", { style: { padding: "24px 20px 16px" }, children: [
            isMulti && /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  marginBottom: 16,
                  padding: "10px 14px",
                  background: COLORS.bgMid,
                  border: `2px solid ${COLORS.amber}`,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 8,
                  color: COLORS.amber,
                  lineHeight: 1.8
                },
                children: "★ Mehrere Antworten möglich"
              }
            ),
            /* @__PURE__ */ jsx(
              "p",
              {
                style: {
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 12,
                  color: COLORS.textBright,
                  lineHeight: 2.2,
                  marginBottom: 20
                },
                children: data2.question
              }
            ),
            /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: data2.options.map((option, index) => /* @__PURE__ */ jsx(
              OptionButton$1,
              {
                label: optionLabel$1(index),
                text: option,
                state: getState(index),
                isMulti,
                onClick: () => toggleOption(index)
              },
              index
            )) })
          ] }),
          !revealed && /* @__PURE__ */ jsxs("div", { style: { padding: "0 20px 16px" }, children: [
            submitError && /* @__PURE__ */ jsx(
              "p",
              {
                style: {
                  marginBottom: 10,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 8,
                  color: COLORS.wrongText,
                  lineHeight: 1.8
                },
                children: submitError
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleConfirm,
                disabled: selected.size === 0 || isSubmitting,
                style: {
                  width: "100%",
                  padding: "16px",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 11,
                  background: selected.size > 0 && !isSubmitting ? COLORS.amberDark : COLORS.bgMid,
                  border: `3px solid ${selected.size > 0 && !isSubmitting ? COLORS.amber : COLORS.rim1}`,
                  boxShadow: selected.size > 0 && !isSubmitting ? PIXEL_SHADOW : "none",
                  color: selected.size > 0 && !isSubmitting ? COLORS.amberLight : COLORS.textFaint,
                  cursor: selected.size > 0 && !isSubmitting ? "pointer" : "default",
                  transition: "all 0.15s"
                },
                children: isSubmitting ? "PRÜFE..." : "BESTÄTIGEN ↵"
              }
            )
          ] }),
          revealed && /* @__PURE__ */ jsx("div", { style: { padding: "0 20px 20px" }, children: /* @__PURE__ */ jsx(
            FeedbackBar,
            {
              isCorrect,
              correctText: data2.feedbackCorrect,
              wrongText: data2.feedbackWrong
            }
          ) })
        ]
      }
    )
  ] });
}
function TrueFalseQuestion({
  levelNum,
  questionNum,
  totalQuestions,
  data: data2,
  onAnswer,
  onSubmit
}) {
  const [answer, setAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [evaluatedCorrect, setEvaluatedCorrect] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const isCorrect = evaluatedCorrect ?? (answer !== null && typeof data2.correctAnswer === "boolean" && answer === data2.correctAnswer);
  async function handleAnswer(value) {
    if (revealed || isSubmitting) return;
    setAnswer(value);
    setSubmitError(null);
    const localCorrect = typeof data2.correctAnswer === "boolean" ? value === data2.correctAnswer : false;
    let correct = localCorrect;
    try {
      if (onSubmit) {
        setIsSubmitting(true);
        const submitResult = await onSubmit(value);
        if (typeof submitResult === "boolean") {
          correct = submitResult;
        }
      }
      setEvaluatedCorrect(correct);
      setRevealed(true);
      onAnswer(correct);
    } catch (error) {
      setAnswer(null);
      setSubmitError(
        error instanceof Error ? error.message : "Antwort konnte nicht gesendet werden."
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: QUESTION_KEYFRAMES }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "q-fade-in",
        style: {
          display: "flex",
          flexDirection: "column",
          background: COLORS.bgDeep,
          border: `4px solid ${COLORS.rim2}`,
          boxShadow: "6px 6px 0 rgba(0,0,0,0.6)",
          overflow: "hidden"
        },
        children: [
          /* @__PURE__ */ jsx(
            QuestionHeader,
            {
              levelNum,
              questionNum,
              totalQuestions
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                padding: "20px 16px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 20
              },
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      padding: "18px 16px",
                      background: COLORS.bgMid,
                      border: `3px solid ${COLORS.rim2}`,
                      boxShadow: INSET_SHADOW
                    },
                    children: /* @__PURE__ */ jsx(
                      "p",
                      {
                        className: "q-pixel",
                        style: {
                          fontSize: 10,
                          color: COLORS.textBright,
                          lineHeight: 2.2,
                          margin: 0
                        },
                        children: data2.statement
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
                    children: [true, false].map((value) => {
                      const isWahrButton = value === true;
                      const wasChosen = answer === value;
                      const bg = !revealed ? isWahrButton ? COLORS.correctBg : COLORS.wrongBg : isCorrect && wasChosen ? COLORS.correctBg : !isCorrect && wasChosen ? COLORS.wrongBg : COLORS.bgDeep;
                      const borderColor = !revealed ? isWahrButton ? COLORS.correctBorder : COLORS.wrongBorder : isCorrect && wasChosen ? COLORS.correctBorder : !isCorrect && wasChosen ? COLORS.wrongBorder : COLORS.rim1;
                      const textColor = !revealed ? isWahrButton ? COLORS.correctText : COLORS.wrongText : isCorrect && wasChosen ? COLORS.correctText : !isCorrect && wasChosen ? COLORS.wrongText : COLORS.textFaint;
                      const animClass = revealed && wasChosen ? isCorrect ? " q-anim-correct" : " q-anim-wrong" : "";
                      return /* @__PURE__ */ jsxs(
                        "button",
                        {
                          onClick: () => handleAnswer(value),
                          className: `q-pixel${animClass}`,
                          style: {
                            padding: "22px 12px",
                            background: bg,
                            border: `3px solid ${borderColor}`,
                            boxShadow: revealed ? "none" : PIXEL_SHADOW,
                            color: textColor,
                            fontSize: 13,
                            cursor: revealed || isSubmitting ? "default" : "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 10,
                            transition: "background 0.2s, border-color 0.2s"
                          },
                          children: [
                            /* @__PURE__ */ jsx("span", { style: { fontSize: 24 }, children: isWahrButton ? "✓" : "✗" }),
                            isWahrButton ? "WAHR" : "FALSCH"
                          ]
                        },
                        String(value)
                      );
                    })
                  }
                ),
                submitError && /* @__PURE__ */ jsx(
                  "p",
                  {
                    className: "q-pixel",
                    style: {
                      fontSize: 8,
                      color: COLORS.wrongText,
                      lineHeight: 1.8,
                      margin: 0
                    },
                    children: submitError
                  }
                ),
                revealed && /* @__PURE__ */ jsx(
                  FeedbackBar,
                  {
                    isCorrect,
                    correctText: data2.feedbackCorrect,
                    wrongText: data2.feedbackWrong
                  }
                )
              ]
            }
          )
        ]
      }
    )
  ] });
}
function optionLabel(index) {
  return index < 26 ? String.fromCharCode(65 + index) : String(index + 1);
}
function gapColors(state, hasValue) {
  if (state === "correct")
    return { border: COLORS.correctBorder, text: COLORS.correctText };
  if (state === "wrong")
    return { border: COLORS.wrongBorder, text: COLORS.wrongText };
  if (state === "selected")
    return { border: COLORS.skyBright, text: COLORS.selectedText };
  return {
    border: hasValue ? COLORS.skyBright : COLORS.amber,
    text: "transparent"
  };
}
function OptionButton({
  label,
  text,
  isActive,
  isLocked,
  isCorrect,
  onClick
}) {
  const state = isCorrect === true ? "correct" : isCorrect === false ? "wrong" : isActive ? "selected" : "idle";
  const { bg, borderColor, textColor, animStyle } = getButtonColors(state);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      style: {
        width: "100%",
        padding: "13px 15px",
        background: bg,
        border: `3px solid ${borderColor}`,
        boxShadow: isLocked ? "none" : PIXEL_SHADOW,
        color: textColor,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 10,
        textAlign: "left",
        cursor: isLocked ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "background 0.15s, border-color 0.15s",
        lineHeight: 1.8,
        ...animStyle
      },
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              minWidth: 26,
              height: 26,
              background: borderColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: bg,
              flexShrink: 0
            },
            children: label
          }
        ),
        text
      ]
    }
  );
}
function GapChip({ value, state, isActive, onClick }) {
  const { border, text } = gapColors(state, value !== null);
  const isLocked = state === "correct" || state === "wrong";
  return /* @__PURE__ */ jsx(
    "span",
    {
      onClick: isLocked ? void 0 : onClick,
      style: {
        display: "inline-block",
        minWidth: 80,
        padding: "0 8px",
        borderBottom: `3px solid ${border}`,
        borderTop: isActive ? `1px solid ${border}` : "none",
        color: text,
        fontFamily: "monospace",
        fontSize: 14,
        textAlign: "center",
        cursor: isLocked ? "default" : "pointer",
        background: isActive ? "rgba(56,189,248,0.08)" : "transparent",
        animation: value && state === "idle" ? "snapIn 0.25s ease both" : state === "idle" && !value ? "blink 1s step-end infinite" : "none",
        transition: "border-color 0.2s, color 0.2s",
        verticalAlign: "middle",
        marginBottom: -2,
        userSelect: "none"
      },
      children: value ?? "▮"
    }
  );
}
function GapFillQuestion({
  levelNum,
  questionNum,
  totalQuestions,
  data: data2,
  onAnswer,
  onSubmit
}) {
  const [activeGapId, setActiveGapId] = useState(
    data2.gaps[0]?.gapId ?? 0
  );
  const [gapSelections, setGapSelections] = useState(Object.fromEntries(data2.gaps.map((g) => [g.gapId, null])));
  const [revealed, setRevealed] = useState(false);
  const [evaluatedCorrect, setEvaluatedCorrect] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const activeGap = data2.gaps.find((g) => g.gapId === activeGapId) ?? data2.gaps[0];
  const allFilled = data2.gaps.every((g) => gapSelections[g.gapId] !== null);
  const hasLocalCorrectness = data2.gaps.every((g) => typeof g.correctIndex === "number");
  const isCorrect = evaluatedCorrect ?? (revealed && hasLocalCorrectness && data2.gaps.every((g) => gapSelections[g.gapId] === g.correctIndex));
  function getGapState(gapId) {
    const gap = data2.gaps.find((g) => g.gapId === gapId);
    const selection = gapSelections[gapId];
    if (!revealed) return selection !== null ? "selected" : "idle";
    if (evaluatedCorrect === true) return selection !== null ? "correct" : "idle";
    if (evaluatedCorrect === false) return selection !== null ? "wrong" : "idle";
    if (selection === gap.correctIndex) return "correct";
    return "wrong";
  }
  function handleOptionSelect(optionIndex) {
    if (revealed || isSubmitting) return;
    let nextGapId = null;
    setGapSelections((prev) => {
      const currentSelection = prev[activeGapId];
      const nextSelection = currentSelection === optionIndex ? null : optionIndex;
      const next = { ...prev, [activeGapId]: nextSelection };
      if (nextSelection !== null) {
        const nextEmpty = data2.gaps.find(
          (g) => g.gapId !== activeGapId && next[g.gapId] === null
        );
        if (nextEmpty) nextGapId = nextEmpty.gapId;
      }
      return next;
    });
    if (nextGapId !== null) {
      setActiveGapId(nextGapId);
    }
  }
  async function handleConfirm() {
    if (revealed || !allFilled || isSubmitting) return;
    const filledSelections = gapSelections;
    setSubmitError(null);
    let correct = data2.gaps.every(
      (g) => gapSelections[g.gapId] === g.correctIndex
    );
    try {
      if (onSubmit) {
        setIsSubmitting(true);
        const submitResult = await onSubmit(filledSelections);
        if (typeof submitResult === "boolean") {
          correct = submitResult;
        }
      }
      setEvaluatedCorrect(correct);
      setRevealed(true);
      onAnswer(correct);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Antwort konnte nicht gesendet werden."
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  function getOptionState(optionIndex) {
    const selection = gapSelections[activeGapId];
    if (!revealed)
      return {
        isActive: selection === optionIndex,
        isLocked: false,
        isCorrect: null
      };
    if (evaluatedCorrect === true) {
      return {
        isActive: false,
        isLocked: true,
        isCorrect: selection === optionIndex ? true : null
      };
    }
    if (evaluatedCorrect === false) {
      return {
        isActive: false,
        isLocked: true,
        isCorrect: selection === optionIndex ? false : null
      };
    }
    return {
      isActive: false,
      isLocked: true,
      isCorrect: optionIndex === activeGap.correctIndex ? true : selection === optionIndex ? false : null
    };
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: QUESTION_KEYFRAMES }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          background: COLORS.bgDeep,
          border: `4px solid ${COLORS.rim2}`,
          boxShadow: "6px 6px 0 rgba(0,0,0,0.6)",
          overflow: "hidden",
          animation: "fadeSlideIn 0.35s ease both"
        },
        children: [
          /* @__PURE__ */ jsx(
            QuestionHeader,
            {
              levelNum,
              questionNum,
              totalQuestions
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                padding: "24px 20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 16
              },
              children: [
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: {
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 11,
                      color: COLORS.textBright,
                      lineHeight: 2
                    },
                    children: data2.instruction
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      padding: "16px 18px",
                      background: "#0c0a09",
                      border: `3px solid ${COLORS.rim2}`,
                      boxShadow: INSET_SHADOW,
                      fontFamily: "monospace",
                      fontSize: 14,
                      lineHeight: 2.4,
                      color: COLORS.textDim
                    },
                    children: data2.codeLines.map((line, lineIndex) => /* @__PURE__ */ jsx("div", { children: line.map((token, tokenIndex) => {
                      if (token.type === "text") {
                        return /* @__PURE__ */ jsx(
                          "span",
                          {
                            style: { color: token.color ?? COLORS.textBright },
                            children: token.text
                          },
                          tokenIndex
                        );
                      }
                      const gap = data2.gaps.find((g) => g.gapId === token.gapId);
                      const selection = gapSelections[token.gapId];
                      const gapState = getGapState(token.gapId);
                      const value = selection !== null ? gap.options[selection] : null;
                      return /* @__PURE__ */ jsx(
                        GapChip,
                        {
                          value,
                          state: gapState,
                          isActive: activeGapId === token.gapId && !revealed,
                          onClick: () => setActiveGapId(token.gapId)
                        },
                        tokenIndex
                      );
                    }) }, lineIndex))
                  }
                ),
                data2.gaps.length > 1 && !revealed && /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: data2.gaps.map((g, i) => {
                  const isFilled = gapSelections[g.gapId] !== null;
                  const isSelected = activeGapId === g.gapId;
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setActiveGapId(g.gapId),
                      style: {
                        padding: "8px 14px",
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: 8,
                        background: isSelected ? COLORS.selectedBg : COLORS.bgMid,
                        border: `2px solid ${isSelected ? COLORS.selectedBorder : isFilled ? COLORS.correctBorder : COLORS.rim2}`,
                        color: isSelected ? COLORS.selectedText : isFilled ? COLORS.correctText : COLORS.textDim,
                        cursor: "pointer"
                      },
                      children: [
                        "LÜCKE ",
                        i + 1,
                        " ",
                        isFilled ? "✓" : ""
                      ]
                    },
                    g.gapId
                  );
                }) }),
                /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: activeGap.options.map((option, index) => {
                  const {
                    isActive,
                    isLocked,
                    isCorrect: optIsCorrect
                  } = getOptionState(index);
                  return /* @__PURE__ */ jsx(
                    OptionButton,
                    {
                      label: optionLabel(index),
                      text: option,
                      isActive,
                      isLocked,
                      isCorrect: optIsCorrect,
                      onClick: () => handleOptionSelect(index)
                    },
                    index
                  );
                }) })
              ]
            }
          ),
          !revealed && /* @__PURE__ */ jsxs("div", { style: { padding: "0 20px 16px" }, children: [
            submitError && /* @__PURE__ */ jsx(
              "p",
              {
                style: {
                  marginBottom: 10,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 8,
                  color: COLORS.wrongText,
                  lineHeight: 1.8
                },
                children: submitError
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleConfirm,
                disabled: !allFilled || isSubmitting,
                style: {
                  width: "100%",
                  padding: "16px",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 11,
                  background: allFilled && !isSubmitting ? COLORS.amberDark : COLORS.bgMid,
                  border: `3px solid ${allFilled && !isSubmitting ? COLORS.amber : COLORS.rim1}`,
                  boxShadow: allFilled && !isSubmitting ? PIXEL_SHADOW : "none",
                  color: allFilled && !isSubmitting ? COLORS.amberLight : COLORS.textFaint,
                  cursor: allFilled && !isSubmitting ? "pointer" : "default",
                  transition: "all 0.15s"
                },
                children: isSubmitting ? "PRÜFE..." : allFilled ? "BESTÄTIGEN ↵" : `NOCH ${data2.gaps.filter((g) => gapSelections[g.gapId] === null).length} LÜCKE(N) OFFEN`
              }
            )
          ] }),
          revealed && /* @__PURE__ */ jsx("div", { style: { padding: "0 20px 20px" }, children: /* @__PURE__ */ jsx(
            FeedbackBar,
            {
              isCorrect,
              correctText: data2.feedbackCorrect,
              wrongText: data2.feedbackWrong
            }
          ) })
        ]
      }
    )
  ] });
}
const GAP_PLACEHOLDER_REGEX = /(\{\{\s*gap\s*\}\}|\[\[\s*gap\s*\]\]|___+|\[l[üu]cke\]|\[gap\])/gi;
const GAP_PLACEHOLDER_TOKEN_REGEX = /^(\{\{\s*gap\s*\}\}|\[\[\s*gap\s*\]\]|___+|\[l[üu]cke\]|\[gap\])$/i;
function buildGapCodeLines(sortedGaps, startText, endText) {
  const hasGapContextText = sortedGaps.some(
    (gap) => typeof gap.textBefore === "string" || typeof gap.textAfter === "string"
  );
  if (hasGapContextText) {
    const codeLines = [[]];
    const appendText = (text) => {
      if (!text) return;
      const parts = text.split(/\r?\n/);
      parts.forEach((part, index) => {
        if (index > 0) codeLines.push([]);
        if (part) {
          codeLines[codeLines.length - 1].push({ type: "text", text: part });
        }
      });
    };
    sortedGaps.forEach((gap, index) => {
      appendText(gap.textBefore);
      codeLines[codeLines.length - 1].push({ type: "gap", gapId: gap.gapId });
      appendText(gap.textAfter);
      if (index < sortedGaps.length - 1) {
        const lastLine = codeLines[codeLines.length - 1];
        const lastToken = lastLine[lastLine.length - 1];
        if (lastToken?.type === "text" && !/\s$/.test(lastToken.text)) {
          lastLine.push({ type: "text", text: " " });
        }
      }
    });
    return codeLines.filter((line) => line.length > 0);
  }
  const baseText = [startText, endText].filter(Boolean).join(" ").trim();
  if (baseText.length > 0) {
    const lines = baseText.split(/\r?\n/);
    let nextGapIndex = 0;
    let usedPlaceholder = false;
    const codeLines = lines.map((line) => {
      const segments = line.split(GAP_PLACEHOLDER_REGEX);
      const lineTokens = [];
      for (const segment of segments) {
        if (!segment) continue;
        if (GAP_PLACEHOLDER_TOKEN_REGEX.test(segment)) {
          usedPlaceholder = true;
          const gap = sortedGaps[nextGapIndex];
          if (gap) {
            lineTokens.push({ type: "gap", gapId: gap.gapId });
            nextGapIndex += 1;
          } else {
            lineTokens.push({ type: "text", text: segment });
          }
        } else {
          lineTokens.push({ type: "text", text: segment });
        }
      }
      return lineTokens.length > 0 ? lineTokens : [{ type: "text", text: line }];
    });
    if (usedPlaceholder) {
      for (; nextGapIndex < sortedGaps.length; nextGapIndex += 1) {
        const gap = sortedGaps[nextGapIndex];
        codeLines.push([
          { type: "text", text: `Lücke ${gap.gapIndex}: ` },
          { type: "gap", gapId: gap.gapId }
        ]);
      }
      return codeLines;
    }
  }
  const fallbackLine = [];
  sortedGaps.forEach((gap, index) => {
    if (index > 0) fallbackLine.push({ type: "text", text: "   " });
    fallbackLine.push({ type: "text", text: `Lücke ${gap.gapIndex}: ` });
    fallbackLine.push({ type: "gap", gapId: gap.gapId });
  });
  return fallbackLine.length > 0 ? [fallbackLine] : [];
}
function ResultScreen({
  title,
  correctCount,
  total,
  chapterId
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        padding: "40px 24px",
        background: "#1e293b",
        border: "4px solid #334155",
        boxShadow: "6px 6px 0 rgba(0,0,0,0.6)",
        color: "#f8fafc",
        fontFamily: "'Press Start 2P', monospace",
        textAlign: "center"
      },
      children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: 10, color: "#94a3b8" }, children: "LEVEL ABGESCHLOSSEN" }),
        /* @__PURE__ */ jsx("h2", { style: { fontSize: 14, margin: 0 }, children: title }),
        /* @__PURE__ */ jsxs("p", { style: { fontSize: 9, color: "#94a3b8", lineHeight: 2 }, children: [
          correctCount,
          " / ",
          total,
          " RICHTIG"
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center"
            },
            children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: chapterId ? `/level-selection?chapter=${chapterId}` : "/level-selection",
                  style: {
                    padding: "10px 18px",
                    background: "#0f172a",
                    border: "3px solid #334155",
                    color: "#94a3b8",
                    fontSize: 8,
                    textDecoration: "none",
                    boxShadow: "3px 3px 0 rgba(0,0,0,0.5)"
                  },
                  children: "← ZURÜCK"
                }
              ),
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: chapterId ? `/level-selection?chapter=${chapterId}` : "/level-selection",
                  style: {
                    padding: "10px 18px",
                    background: "#166534",
                    border: "3px solid #15803d",
                    color: "#bbf7d0",
                    fontSize: 8,
                    textDecoration: "none",
                    boxShadow: "3px 3px 0 rgba(0,0,0,0.5)"
                  },
                  children: "NÄCHSTES LEVEL →"
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function resolveTrueFalseAnswerId(question, selectedIsTrue) {
  const sorted = [...question.mcAnswers].sort((a, b) => a.optionOrder - b.optionOrder);
  const normalize = (value) => value.trim().toLowerCase();
  const trueCandidate = sorted.find((answer) => {
    const text = normalize(answer.optionText);
    return text === "true" || text === "wahr";
  });
  const falseCandidate = sorted.find((answer) => {
    const text = normalize(answer.optionText);
    return text === "false" || text === "falsch";
  });
  const fallbackTrue = sorted[0];
  const fallbackFalse = sorted.find((answer) => answer.answerId !== fallbackTrue?.answerId);
  const selectedAnswer = selectedIsTrue ? trueCandidate ?? fallbackTrue : falseCandidate ?? fallbackFalse;
  return selectedAnswer?.answerId ?? null;
}
function Level({ questionSetId, title, chapterTitle, chapterId = "", questionList }) {
  const total = questionList.length;
  const [state, setState] = useState({
    phase: "question",
    currentIndex: 0,
    correctCount: 0
  });
  function advance(isCorrect) {
    if (state.phase !== "question") return;
    const newCorrectCount = state.correctCount + (isCorrect ? 1 : 0);
    const nextIndex = state.currentIndex + 1;
    setTimeout(() => {
      if (nextIndex >= total) {
        setState({ phase: "result", correctCount: newCorrectCount, total });
      } else {
        setState({
          phase: "question",
          currentIndex: nextIndex,
          correctCount: newCorrectCount
        });
      }
    }, 1200);
  }
  function renderQuestion(q) {
    const shared = {
      levelNum: questionSetId,
      questionNum: state.phase === "question" ? state.currentIndex + 1 : 1,
      totalQuestions: total,
      onAnswer: (isCorrect) => advance(isCorrect)
    };
    switch (q.questionType) {
      case "MC": {
        const sorted = [...q.mcAnswers].sort(
          (a, b) => a.optionOrder - b.optionOrder
        );
        return /* @__PURE__ */ jsx(
          MultipleChoiceQuestion,
          {
            ...shared,
            data: {
              question: q.startText ?? "",
              options: sorted.map((a) => a.optionText),
              allowsMultiple: q.allowsMultiple,
              correctIndices: [],
              feedbackCorrect: "✓ RICHTIG!",
              feedbackWrong: "✗ FALSCH!"
            },
            onSubmit: async (selectedIndices) => {
              const selectedAnswerIds = selectedIndices.map((index) => sorted[index]?.answerId).filter((answerId) => typeof answerId === "number");
              const result = await submitQuestionAnswer(q.questionId, {
                selectedAnswerIds
              });
              return result.isCorrect;
            }
          },
          q.questionId
        );
      }
      case "TF": {
        return /* @__PURE__ */ jsx(
          TrueFalseQuestion,
          {
            ...shared,
            data: {
              statement: q.startText ?? "",
              feedbackCorrect: "✓ RICHTIG!",
              feedbackWrong: "✗ FALSCH!"
            },
            onSubmit: async (selectedIsTrue) => {
              const selectedAnswerId = resolveTrueFalseAnswerId(q, selectedIsTrue);
              if (selectedAnswerId === null) {
                throw new Error("Die Wahr/Falsch-Antworten sind nicht korrekt konfiguriert.");
              }
              const result = await submitQuestionAnswer(q.questionId, {
                selectedAnswerIds: [selectedAnswerId]
              });
              return result.isCorrect;
            }
          },
          q.questionId
        );
      }
      case "GAP": {
        const sortedGaps = [...q.gapFields].sort(
          (a, b) => a.gapIndex - b.gapIndex
        );
        const codeLines = buildGapCodeLines(sortedGaps, q.startText, q.endText);
        const gaps = sortedGaps.map((gf) => {
          const opts = [...gf.options].sort(
            (a, b) => a.optionOrder - b.optionOrder
          );
          return {
            gapId: gf.gapId,
            options: opts.map((o) => o.optionText)
          };
        });
        return /* @__PURE__ */ jsx(
          GapFillQuestion,
          {
            ...shared,
            data: {
              instruction: q.startText ?? "",
              codeLines,
              gaps,
              feedbackCorrect: "✓ RICHTIG!",
              feedbackWrong: "✗ FALSCH!"
            },
            onSubmit: async (gapSelections) => {
              const gapAnswers = sortedGaps.map((gapField) => {
                const sortedOptions = [...gapField.options].sort(
                  (a, b) => a.optionOrder - b.optionOrder
                );
                const selectedIndex = gapSelections[gapField.gapId];
                const selectedOption = sortedOptions[selectedIndex];
                if (!selectedOption) {
                  throw new Error("Bitte alle Lücken auswählen.");
                }
                return {
                  gapId: gapField.gapId,
                  selectedOptionId: selectedOption.gapOptionId
                };
              });
              const result = await submitQuestionAnswer(q.questionId, {
                gapAnswers
              });
              return result.isCorrect;
            }
          },
          q.questionId
        );
      }
      default: {
        const _exhaustive = q.questionType;
        console.warn("Unbekannter questionType:", _exhaustive);
        return null;
      }
    }
  }
  return /* @__PURE__ */ jsxs(
    "main",
    {
      style: {
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #bae6fd, #bbf7d0)",
        display: "flex",
        flexDirection: "column"
      },
      children: [
        /* @__PURE__ */ jsx(
          IngameHeader,
          {
            siteName: chapterTitle ? `${chapterTitle} - Level ${questionSetId}` : title,
            backTo: chapterId ? `/level-selection?chapter=${chapterId}` : "/level-selection",
            backLabel: "LEVEL AUSWAHL"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24
            },
            children: /* @__PURE__ */ jsx("div", { style: { width: "100%", maxWidth: 480 }, children: state.phase === "question" ? renderQuestion(questionList[state.currentIndex]) : /* @__PURE__ */ jsx(
              ResultScreen,
              {
                title,
                correctCount: state.correctCount,
                total: state.total,
                chapterId
              }
            ) })
          }
        )
      ]
    }
  );
}
async function loader({
  params,
  request: request2
}) {
  const levelId = Number(params.id);
  if (Number.isNaN(levelId)) {
    throw redirect("/level-selection");
  }
  const levelData = await fetchLevelData(levelId, request2.headers.get("Cookie"));
  if (!levelData) {
    throw data("Level nicht gefunden", {
      status: 404
    });
  }
  const url = new URL(request2.url);
  const chapterTitle = url.searchParams.get("chapterTitle") ?? "";
  const chapterId = url.searchParams.get("chapter") ?? "";
  return {
    levelData,
    chapterTitle,
    chapterId
  };
}
const level_$id = UNSAFE_withComponentProps(function LevelRoute() {
  const {
    levelData,
    chapterTitle,
    chapterId
  } = useLoaderData();
  return /* @__PURE__ */ jsx(Level, {
    questionSetId: levelData.questionSetId,
    title: levelData.title,
    chapterTitle,
    chapterId,
    questionList: levelData.questions
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: level_$id,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const RANK_ICONS = {
  1: "🥇",
  2: "🥈",
  3: "🥉"
};
const rangliste = UNSAFE_withComponentProps(function Rangliste() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLeaderboard().then((data2) => {
      if (!cancelled) setEntries(data2);
    }).catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Fehler beim Laden");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-emerald-200 to-emerald-500",
    children: [/* @__PURE__ */ jsx(IngameHeader, {
      siteName: "Rangliste"
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex-1 flex flex-col items-center gap-5 px-4 py-6 sm:py-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-md mb-5 rounded-3xl border-4 border-stone-900 bg-stone-700 dark:bg-stone-800 shadow-[0_16px_0_rgba(15,23,42,0.85)] overflow-hidden",
        style: {
          boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.08), 0 16px 0 rgba(15,23,42,0.85)"
        },
        children: [/* @__PURE__ */ jsxs("div", {
          className: "bg-stone-800 dark:bg-stone-900 border-b-4 border-stone-900 px-4 py-3 text-center",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "font-pixel text-sm sm:text-base text-amber-100",
            style: {
              textShadow: "2px 2px 0 #0f172a"
            },
            children: "🏆 TOP SPIELER"
          }), /* @__PURE__ */ jsx("p", {
            className: "font-pixel text-[8px] sm:text-[9px] text-stone-400 mt-1",
            children: "NACH PUNKTEN"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-[56px_1fr_72px] sm:grid-cols-[64px_1fr_80px] gap-2 px-4 py-2 bg-stone-600 dark:bg-stone-700 border-b-2 border-stone-800 font-pixel text-[8px] sm:text-[9px] text-stone-400 uppercase tracking-wide",
          children: [/* @__PURE__ */ jsx("span", {
            children: "#"
          }), /* @__PURE__ */ jsx("span", {
            children: "Name"
          }), /* @__PURE__ */ jsx("span", {
            className: "text-right",
            children: "Punkte"
          })]
        }), /* @__PURE__ */ jsxs("ul", {
          className: "divide-y-2 divide-stone-800 dark:divide-stone-700",
          children: [loading && /* @__PURE__ */ jsx("li", {
            className: "px-4 py-6 text-center font-pixel text-sm text-stone-400",
            children: "Lade Rangliste…"
          }), error && /* @__PURE__ */ jsx("li", {
            className: "px-4 py-6 text-center font-pixel text-sm text-amber-200",
            children: error
          }), !loading && !error && entries.length === 0 && /* @__PURE__ */ jsx("li", {
            className: "px-4 py-6 text-center font-pixel text-sm text-stone-400",
            children: "Noch keine Einträge."
          }), !loading && !error && entries.map(({
            rank,
            userId,
            userName,
            points,
            currentUser
          }) => /* @__PURE__ */ jsxs("li", {
            className: `grid grid-cols-[56px_1fr_72px] sm:grid-cols-[64px_1fr_80px] gap-2 px-4 py-2.5 sm:py-3 items-center border-l-4 transition-colors ${currentUser ? "bg-amber-900/50 border-amber-400 dark:bg-amber-900/40" : "bg-stone-700 odd:bg-stone-600 dark:bg-stone-800 dark:odd:bg-stone-700 border-transparent hover:bg-amber-900/40"}`,
            children: [/* @__PURE__ */ jsx("span", {
              className: "font-pixel text-sm sm:text-base text-stone-200 flex items-center gap-1",
              children: RANK_ICONS[rank] ?? rank
            }), /* @__PURE__ */ jsxs("span", {
              className: "font-pixel text-xs sm:text-sm text-stone-100 truncate",
              children: [userName, currentUser && /* @__PURE__ */ jsx("span", {
                className: "ml-1 text-amber-300",
                "aria-hidden": "true",
                children: "(du)"
              })]
            }), /* @__PURE__ */ jsx("span", {
              className: "font-pixel text-xs sm:text-sm text-amber-300 text-right",
              children: points.toLocaleString("de-DE")
            })]
          }, userId))]
        })]
      }), /* @__PURE__ */ jsx(Link, {
        to: "/",
        className: "mt-6 block w-full max-w-md",
        children: /* @__PURE__ */ jsx("button", {
          type: "button",
          className: "menu-button block w-full py-3 px-6 font-pixel text-sm sm:text-base text-stone-200 bg-stone-600 dark:bg-stone-700 border-4 border-stone-800 dark:border-stone-800 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all text-center",
          style: {
            boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), 4px 4px 0 rgba(0,0,0,0.4)"
          },
          children: "← Zurück zum Menü"
        })
      })]
    })]
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: rangliste
}, Symbol.toStringTag, { value: "Module" }));
function asyncPipe(...fns) {
  if (fns.length === 0) return () => Promise.resolve();
  return (x) => fns.reduce(async (y, function_) => function_(await y), x);
}
const fetchFunction = async ({
  url,
  method,
  body,
  request: request2
}) => {
  const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");
  const isGetOrHead = method.toUpperCase() === "GET" || method.toUpperCase() === "HEAD";
  const fetchOptions = {
    method,
    headers: {}
  };
  if (!isGetOrHead && body) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      "Content-Type": "application/json"
    };
    fetchOptions.body = JSON.stringify(body);
  }
  const response = await fetch(`${BACKEND_URL}${url}`, fetchOptions);
  const responseData = await response.json().catch(() => ({}));
  console.log({ responseData });
  if (!response.ok) {
    const errorMessage = responseData?.message || responseData?.error?.message || response.statusText;
    const error = new Error(
      `Ein Fehler ist aufgetreten: ${errorMessage}, ${response.status}`
    );
    error.status = response.status;
    error.responseData = responseData;
    throw error;
  }
  return { response: responseData };
};
const COOKIE_TOKEN = "auth_token";
const COOKIE_USER_ID = "auth_user_id";
const COOKIE_USER_NAME = "auth_user_name";
const COOKIE_GUEST = "auth_guest";
const COOKIE_MAX_AGE_DAYS = 7;
function buildSetCookie(name, value) {
  const maxAgeSeconds = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  return `${name}=${encodeURIComponent(value)}; path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}
function buildDeleteCookie(name) {
  return `${name}=; path=/; Max-Age=0; SameSite=Lax`;
}
function setCookieFunction({
  token,
  userId,
  userName
}) {
  const headers = new Headers();
  headers.append("Set-Cookie", buildSetCookie(COOKIE_TOKEN, token));
  headers.append("Set-Cookie", buildSetCookie(COOKIE_USER_ID, String(userId)));
  headers.append("Set-Cookie", buildSetCookie(COOKIE_USER_NAME, userName));
  headers.append("Set-Cookie", buildDeleteCookie(COOKIE_GUEST));
  return headers;
}
const withRegisterData = async ({ request: request2 }) => {
  const formData = await request2.formData();
  return { request: request2, formData };
};
const withLoginData = withRegisterData;
async function routeByIntent({ request: request2, formData }, intent) {
  const userNameRaw = formData.get("userName");
  const passwordRaw = formData.get("password");
  if (typeof userNameRaw !== "string" || userNameRaw.trim().length === 0) {
    return data(
      { success: false, error: "Benutzername ist erforderlich", intent },
      { status: 400 }
    );
  }
  if (typeof passwordRaw !== "string" || passwordRaw.length === 0) {
    return data(
      { success: false, error: "Passwort ist erforderlich", intent },
      { status: 400 }
    );
  }
  const intentFromForm = formData.get("intent");
  if (intentFromForm !== intent) {
    return data(
      {
        success: false,
        error: "Ungültige Anfrage",
        intent: String(intentFromForm ?? "")
      },
      { status: 400 }
    );
  }
  try {
    const url = intent === "register" ? "/auth/register" : "/auth/login";
    const result = await fetchFunction({
      url,
      method: "POST",
      body: { userName: userNameRaw.trim(), password: passwordRaw },
      request: request2
    });
    const auth2 = result.response;
    const headers = setCookieFunction({
      token: auth2.token,
      userId: auth2.userId,
      userName: auth2.userName
    });
    throw redirect("/chapter-selection", { headers });
  } catch (err) {
    if (err instanceof Response) throw err;
    const errorMessage = err instanceof Error ? err.message : intent === "register" ? "Registrierung fehlgeschlagen" : "Anmeldung fehlgeschlagen";
    const status = typeof err?.status === "number" ? err.status : 400;
    return data({ success: false, error: errorMessage, intent }, { status });
  }
}
const routeByAuthIntent = async ({
  request: request2,
  formData
}) => {
  const intent = formData.get("intent");
  if (intent !== "register" && intent !== "login") {
    return data(
      {
        success: false,
        error: "Ungültige Anfrage",
        intent: String(intent ?? "")
      },
      { status: 400 }
    );
  }
  return routeByIntent({ request: request2, formData }, intent);
};
const routeByRegisterIntent = (args) => routeByIntent(args, "register");
const routeByLoginIntent = (args) => routeByIntent(args, "login");
const action$2 = asyncPipe(withRegisterData, routeByRegisterIntent);
const register = UNSAFE_withComponentProps(function Register() {
  const actionData = useActionData();
  const error = actionData?.success === false && actionData.intent === "register" ? actionData.error ?? null : null;
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200",
    children: /* @__PURE__ */ jsx("div", {
      className: "flex-1 flex flex-col items-center justify-center px-4 py-8",
      children: /* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-md font-pixel",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "mb-6 flex items-center justify-between gap-4",
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-stone-800 dark:text-stone-100 text-2xl font-semibold",
            children: "Registrieren"
          }), /* @__PURE__ */ jsx(Link, {
            to: "/",
            className: "text-amber-700 dark:text-amber-300 underline",
            children: "← Menü"
          })]
        }), /* @__PURE__ */ jsxs(Form, {
          method: "post",
          action: "/register",
          className: "flex flex-col gap-4",
          children: [/* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "intent",
            value: "register"
          }), /* @__PURE__ */ jsxs("label", {
            className: "flex flex-col gap-1",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-sm text-stone-700 dark:text-stone-300",
              children: "Benutzername"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              name: "userName",
              required: true,
              className: "w-full px-3 py-2 border-2 border-stone-400 dark:border-stone-500 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100",
              placeholder: "deinname",
              autoComplete: "username"
            })]
          }), /* @__PURE__ */ jsxs("label", {
            className: "flex flex-col gap-1",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-sm text-stone-700 dark:text-stone-300",
              children: "Passwort"
            }), /* @__PURE__ */ jsx("input", {
              type: "password",
              name: "password",
              required: true,
              className: "w-full px-3 py-2 border-2 border-stone-400 dark:border-stone-500 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100",
              placeholder: "••••••••",
              autoComplete: "new-password"
            })]
          }), error && /* @__PURE__ */ jsx("p", {
            className: "text-sm text-red-600 dark:text-red-400",
            role: "alert",
            children: error
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap gap-3 items-center justify-between pt-2",
            children: [/* @__PURE__ */ jsxs("p", {
              className: "text-xs text-stone-600 dark:text-stone-400",
              children: ["Bereits Konto?", " ", /* @__PURE__ */ jsx(Link, {
                to: "/login",
                className: "underline text-amber-600 dark:text-amber-400 hover:no-underline",
                children: "Anmelden"
              })]
            }), /* @__PURE__ */ jsx("button", {
              type: "submit",
              disabled: loading,
              className: "px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-900 rounded border-2 border-amber-700",
              children: loading ? "…" : "Registrieren"
            })]
          })]
        })]
      })
    })
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: register
}, Symbol.toStringTag, { value: "Module" }));
const SPLASH_TEXTS = [
  "Lernen macht süchtig!",
  "Level up dein Wissen",
  "Auch mal Pause machen!",
  "XP sammeln statt vergessen",
  "Achievement unlocked: Hier gelandet"
];
function randomSplash() {
  return SPLASH_TEXTS[Math.floor(Math.random() * SPLASH_TEXTS.length)];
}
const mainMenuItems = [
  { to: "/chapter-selection", label: "Lernen starten", icon: "▶" },
  { to: "/fortschritt", label: "Fortschritt", icon: "📊" },
  { to: "/rangliste", label: "Rangliste", icon: "🏆" }
];
const buttonClass = "menu-button block w-full py-4 px-6 font-pixel text-base sm:text-lg text-stone-200 bg-stone-600 dark:bg-stone-700 border-4 border-stone-800 dark:border-stone-800 rounded hover:brightness-110 active:scale-[0.98] transition-all text-center";
const buttonStyle = {
  boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.15), 4px 4px 0 rgba(0,0,0,0.4)"
};
function Welcome() {
  const [splash, setSplash] = useState(SPLASH_TEXTS[0]);
  const navigate = useNavigate();
  const { isAuth, logout, loginAsGuest } = useClientAuth();
  useEffect(() => {
    setSplash(randomSplash());
  }, []);
  function handleGuestLogin() {
    loginAsGuest(() => navigate("/chapter-selection"));
  }
  return /* @__PURE__ */ jsxs("main", { className: "min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute top-8 right-8 md:top-12 md:right-12 text-amber-600 dark:text-amber-400 font-pixel text-sm md:text-base transform rotate-12 drop-shadow-md select-none",
        style: { textShadow: "2px 2px 0 #000" },
        children: splash
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute top-8 left-8 md:top-12 md:left-12 z-10", children: isAuth ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: logout,
        className: "font-pixel text-sm md:text-base text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors cursor-pointer",
        children: "Abmelden"
      }
    ) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/login",
          className: "font-pixel text-sm md:text-base text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors cursor-pointer text-center",
          children: "Anmelden"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/register",
          className: "font-pixel text-sm md:text-base text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors cursor-pointer text-center",
          children: "Registrieren"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: handleGuestLogin,
          className: "font-pixel text-sm md:text-base text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 py-2 px-3 rounded border-2 border-stone-600 hover:border-amber-500/50 transition-colors cursor-pointer text-center",
          children: "Als Gast fortfahren"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center px-4 py-8 relative", children: [
      /* @__PURE__ */ jsxs("header", { className: "mb-10 md:mb-14 text-center", children: [
        /* @__PURE__ */ jsx(
          "h1",
          {
            className: "font-pixel text-2xl sm:text-3xl md:text-4xl text-stone-800 dark:text-stone-100 tracking-wide",
            style: {
              textShadow: "3px 3px 0 #000, -1px -1px 0 rgba(255,255,255,0.3)"
            },
            children: "LEARNING"
          }
        ),
        /* @__PURE__ */ jsx(
          "p",
          {
            className: "font-pixel text-lg sm:text-xl md:text-2xl text-stone-600 dark:text-stone-300 mt-1",
            style: { textShadow: "2px 2px 0 #000" },
            children: "GAMIFICATION"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "w-full max-w-[320px] space-y-3", children: mainMenuItems.map(
        ({ to, label, icon }) => to === "/chapter-selection" && !isAuth ? /* @__PURE__ */ jsxs(
          Link,
          {
            className: buttonClass,
            style: buttonStyle,
            to: "/login",
            children: [
              /* @__PURE__ */ jsx("span", { className: "mr-2", children: icon }),
              label
            ]
          },
          to
        ) : /* @__PURE__ */ jsxs(
          Link,
          {
            to,
            className: buttonClass,
            style: buttonStyle,
            children: [
              /* @__PURE__ */ jsx("span", { className: "mr-2", children: icon }),
              label
            ]
          },
          to
        )
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center px-4 py-2 text-stone-600 dark:text-stone-500 font-pixel text-xs", children: [
      /* @__PURE__ */ jsx("span", { children: "Learning Gamification v1.0" }),
      /* @__PURE__ */ jsx("span", { className: "opacity-80", children: "© 2025" })
    ] })
  ] });
}
const action$1 = asyncPipe(withRegisterData, routeByAuthIntent);
function meta({}) {
  return [{
    title: "Spaß mit Lernquiz!"
  }, {
    name: "description",
    content: "Spaß mit Lernquiz!"
  }];
}
const _index = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx(Welcome, {});
});
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: _index,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const action = asyncPipe(withLoginData, routeByLoginIntent);
const login = UNSAFE_withComponentProps(function Login() {
  const actionData = useActionData();
  const error = actionData?.success === false && actionData.intent === "login" ? actionData.error ?? null : null;
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";
  return /* @__PURE__ */ jsx("div", {
    className: "min-h-screen flex flex-col bg-linear-to-b from-sky-300 via-amber-100 to-emerald-200",
    children: /* @__PURE__ */ jsx("div", {
      className: "flex-1 flex flex-col items-center justify-center px-4 py-8",
      children: /* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-md font-pixel",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "mb-6 flex items-center justify-between gap-4",
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-stone-800 dark:text-stone-100 text-2xl font-semibold",
            children: "Anmelden"
          }), /* @__PURE__ */ jsx(Link, {
            to: "/",
            className: "text-amber-700 dark:text-amber-300 underline",
            children: "← Menü"
          })]
        }), /* @__PURE__ */ jsxs(Form, {
          method: "post",
          action: "/login",
          className: "flex flex-col gap-4",
          children: [/* @__PURE__ */ jsx("input", {
            type: "hidden",
            name: "intent",
            value: "login"
          }), /* @__PURE__ */ jsxs("label", {
            className: "flex flex-col gap-1",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-sm text-stone-700 dark:text-stone-300",
              children: "Benutzername"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              name: "userName",
              required: true,
              className: "w-full px-3 py-2 border-2 border-stone-400 dark:border-stone-500 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100",
              placeholder: "deinname",
              autoComplete: "username"
            })]
          }), /* @__PURE__ */ jsxs("label", {
            className: "flex flex-col gap-1",
            children: [/* @__PURE__ */ jsx("span", {
              className: "text-sm text-stone-700 dark:text-stone-300",
              children: "Passwort"
            }), /* @__PURE__ */ jsx("input", {
              type: "password",
              name: "password",
              required: true,
              className: "w-full px-3 py-2 border-2 border-stone-400 dark:border-stone-500 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100",
              placeholder: "••••••••",
              autoComplete: "current-password"
            })]
          }), error && /* @__PURE__ */ jsx("p", {
            className: "text-sm text-red-600 dark:text-red-400",
            role: "alert",
            children: error
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap gap-3 items-center justify-between pt-2",
            children: [/* @__PURE__ */ jsxs("p", {
              className: "text-xs text-stone-600 dark:text-stone-400",
              children: ["Noch kein Konto?", " ", /* @__PURE__ */ jsx(Link, {
                to: "/register",
                className: "underline text-amber-600 dark:text-amber-400 hover:no-underline",
                children: "Registrieren"
              })]
            }), /* @__PURE__ */ jsx("button", {
              type: "submit",
              disabled: loading,
              className: "px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-900 rounded border-2 border-amber-700",
              children: loading ? "…" : "Anmelden"
            })]
          })]
        })]
      })
    })
  });
});
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: login
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DuOF485a.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-B759MrYk.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js"], "css": ["/assets/root-B8sW6ryh.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/chapter-selection": { "id": "routes/chapter-selection", "parentId": "root", "path": "chapter-selection", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/chapter-selection-eks0r-Al.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js", "/assets/ingame-header-BxJnPAg-.js", "/assets/PlatformSVG-DIQjmj9n.js", "/assets/useClientAuth-qyT9NnyQ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/level-selection": { "id": "routes/level-selection", "parentId": "root", "path": "level-selection", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/level-selection-C5jqG4fV.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js", "/assets/ingame-header-BxJnPAg-.js", "/assets/PlatformSVG-DIQjmj9n.js", "/assets/useClientAuth-qyT9NnyQ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/einstellungen": { "id": "routes/einstellungen", "parentId": "root", "path": "einstellungen", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/einstellungen-DV5mm3cW.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js", "/assets/ingame-header-BxJnPAg-.js", "/assets/useClientAuth-qyT9NnyQ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/fortschritt": { "id": "routes/fortschritt", "parentId": "root", "path": "fortschritt", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/fortschritt-DCIZtHQX.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js", "/assets/ingame-header-BxJnPAg-.js", "/assets/useClientAuth-qyT9NnyQ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/apiClient": { "id": "routes/apiClient", "parentId": "root", "path": "apiClient", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/apiClient-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/level.$id": { "id": "routes/level.$id", "parentId": "root", "path": "level/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/level._id-BgOQN70N.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js", "/assets/ingame-header-BxJnPAg-.js", "/assets/api-CuYuvGDR.js", "/assets/useClientAuth-qyT9NnyQ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/rangliste": { "id": "routes/rangliste", "parentId": "root", "path": "rangliste", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/rangliste-WYR10YBr.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js", "/assets/ingame-header-BxJnPAg-.js", "/assets/api-CuYuvGDR.js", "/assets/useClientAuth-qyT9NnyQ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/register": { "id": "routes/register", "parentId": "root", "path": "register", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/register-BtK4quql.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/_index-DBv3nlKE.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js", "/assets/useClientAuth-qyT9NnyQ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/login-DRPmxo_L.js", "imports": ["/assets/chunk-EPOLDU6W-CH8RbHeL.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-6facff06.js", "version": "6facff06", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/chapter-selection": {
    id: "routes/chapter-selection",
    parentId: "root",
    path: "chapter-selection",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/level-selection": {
    id: "routes/level-selection",
    parentId: "root",
    path: "level-selection",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/einstellungen": {
    id: "routes/einstellungen",
    parentId: "root",
    path: "einstellungen",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/fortschritt": {
    id: "routes/fortschritt",
    parentId: "root",
    path: "fortschritt",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/apiClient": {
    id: "routes/apiClient",
    parentId: "root",
    path: "apiClient",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/level.$id": {
    id: "routes/level.$id",
    parentId: "root",
    path: "level/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/rangliste": {
    id: "routes/rangliste",
    parentId: "root",
    path: "rangliste",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/register": {
    id: "routes/register",
    parentId: "root",
    path: "register",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route9
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
