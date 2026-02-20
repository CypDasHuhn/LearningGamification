import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Header } from "~/components/Header";
import { GameMenu } from "~/components/GameMenu";
import { LoginDialog } from "~/components/LoginDialog";

const LOGIN_STORAGE_KEY = "learning-gamification-logged-in";

export default function Index() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOGIN_STORAGE_KEY);
    setIsLoggedIn(stored === "true");
  }, []);

  function openLoginDialog() {
    setIsLoginDialogOpen(true);
  }

  function closeLoginDialog() {
    setIsLoginDialogOpen(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoggedIn(true);
    localStorage.setItem(LOGIN_STORAGE_KEY, "true");
    closeLoginDialog();
  }

  function handleGuestLogin() {
    setIsLoggedIn(true);
    localStorage.setItem(LOGIN_STORAGE_KEY, "true");
    closeLoginDialog();
  }

  function handleLogout() {
    setIsLoggedIn(false);
    localStorage.removeItem(LOGIN_STORAGE_KEY);
  }

  function handleStartClick() {
    if (!isLoggedIn) {
      openLoginDialog();
    } else {
      navigate("/chapter-selection");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isLoggedIn={isLoggedIn}
        onLoginClick={openLoginDialog}
        onLogoutClick={handleLogout}
      />
      <GameMenu onStartClick={handleStartClick} />
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={closeLoginDialog}
        onLogin={handleLogin}
        onGuestLogin={handleGuestLogin}
      />
    </div>
  );
}
