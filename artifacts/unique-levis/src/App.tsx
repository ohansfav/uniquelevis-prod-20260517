import { Switch, Route, Router as WouterRouter } from "wouter";
import HomePage from "./pages/HomePage";
import MessagesPage from "./pages/MessagesPage";
import AdminPage from "./pages/AdminPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={() => <HomePage initialAuthMode="login" initialShowAuthForm />} />
      <Route path="/signup" component={() => <HomePage initialAuthMode="signup" initialShowAuthForm />} />
      <Route path="/signin" component={() => <HomePage initialAuthMode="login" initialShowAuthForm />} />
      <Route path="/login" component={() => <HomePage initialAuthMode="login" initialShowAuthForm />} />
      <Route path="/signup" component={() => <HomePage initialAuthMode="signup" initialShowAuthForm />} />
      <Route path="/signin" component={() => <HomePage initialAuthMode="login" initialShowAuthForm />} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/admin" component={AdminPage} />
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
