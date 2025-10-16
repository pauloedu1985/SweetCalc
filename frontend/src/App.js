import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import IngredientsPage from "./pages/IngredientsPage";
import PackagingsPage from "./pages/PackagingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RecipesPage from "./pages/RecipesPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Navigation />
                  <main>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/ingredients" element={<IngredientsPage />} />
                      <Route path="/packagings" element={<PackagingsPage />} />
                      <Route path="/recipes" element={<RecipesPage />} />
                    </Routes>
                  </main>
                  <Toaster />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
