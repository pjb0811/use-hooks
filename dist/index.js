import {
  useEffect as f,
  useRef as h,
  useCallback as p,
  useState as y,
} from 'react';

const H = (e = !0) => {
    f(() => {
      if (!e) return;
      const t = window.scrollY,
        c = /iPad|iPhone|iPod/.test(navigator.userAgent),
        o = {
          documentElement: {
            overflow: document.documentElement.style.overflow,
            height: document.documentElement.style.height,
            position: document.documentElement.style.position,
            width: document.documentElement.style.width,
          },
          body: {
            overflow: document.body.style.overflow,
            height: document.body.style.height,
            position: document.body.style.position,
            top: document.body.style.top,
            left: document.body.style.left,
            right: document.body.style.right,
            width: document.body.style.width,
            webkitOverflowScrolling: document.body.style.getPropertyValue(
              '-webkit-overflow-scrolling',
            ),
          },
        };
      if (
        ((document.documentElement.style.overflow = 'hidden'),
        (document.documentElement.style.height = '100%'),
        (document.documentElement.style.position = 'fixed'),
        (document.documentElement.style.width = '100%'),
        (document.body.style.overflow = 'hidden'),
        (document.body.style.height = '100%'),
        (document.body.style.position = 'fixed'),
        (document.body.style.top = `-${t}px`),
        (document.body.style.left = '0'),
        (document.body.style.right = '0'),
        (document.body.style.width = '100%'),
        c)
      ) {
        document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');
        const r = i => {
            (i.target === document.body ||
              i.target === document.documentElement ||
              i.target === window) &&
              (i.preventDefault(),
              i.stopPropagation(),
              i.stopImmediatePropagation());
          },
          s = () => {
            (window.scrollTo(0, 0),
              (document.body.scrollTop = 0),
              (document.documentElement.scrollTop = 0));
          },
          n = ['scroll', 'touchmove', 'touchstart', 'touchend'];
        n.forEach(i => {
          (window.addEventListener(i, r, {
            passive: !1,
            capture: !0,
          }),
            document.addEventListener(i, r, {
              passive: !1,
              capture: !0,
            }),
            document.body.addEventListener(i, r, {
              passive: !1,
              capture: !0,
            }));
        });
        const l = setInterval(s, 16);
        return () => {
          (clearInterval(l),
            n.forEach(i => {
              (window.removeEventListener(i, r, { capture: !0 }),
                document.removeEventListener(i, r, { capture: !0 }),
                document.body.removeEventListener(i, r, {
                  capture: !0,
                }));
            }),
            (document.documentElement.style.overflow =
              o.documentElement.overflow),
            (document.documentElement.style.height = o.documentElement.height),
            (document.documentElement.style.position =
              o.documentElement.position),
            (document.documentElement.style.width = o.documentElement.width),
            (document.body.style.overflow = o.body.overflow),
            (document.body.style.height = o.body.height),
            (document.body.style.position = o.body.position),
            (document.body.style.top = o.body.top),
            (document.body.style.left = o.body.left),
            (document.body.style.right = o.body.right),
            (document.body.style.width = o.body.width),
            o.body.webkitOverflowScrolling
              ? document.body.style.setProperty(
                  '-webkit-overflow-scrolling',
                  o.body.webkitOverflowScrolling,
                )
              : document.body.style.removeProperty(
                  '-webkit-overflow-scrolling',
                ),
            window.scrollTo(0, t));
        };
      }
      return () => {
        ((document.documentElement.style.overflow = o.documentElement.overflow),
          (document.documentElement.style.height = o.documentElement.height),
          (document.documentElement.style.position =
            o.documentElement.position),
          (document.documentElement.style.width = o.documentElement.width),
          (document.body.style.overflow = o.body.overflow),
          (document.body.style.height = o.body.height),
          (document.body.style.position = o.body.position),
          (document.body.style.top = o.body.top),
          (document.body.style.left = o.body.left),
          (document.body.style.right = o.body.right),
          (document.body.style.width = o.body.width),
          window.scrollTo(0, t));
      };
    }, [e]);
  },
  P = e => {
    const [t, c] = y(null);
    return (
      f(() => {
        const o = n =>
            typeof n == 'string' ? document.querySelector(n) : n.current,
          r = () => {
            const n = o(e);
            c(n ? n.getBoundingClientRect() : null);
          },
          s = () => {
            requestAnimationFrame(r);
          };
        return (
          r(),
          window.addEventListener('scroll', s, { passive: !0 }),
          window.addEventListener('resize', s, { passive: !0 }),
          () => {
            (window.removeEventListener('scroll', s),
              window.removeEventListener('resize', s));
          }
        );
      }, [e]),
      t
    );
  };
function T(e, t) {
  t === void 0 && (t = 0);
  var c = h(!1),
    o = h(),
    r = h(e),
    s = p(function () {
      return c.current;
    }, []),
    n = p(
      function () {
        ((c.current = !1),
          o.current && clearTimeout(o.current),
          (o.current = setTimeout(function () {
            ((c.current = !0), r.current());
          }, t)));
      },
      [t],
    ),
    l = p(function () {
      ((c.current = null), o.current && clearTimeout(o.current));
    }, []);
  return (
    f(
      function () {
        r.current = e;
      },
      [e],
    ),
    f(
      function () {
        return (n(), l);
      },
      [t],
    ),
    [s, l, n]
  );
}
function S(e, t, c) {
  (t === void 0 && (t = 0), c === void 0 && (c = []));
  var o = T(e, t),
    r = o[0],
    s = o[1],
    n = o[2];
  return (f(n, c), [r, s]);
}
const w = {
    // < 640px
    sm: 640,
    // >= 640px
    md: 768,
    // >= 768px
    lg: 1024,
    // >= 1024px
    xl: 1280,
    // >= 1280px
    '2xl': 1536,
    // >= 1536px
  },
  x = e => {
    let t = 'xs';
    return (
      e >= w['2xl']
        ? (t = '2xl')
        : e >= w.xl
          ? (t = 'xl')
          : e >= w.lg
            ? (t = 'lg')
            : e >= w.md
              ? (t = 'md')
              : e >= w.sm
                ? (t = 'sm')
                : (t = 'xs'),
      {
        current: t,
        xs: e < w.sm,
        sm: e >= w.sm && e < w.md,
        md: e >= w.md && e < w.lg,
        lg: e >= w.lg && e < w.xl,
        xl: e >= w.xl && e < w['2xl'],
        '2xl': e >= w['2xl'],
      }
    );
  },
  I = (e = 200) => {
    const [t, c] = y({ width: 0, height: 0 }),
      [o, r] = y({
        current: 'xs',
        xs: !0,
        sm: !1,
        md: !1,
        lg: !1,
        xl: !1,
        '2xl': !1,
      }),
      [s, n] = y({ width: 0, height: 0 }),
      l = h(null),
      i = h(null);
    return (
      S(
        () => {
          n(t);
        },
        e,
        [t],
      ),
      f(() => {
        const u = () => {
            const d = l.current ?? document.body;
            if (!d) return;
            const { offsetWidth: v, offsetHeight: b } = d;
            (c(g =>
              g.width !== v || g.height !== b ? { width: v, height: b } : g,
            ),
              r(g => {
                const E = x(v);
                return g.current !== E.current ? E : g;
              }));
          },
          a = () => {
            const d = l.current ?? document.body;
            d &&
              (u(),
              i.current && i.current.disconnect(),
              (i.current = new ResizeObserver(() => {
                requestAnimationFrame(() => {
                  u();
                });
              })),
              i.current.observe(d));
          },
          m = () => {
            i.current && (i.current.disconnect(), (i.current = null));
          };
        return (
          a(),
          () => {
            m();
          }
        );
      }, []),
      {
        size: s,
        breakpoint: o,
        ref: l,
      }
    );
  },
  R = e => {
    const [t, c] = y(!0),
      [o, r] = y();
    return (
      f(() => {
        if (!e) {
          c(!1);
          return;
        }
        const s = new Image();
        ((s.src = e),
          (s.onload = () => c(!1)),
          (s.onerror = n => {
            (c(!1), r(n));
          }));
      }, [e]),
      {
        loading: t,
        error: o,
      }
    );
  };
function A(e, t) {
  const c = h(t),
    [o, r] = y(() => {
      if (typeof window > 'u') return t;
      try {
        const n = window.localStorage.getItem(e);
        return n ? JSON.parse(n) : t;
      } catch {
        return t;
      }
    });
  f(() => {
    if (!(typeof window > 'u'))
      try {
        const n = window.localStorage.getItem(e);
        n
          ? r(JSON.parse(n))
          : window.localStorage.setItem(e, JSON.stringify(c.current));
      } catch (n) {
        console.error(`Error reading localStorage key "${e}":`, n);
      }
  }, [e]);
  const s = p(
    n => {
      try {
        r(l => {
          const i = n instanceof Function ? n(l) : n;
          return (localStorage.setItem(e, JSON.stringify(i)), i);
        });
      } catch (l) {
        console.error(`Error setting localStorage key "${e}":`, l);
      }
    },
    [e],
  );
  return [o, s];
}
const O = (e, t) => {
    const c = h(e);
    (f(() => {
      c.current = e;
    }, [e]),
      f(() => {
        let o;
        function r() {
          const s = c.current();
          s instanceof Promise
            ? s.then(() => {
                t && (o = setTimeout(r, t));
              })
            : t && (o = setTimeout(r, t));
        }
        if (t) return ((o = setTimeout(r, t)), () => o && clearTimeout(o));
      }, [t]));
  },
  Y = () => {
    const [e, t] = y(null),
      [c, o] = y({
        scrollY: 0,
        scrollPercentage: 0,
        isAtTop: !0,
        isAtBottom: !1,
        scrollableHeight: 0,
        clientHeight: 0,
        scrollHeight: 0,
      }),
      r = p(s => {
        t(s);
      }, []);
    return (
      f(() => {
        if (!e) return;
        const s = () => {
          const { scrollTop: i, scrollHeight: u, clientHeight: a } = e,
            m = u - a;
          if (m <= 0) {
            o({
              scrollY: 0,
              scrollPercentage: 0,
              isAtTop: !0,
              isAtBottom: !0,
              scrollableHeight: 0,
              clientHeight: a,
              scrollHeight: u,
            });
            return;
          }
          const d = Math.min(100, Math.max(0, (i / m) * 100));
          o({
            scrollY: i,
            scrollPercentage: d,
            isAtTop: i <= 0,
            isAtBottom: i >= m - 1,
            scrollableHeight: m,
            clientHeight: a,
            scrollHeight: u,
          });
        };
        s();
        const n = () => {
          s();
        };
        e.addEventListener('scroll', n, { passive: !0 });
        const l = new ResizeObserver(() => {
          s();
        });
        return (
          l.observe(e),
          () => {
            (e.removeEventListener('scroll', n), l.unobserve(e));
          }
        );
      }, [e]),
      { ...c, element: e, setRef: r }
    );
  };
function M(e) {
  const t = h([]),
    c = p(
      r => {
        if (
          t.current[r] &&
          (t.current[r].scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start',
            ...e,
          }),
          e?.offset)
        ) {
          const s =
            t.current[r].getBoundingClientRect().top +
            window.scrollY -
            e.offset;
          window.scrollTo({
            top: s,
            behavior: e.behavior || 'smooth',
          });
        }
      },
      [e],
    ),
    o = p((r, s) => {
      t.current[s] = r;
    }, []);
  return { elementRefs: t, setElementRef: o, scrollToElement: c };
}
const V = () => {
    const [e, t] = y({
      x: 0,
      y: 0,
      percent: {
        x: 0,
        y: 0,
      },
    });
    return (
      f(() => {
        const c = () => {
          const n = window.scrollX || 0,
            l = window.scrollY || 0,
            i = /iPad|iPhone|iPod/.test(navigator.userAgent),
            u = window.visualViewport,
            a = i && u ? u.width : window.innerWidth,
            m = i && u ? u.height : window.innerHeight,
            d = Math.max(0, document.documentElement.scrollWidth - a),
            v = Math.max(0, document.documentElement.scrollHeight - m),
            b = d === 0 ? 0 : Math.min(100, (n / d) * 100),
            g = v === 0 ? 0 : Math.min(100, (l / v) * 100);
          t({
            x: n,
            y: l,
            percent: {
              x: Math.floor(Math.max(0, b)),
              y: Math.floor(Math.max(0, g)),
            },
          });
        };
        c();
        const o = () => {
            c();
          },
          r = () => {
            setTimeout(c, 100);
          },
          s = () => {
            setTimeout(c, 50);
          };
        return (
          window.addEventListener('scroll', o, { passive: !0 }),
          window.addEventListener('resize', r),
          window.addEventListener('orientationchange', r),
          window.visualViewport &&
            window.visualViewport.addEventListener('resize', s),
          () => {
            (window.removeEventListener('scroll', o),
              window.removeEventListener('resize', r),
              window.removeEventListener('orientationchange', r),
              window.visualViewport &&
                window.visualViewport.removeEventListener('resize', s));
          }
        );
      }, []),
      e
    );
  },
  B = (e = {}) => {
    const {
        enabled: t = !0,
        useWheel: c = !1,
        debounceDelay: o = 150,
        threshold: r = 100,
      } = e,
      { percent: s } = V(),
      n = h(null),
      l = h(0),
      i = h(!1),
      u = h(!1),
      a = h(!1);
    (f(() => {
      t && ((l.current = window.scrollY), (a.current = !1));
    }, [t]),
      f(() => {
        if (!t) return;
        if (s.y >= r) a.current = !0;
        else if (!a.current && !u.current) {
          const L = window.scrollY;
          L > l.current && (l.current = L);
        }
        const m = () => {
            !i.current &&
              !u.current &&
              ((u.current = !0),
              window.scrollTo({
                top: l.current,
                behavior: 'smooth',
              }),
              setTimeout(() => {
                u.current = !1;
              }, 500));
          },
          d = () => {
            ((i.current = !0),
              (u.current = !1),
              n.current && (clearTimeout(n.current), (n.current = null)));
          },
          v = () => {
            ((i.current = !1), s.y >= r && (n.current = setTimeout(m, o)));
          },
          b = () => {
            ((i.current = !1), s.y >= r && (n.current = setTimeout(m, o)));
          },
          g = L => {
            s.y >= r && L.deltaY > 0 && L.preventDefault();
          },
          E = () => {
            i.current ||
              u.current ||
              (s.y >= r && (n.current = setTimeout(m, o)));
          };
        return (
          document.addEventListener('touchstart', d, { passive: !0 }),
          document.addEventListener('touchend', v, { passive: !0 }),
          document.addEventListener('touchcancel', b, { passive: !0 }),
          window.addEventListener('scroll', E, { passive: !0 }),
          c && window.addEventListener('wheel', g, { passive: !1 }),
          () => {
            (document.removeEventListener('touchstart', d),
              document.removeEventListener('touchend', v),
              document.removeEventListener('touchcancel', b),
              window.removeEventListener('scroll', E),
              c && window.removeEventListener('wheel', g),
              n.current && clearTimeout(n.current));
          }
        );
      }, [s.y, t, c, o, r]));
  },
  k = (e = {}) => {
    const { isInApp: t = !1, debounce: c = 100 } = e,
      [o, r] = y({
        width: 0,
        height: 0,
        offsetLeft: 0,
        offsetTop: 0,
        pageLeft: 0,
        pageTop: 0,
        scale: 1,
      }),
      s = p(() => {
        const l = window.innerHeight,
          i = window.visualViewport?.height || l,
          u = document.documentElement.clientHeight,
          a = document.body.clientHeight;
        return window.visualViewport && Math.abs(i - l) > 100
          ? i
          : Math.max(l, u, a);
      }, []),
      n = p(() => {
        if (window.visualViewport && !t) return window.visualViewport;
        const l = window.visualViewport?.width || window.innerWidth,
          i = t ? s() : window.visualViewport?.height || window.innerHeight;
        return {
          width: l,
          height: i,
          offsetLeft: window.visualViewport?.offsetLeft || 0,
          offsetTop: window.visualViewport?.offsetTop || 0,
          pageLeft: window.scrollX ?? window.pageXOffset ?? 0,
          pageTop: window.scrollY ?? window.pageYOffset ?? 0,
          scale: window.visualViewport?.scale || 1,
        };
      }, [t, s]);
    return (
      f(() => {
        let l;
        const i = () => {
            (clearTimeout(l),
              (l = setTimeout(() => {
                r(n());
              }, c)));
          },
          u = () => r(n());
        u();
        const a = ['resize', 'orientationchange'];
        (t && a.push('focus', 'blur', 'touchstart', 'touchend'),
          a.forEach(d => {
            d === 'resize' || d === 'orientationchange'
              ? window.addEventListener(d, i)
              : window.addEventListener(d, u, { passive: !0 });
          }),
          window.visualViewport &&
            (window.visualViewport.addEventListener('resize', u),
            window.visualViewport.addEventListener('scroll', u)));
        let m;
        if (t) {
          let d = n().height;
          m = setInterval(() => {
            const v = n().height;
            Math.abs(v - d) > 50 && ((d = v), u());
          }, 500);
        }
        return () => {
          (clearTimeout(l),
            m && clearInterval(m),
            a.forEach(d => {
              window.removeEventListener(
                d,
                d === 'resize' || d === 'orientationchange' ? i : u,
              );
            }),
            window.visualViewport &&
              (window.visualViewport.removeEventListener('resize', u),
              window.visualViewport.removeEventListener('scroll', u)));
        };
      }, [n, t, c]),
      o
    );
  };
export {
  H as useBodyScrollLock,
  P as useElementRect,
  I as useElementSize,
  R as useImageLoader,
  A as useLocalStorage,
  O as useRecursiveTimeout,
  B as useScrollBounceBack,
  Y as useScrollPosition,
  M as useScrollToElements,
  k as useViewport,
  V as useWindowScroll,
};
