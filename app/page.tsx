"use client";

import { useState, useEffect } from "react";
import PasswordGate from "@/components/PasswordGate";
import MainContent from "@/components/MainContent";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // ハイドレーションエラー防止：マウント完了を記録
    setIsMounted(true);
    // localStorageからログイン状態を復元（7日間有効などのロジックがあればここに追加）
    const auth = localStorage.getItem("auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // マウント前は何も出さない（または共通のローディング）
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-gray-900">
      {!isAuthenticated ? (
        <div className="animate-fade-in">
          <PasswordGate onAuthenticated={() => {
            setIsAuthenticated(true);
            localStorage.setItem("auth", "true");
          }} />
        </div>
      ) : (
        <div className="animate-blur-in">
          <MainContent />
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes blurIn {
          from { opacity: 0; filter: blur(10px); }
          to { opacity: 1; filter: blur(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-blur-in {
          animation: blurIn 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
