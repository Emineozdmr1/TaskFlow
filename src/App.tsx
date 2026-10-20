import AppRouter from "./app/AppRouter";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Toaster } from "sonner";

function AppContent() {
  const { theme } = useTheme();

  return (
    <>
      <AppRouter />
      <Toaster
        theme={theme === "dark" ? "dark" : "light"}
        richColors
        position="bottom-right"
        closeButton
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;