/* @ds-bundle: {"format":4,"namespace":"DesignSystem_6aea8d","components":[{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"MoodSwatch","sourcePath":"components/brand/MoodSwatch.jsx"},{"name":"Wispy","sourcePath":"components/brand/Wispy.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"GlassCard","sourcePath":"components/core/GlassCard.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Pill","sourcePath":"components/core/Pill.jsx"},{"name":"ProductCard","sourcePath":"components/marketplace/ProductCard.jsx"}],"sourceHashes":{"components/brand/Logo.jsx":"cd395f514eb6","components/brand/MoodSwatch.jsx":"066080d05473","components/brand/Wispy.jsx":"2ff72992f0aa","components/core/Button.jsx":"039dfd778e91","components/core/Eyebrow.jsx":"caa60b5ea60b","components/core/GlassCard.jsx":"aa6821939b8a","components/core/Input.jsx":"80b27145176b","components/core/Pill.jsx":"529e7616ccfd","components/marketplace/ProductCard.jsx":"04a2936d3359"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_6aea8d = window.DesignSystem_6aea8d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Logo — the DaydreamDwelling lockup: a soft cloud mark beside the
 * "Daydream{Dwelling}" wordmark (the second half italic), with the
 * "rooms in the sky" tagline beneath. Use `mark="only"` for just the
 * cloud, or `showTagline={false}` to drop the kicker.
 */
function Logo({
  size = 'md',
  mark = 'lockup',
  showTagline = true,
  inkColor = 'var(--ink)',
  softColor = 'var(--ink-soft)',
  cloudFill = '#ffffff',
  style = {},
  ...rest
}) {
  const scale = {
    sm: 0.82,
    md: 1,
    lg: 1.3
  }[size] || 1;
  const Cloud = /*#__PURE__*/React.createElement("svg", {
    width: 36 * scale,
    height: 26 * scale,
    viewBox: "0 0 80 56",
    "aria-hidden": "true",
    style: {
      filter: 'drop-shadow(0 4px 10px rgba(120,150,200,0.35))'
    }
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "40",
    cy: "32",
    rx: "32",
    ry: "18",
    fill: cloudFill
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "22",
    cy: "28",
    rx: "14",
    ry: "12",
    fill: cloudFill
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "56",
    cy: "26",
    rx: "16",
    ry: "13",
    fill: cloudFill
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "40",
    cy: "20",
    rx: "12",
    ry: "10",
    fill: cloudFill
  }));
  if (mark === 'only') {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: 'inline-flex',
        ...style
      }
    }, rest), Cloud);
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12 * scale,
      ...style
    }
  }, rest), Cloud, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 22 * scale,
      fontWeight: 500,
      color: inkColor,
      lineHeight: 1,
      letterSpacing: '-0.5px'
    }
  }, "Daydream", /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: 'italic',
      fontWeight: 400
    }
  }, "Dwelling")), showTagline && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11 * scale,
      color: softColor,
      marginTop: 3,
      letterSpacing: '1.5px',
      textTransform: 'uppercase'
    }
  }, "rooms in the sky")));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/brand/MoodSwatch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const MOODS = {
  'Dream State': {
    accent: '#7a48cc',
    sky: 'linear-gradient(180deg,#ffe8d0,#e8c8e0 55%,#a890d4)'
  },
  'Golden Hour': {
    accent: '#c87820',
    sky: 'linear-gradient(180deg,#b85a55,#e88a3e 55%,#ffe39a)'
  },
  'Bright Day': {
    accent: '#3a7a4a',
    sky: 'linear-gradient(180deg,#6a98d4,#a8c8e4 55%,#ffe4c0)'
  },
  'Blush Hour': {
    accent: '#c06858',
    sky: 'linear-gradient(180deg,#ffc0b4,#f4b0c0 55%,#c8b8dc)'
  },
  'Coastal Morning': {
    accent: '#1a60b8',
    sky: 'linear-gradient(180deg,#5a8cb8,#a8c4d8 55%,#ffd896)'
  },
  'Moonlight': {
    accent: '#5070c8',
    sky: 'linear-gradient(180deg,#0c1530,#16203f 55%,#2a3868)'
  },
  'Vivid Sunset': {
    accent: '#ffaa3d',
    sky: 'linear-gradient(180deg,#4a5a8c,#a8b8d0 55%,#e8a040)'
  },
  'Neon Nights': {
    accent: '#9828f0',
    sky: 'linear-gradient(180deg,#0c0828,#160e3a 55%,#2a1862)'
  },
  'Greenhouse': {
    accent: '#389848',
    sky: 'linear-gradient(180deg,#a8d896,#e0e8b0 55%,#fff5d0)'
  },
  'Dark Academia': {
    accent: '#b88828',
    sky: 'linear-gradient(180deg,#241608,#3a2810 55%,#5a4018)'
  },
  'Northern Lights': {
    accent: '#01efac',
    sky: 'linear-gradient(180deg,#040814,#0e1830 55%,#163048)'
  }
};

/**
 * MoodSwatch — a tappable "weather" chip. Each room can be lit by any of
 * the brand's moods; this is the picker tile. A round sky-gradient well
 * with the mood label beneath, ringed in the mood accent when active.
 */
function MoodSwatch({
  mood = 'Dream State',
  label,
  active = false,
  onClick,
  style = {},
  ...rest
}) {
  const m = MOODS[mood] || MOODS['Dream State'];
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClick,
    type: "button",
    title: label || mood,
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      padding: 0,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      background: m.sky,
      border: active ? `2.5px solid ${m.accent}` : '2.5px solid rgba(255,255,255,0.7)',
      boxShadow: active ? `0 0 0 4px ${m.accent}33, 0 8px 20px ${m.accent}55` : '0 6px 16px rgba(120,150,200,0.25)',
      transition: 'transform var(--dur-fast) var(--ease-soft), box-shadow var(--dur-fast) var(--ease-soft)',
      transform: active ? 'scale(1.06)' : 'scale(1)',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      fontWeight: active ? 600 : 500,
      color: active ? m.accent : 'var(--ink-soft)',
      whiteSpace: 'nowrap'
    }
  }, label || mood));
}
Object.assign(__ds_scope, { MoodSwatch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/MoodSwatch.jsx", error: String((e && e.message) || e) }); }

// components/brand/Wispy.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Wispy — the brand mascot: a small, soft cloud with a friendly face who
 * lives in the corners of the page. Composited from the painted cloud
 * body PNG with a face overlay. `float` adds a gentle idle bob.
 *
 * Assets ship in /assets/wispy/. When consuming this system from another
 * project, copy that folder and pass updated `bodySrc` / `faceSrc`.
 */
function Wispy({
  width = 220,
  bodySrc = '/assets/wispy/cloud-base.png',
  faceSrc = '/assets/wispy/face-happy.png',
  float = false,
  style = {},
  ...rest
}) {
  const h = Math.round(width * 0.72);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: float ? 'ddd-wispy-float' : undefined,
    style: {
      position: 'relative',
      width,
      height: h,
      pointerEvents: 'none',
      userSelect: 'none',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("img", {
    src: bodySrc,
    alt: "Wispy, the DaydreamDwelling cloud mascot",
    draggable: false,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      filter: 'drop-shadow(0 16px 26px rgba(120,90,160,0.25))'
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: faceSrc,
    alt: "",
    "aria-hidden": "true",
    draggable: false,
    style: {
      position: 'absolute',
      left: '50%',
      top: '54%',
      width: '23%',
      transform: 'translate(-50%, -50%)',
      opacity: 0.92
    }
  }), /*#__PURE__*/React.createElement("style", null, `
        @keyframes dddWispyBob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-7px) } }
        .ddd-wispy-float { animation: dddWispyBob 4s var(--ease-soft, ease-in-out) infinite; }
        @media (prefers-reduced-motion: reduce) { .ddd-wispy-float { animation: none } }
      `));
}
Object.assign(__ds_scope, { Wispy });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Wispy.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the brand's pill-shaped action. Primary is a warm coral fill
 * with a soft glow; secondary is frosted glass; ghost is a hairline outline.
 * Labels are written in lowercase, often with a trailing arrow (→).
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  as = 'button',
  arrow = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '10px 20px',
      fontSize: 13
    },
    md: {
      padding: '14px 28px',
      fontSize: 15
    },
    lg: {
      padding: '16px 32px',
      fontSize: 15
    }
  };
  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.3px',
    borderRadius: 'var(--radius-pill)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: '1.5px solid transparent',
    transition: 'transform var(--dur-fast) var(--ease-soft), box-shadow var(--dur-fast) var(--ease-soft), background var(--dur-fast) var(--ease-soft)',
    textDecoration: 'none',
    lineHeight: 1,
    ...sizes[size]
  };
  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--accent-text)',
      boxShadow: 'var(--shadow-accent)'
    },
    secondary: {
      background: 'var(--glass-strong)',
      color: 'var(--ink)',
      border: '1.5px solid var(--glass-border)',
      WebkitBackdropFilter: 'blur(var(--blur-soft))',
      backdropFilter: 'blur(var(--blur-soft))'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink)',
      border: '1.5px solid rgba(26,42,72,0.22)'
    }
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), children, arrow && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      marginLeft: 2
    }
  }, "\u2192"));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Eyebrow — the small uppercase, coral, letter-spaced kicker that sits
 * above headings. Almost always prefixed with a sparkle (✦, ✧, or ◈).
 */
function Eyebrow({
  children,
  glyph = '✦',
  color,
  align = 'left',
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 600,
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      color: color || 'var(--accent)',
      textAlign: align,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      justifyContent: align === 'center' ? 'center' : 'flex-start',
      ...style
    }
  }, rest), glyph && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, glyph), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/GlassCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * GlassCard — the core surface: a frosted, translucent white panel that
 * blurs the drifting clouds behind it. Generously rounded with a cool,
 * diffuse shadow. Use `tone="soft"` for an airier, more transparent panel.
 */
function GlassCard({
  children,
  tone = 'default',
  radius = 'card',
  style = {},
  ...rest
}) {
  const tones = {
    default: {
      background: 'var(--glass)'
    },
    soft: {
      background: 'var(--glass-soft)'
    },
    strong: {
      background: 'var(--glass-strong)'
    }
  };
  const radii = {
    card: 'var(--radius-card)',
    lg: 'var(--radius-card-lg)',
    sm: 'var(--radius-card-sm)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      ...tones[tone],
      borderRadius: radii[radius],
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-glass)',
      WebkitBackdropFilter: 'blur(var(--blur-glass))',
      backdropFilter: 'blur(var(--blur-glass))',
      padding: 'var(--pad-card)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { GlassCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/GlassCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — a frosted pill text field. Pairs with a Button to form the
 * waitlist / search row. Focus glows coral. Placeholders are lowercase.
 */
function Input({
  shape = 'pill',
  style = {},
  ...rest
}) {
  const radius = shape === 'pill' ? 'var(--radius-pill)' : 'var(--radius-input)';
  return /*#__PURE__*/React.createElement("input", _extends({
    style: {
      padding: '14px 20px',
      borderRadius: radius,
      border: '1.5px solid rgba(120,150,200,0.30)',
      background: 'var(--glass-strong)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-md)',
      color: 'var(--ink)',
      outline: 'none',
      width: '100%',
      transition: 'border-color var(--dur-fast) var(--ease-soft), box-shadow var(--dur-fast) var(--ease-soft)',
      ...style
    },
    onFocus: e => {
      e.target.style.borderColor = 'var(--focus-ring)';
      e.target.style.boxShadow = '0 0 0 3px rgba(255,155,92,0.15)';
    },
    onBlur: e => {
      e.target.style.borderColor = 'rgba(120,150,200,0.30)';
      e.target.style.boxShadow = 'none';
    }
  }, rest));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Pill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Pill — a small rounded chip used for tags, feature markers, and
 * category labels. Default is a soft frosted chip; `tone="accent"`
 * tints it coral; `tone="outline"` is a hairline.
 */
function Pill({
  children,
  tone = 'glass',
  style = {},
  ...rest
}) {
  const tones = {
    glass: {
      background: 'var(--glass-strong)',
      color: 'var(--ink)',
      border: '1px solid var(--glass-border)'
    },
    accent: {
      background: 'rgba(255,155,92,0.16)',
      color: 'var(--accent)',
      border: '1px solid rgba(255,155,92,0.45)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--ink-soft)',
      border: '1px solid rgba(26,42,72,0.18)'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 16px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Pill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Pill.jsx", error: String((e && e.message) || e) }); }

// components/marketplace/ProductCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ProductCard — a marketplace tile for a handmade furniture piece. Image
 * well on top, then seller, title, price (coral), and optional color
 * swatches. Lifts gently on hover. Every item in the shop is real and made
 * by an independent maker, so the seller name is always shown.
 */
function ProductCard({
  title,
  seller = 'Seller',
  price,
  rating,
  image,
  imageBg = 'linear-gradient(180deg,#dbe7f4,#eef4fb)',
  swatches = [],
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--glass)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-card-sm)',
      overflow: 'hidden',
      cursor: 'pointer',
      boxShadow: hover ? 'var(--shadow-card)' : 'var(--shadow-tile)',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'transform var(--dur-fast) var(--ease-soft), box-shadow var(--dur-fast) var(--ease-soft)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 180,
      background: imageBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    loading: "lazy",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 40,
      opacity: 0.25,
      color: 'var(--ink-soft)'
    },
    "aria-hidden": "true"
  }, "\u2726")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--ink-soft)'
    }
  }, seller), rating > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: '#e8a73c'
    }
  }, "\u2605 ", rating)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 6px',
      fontSize: 'var(--text-md)',
      fontWeight: 600,
      color: 'var(--ink)'
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: price == null ? 'var(--ink-soft)' : 'var(--accent)'
    }
  }, price == null ? 'Contact seller' : `$${Number(price).toLocaleString()}`), swatches.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      marginTop: 10
    }
  }, swatches.slice(0, 6).map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: c,
      border: '1px solid rgba(255,255,255,0.6)',
      display: 'inline-block'
    }
  })))));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketplace/ProductCard.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.MoodSwatch = __ds_scope.MoodSwatch;

__ds_ns.Wispy = __ds_scope.Wispy;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.GlassCard = __ds_scope.GlassCard;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Pill = __ds_scope.Pill;

__ds_ns.ProductCard = __ds_scope.ProductCard;

})();
