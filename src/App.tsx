import { Switch, Route, Router as WouterRouter } from "wouter";
import HomePage from "./pages/HomePage";
import MessagesPage from "./pages/MessagesPage";
import AdminPage from "./pages/AdminPage";

function Router() {
  return (
    <Switch>
      <Route path="/">{() => <HomePage />}</Route>
      <Route path="/login">{() => <HomePage initialAuthMode="login" initialShowAuthForm />}</Route>
      <Route path="/signup">{() => <HomePage initialAuthMode="signup" initialShowAuthForm />}</Route>
      <Route path="/signin">{() => <HomePage initialAuthMode="login" initialShowAuthForm />}</Route>
      <Route path="/messages">{() => <MessagesPage />}</Route>
      <Route path="/admin">{() => <AdminPage />}</Route>
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
          <div className="text-center">
            <h1 className="text-2xl text-[var(--color-primary)]">Page not found</h1>
            <a href="/" className="mt-4 inline-block text-[var(--color-accent)]">Go home</a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

export default App;
