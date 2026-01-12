import { useEffect, useRef } from "react";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const VISIT_KEY = "docxiq_landing_visited";

const getSessionId = () => {
  let sessionId = localStorage.getItem("visitor_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("visitor_session", sessionId);
  }
  return sessionId;
};

const Landing = () => {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    if (sessionStorage.getItem(VISIT_KEY)) return;

    fetch(`${API_BASE}/analytics/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appSource: "docxiq",
        path: window.location.pathname,
        referrer: document.referrer,
        sessionId: getSessionId(),
      }),
    })
      .then(() => {
        sessionStorage.setItem(VISIT_KEY, "true");
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-screen">
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default Landing;
