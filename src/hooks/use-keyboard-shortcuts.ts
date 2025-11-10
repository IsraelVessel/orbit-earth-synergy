import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface UseKeyboardShortcutsProps {
  onSearchOpen: () => void;
  onHelpOpen: () => void;
  onNewSimulation?: () => void;
}

export const useKeyboardShortcuts = ({
  onSearchOpen,
  onHelpOpen,
  onNewSimulation,
}: UseKeyboardShortcutsProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + K: Open search
      if (modifier && e.key === "k") {
        e.preventDefault();
        onSearchOpen();
      }

      // Cmd/Ctrl + /: Open shortcuts help
      if (modifier && e.key === "/") {
        e.preventDefault();
        onHelpOpen();
      }

      // Cmd/Ctrl + D: Go to Dashboard
      if (modifier && e.key === "d") {
        e.preventDefault();
        navigate("/dashboard");
      }

      // Cmd/Ctrl + H: Go to Home
      if (modifier && e.key === "h") {
        e.preventDefault();
        navigate("/");
      }

      // Cmd/Ctrl + N: New simulation (if handler provided)
      if (modifier && e.key === "n" && onNewSimulation) {
        e.preventDefault();
        onNewSimulation();
      }

      // Cmd/Ctrl + P: Go to Profile
      if (modifier && e.key === "p") {
        e.preventDefault();
        navigate("/profile");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, onSearchOpen, onHelpOpen, onNewSimulation]);
};
