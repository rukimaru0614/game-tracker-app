"use client";
import { useState, useEffect } from "react";
import PasswordGate from "@/components/PasswordGate";
import MainContent from "@/components/MainContent";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem("auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isMounted) return null;

  return (
    <div style={{ backgroundColor: "#111827", minHeight: "100vh" }}>
      { !isAuthenticated ? (
        <PasswordGate onAuthenticated={() => {
          localStorage.setItem("auth", "true");
          setIsAuthenticated(true);
        }} />
      ) : (
        <MainContent />
      )}
    </div>
  );
}
