import { useState as a, useEffect as m, useRef as S, useCallback as f } from "react";
const b = (e) => {
  const [t, c] = a(null);
  return m(() => {
    const s = (o) => typeof o == "string" ? document.querySelector(o) : o.current, n = () => {
      const o = s(e);
      c(o ? o.getBoundingClientRect() : null);
    }, r = () => {
      requestAnimationFrame(n);
    };
    return n(), window.addEventListener("scroll", r, { passive: !0 }), window.addEventListener("resize", r, { passive: !0 }), () => {
      window.removeEventListener("scroll", r), window.removeEventListener("resize", r);
    };
  }, [e]), t;
}, l = {
  // < 640px
  sm: 640,
  // >= 640px
  md: 768,
  // >= 768px
  lg: 1024,
  // >= 1024px
  xl: 1280,
  // >= 1280px
  "2xl": 1536
  // >= 1536px
}, x = (e) => {
  let t = "xs";
  return e >= l["2xl"] ? t = "2xl" : e >= l.xl ? t = "xl" : e >= l.lg ? t = "lg" : e >= l.md ? t = "md" : e >= l.sm ? t = "sm" : t = "xs", {
    current: t,
    xs: e < l.sm,
    sm: e >= l.sm && e < l.md,
    md: e >= l.md && e < l.lg,
    lg: e >= l.lg && e < l.xl,
    xl: e >= l.xl && e < l["2xl"],
    "2xl": e >= l["2xl"]
  };
}, w = () => {
  const [e, t] = a({ width: 0, height: 0 }), [c, s] = a({
    current: "xs",
    xs: !0,
    sm: !1,
    md: !1,
    lg: !1,
    xl: !1,
    "2xl": !1
  }), n = S(null), r = S(null), o = f(() => {
    if (n.current) {
      const { offsetWidth: g, offsetHeight: v } = n.current, d = window.innerWidth - document.documentElement.clientWidth;
      t({
        width: g,
        height: v
      }), s(x(g + d));
    }
  }, []), i = f(() => {
    r.current && (n.current && r.current.unobserve(n.current), r.current.disconnect());
  }, []), u = f(() => {
    i(), r.current = new ResizeObserver(o), n.current && r.current.observe(n.current), o();
  }, [i, o]);
  return m(() => (u(), () => {
    i();
  }), [u, i]), { size: e, breakpoint: c, elementRef: n, connect: u, disconnect: i };
}, h = (e) => {
  const [t, c] = a(!0), [s, n] = a();
  return m(() => {
    if (!e) {
      c(!1);
      return;
    }
    const r = new Image();
    r.src = e, r.onload = () => c(!1), r.onerror = (o) => {
      c(!1), n(o);
    };
  }, [e]), {
    loading: t,
    error: s
  };
};
function R(e, t) {
  const c = S(t), [s, n] = a(() => {
    if (typeof window > "u")
      return t;
    try {
      const o = window.localStorage.getItem(e);
      return o ? JSON.parse(o) : t;
    } catch {
      return t;
    }
  });
  m(() => {
    if (!(typeof window > "u"))
      try {
        const o = window.localStorage.getItem(e);
        o ? n(JSON.parse(o)) : window.localStorage.setItem(e, JSON.stringify(c.current));
      } catch (o) {
        console.error(`Error reading localStorage key "${e}":`, o);
      }
  }, [e]);
  const r = f(
    (o) => {
      try {
        n((i) => {
          const u = o instanceof Function ? o(i) : o;
          return localStorage.setItem(e, JSON.stringify(u)), u;
        });
      } catch (i) {
        console.error(`Error setting localStorage key "${e}":`, i);
      }
    },
    [e]
  );
  return [s, r];
}
const T = (e, t) => {
  const c = S(e);
  m(() => {
    c.current = e;
  }, [e]), m(() => {
    let s;
    function n() {
      const r = c.current();
      r instanceof Promise ? r.then(() => {
        t && (s = setTimeout(n, t));
      }) : t && (s = setTimeout(n, t));
    }
    if (t)
      return s = setTimeout(n, t), () => s && clearTimeout(s);
  }, [t]);
}, z = () => {
  const [e, t] = a(null), [c, s] = a({
    scrollY: 0,
    scrollPercentage: 0,
    isAtTop: !0,
    isAtBottom: !1,
    scrollableHeight: 0,
    clientHeight: 0,
    scrollHeight: 0
  }), n = f((r) => {
    t(r);
  }, []);
  return m(() => {
    if (!e)
      return;
    const r = () => {
      const { scrollTop: u, scrollHeight: g, clientHeight: v } = e, d = g - v;
      if (d <= 0) {
        s({
          scrollY: 0,
          scrollPercentage: 0,
          isAtTop: !0,
          isAtBottom: !0,
          scrollableHeight: 0,
          clientHeight: v,
          scrollHeight: g
        });
        return;
      }
      const p = Math.min(
        100,
        Math.max(0, u / d * 100)
      );
      s({
        scrollY: u,
        scrollPercentage: p,
        isAtTop: u <= 0,
        isAtBottom: u >= d - 1,
        scrollableHeight: d,
        clientHeight: v,
        scrollHeight: g
      });
    };
    r();
    const o = () => {
      r();
    };
    e.addEventListener("scroll", o, { passive: !0 });
    const i = new ResizeObserver(() => {
      r();
    });
    return i.observe(e), () => {
      e.removeEventListener("scroll", o), i.unobserve(e);
    };
  }, [e]), { ...c, element: e, setRef: n };
};
function B(e) {
  const t = S([]), c = f(
    (n) => {
      if (t.current[n] && (t.current[n].scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
        ...e
      }), e?.offset)) {
        const r = t.current[n].getBoundingClientRect().top + window.scrollY - e.offset;
        window.scrollTo({
          top: r,
          behavior: e.behavior || "smooth"
        });
      }
    },
    [e]
  ), s = f((n, r) => {
    t.current[r] = n;
  }, []);
  return { elementRefs: t, setElementRef: s, scrollToElement: c };
}
export {
  b as useElementRect,
  w as useElementSize,
  h as useImageLoader,
  R as useLocalStorage,
  T as useRecursiveTimeout,
  z as useScrollPosition,
  B as useScrollToElements
};
