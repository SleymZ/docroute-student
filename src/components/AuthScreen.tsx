"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  FileCheck2,
  GraduationCap,
  LockKeyhole,
  Mail,
  MapPin,
  Route,
  ShieldCheck,
} from "lucide-react";

import styles from "./AuthScreen.module.css";

type AuthMode = "login" | "signup";

type AuthScreenProps = {
  initialMode: AuthMode;
};

const routeStages = [
  {
    number: "01",
    title: "Destination selected",
    detail: "Slovakia · Medicine",
    icon: MapPin,
    completed: true,
  },
  {
    number: "02",
    title: "University application",
    detail: "Documents and deadlines",
    icon: GraduationCap,
    completed: true,
  },
  {
    number: "03",
    title: "Student residence",
    detail: "Starts after admission",
    icon: FileCheck2,
    completed: false,
  },
];

export function AuthScreen({ initialMode }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const isLogin = mode === "login";

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");

    window.history.replaceState(
      null,
      "",
      `/auth?mode=${nextMode}`,
    );
  }

  function showPrototypeMessage() {
    setMessage(
      "The page is ready. Account authentication will be connected in the next step.",
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    showPrototypeMessage();
  }

  return (
    <main className={styles.page}>
      <section className={styles.storyPanel}>
        <div className={styles.storyGrid} aria-hidden="true" />
        <div className={styles.storyGlow} aria-hidden="true" />

        <header className={styles.storyHeader}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>
              <Route size={24} aria-hidden="true" />
            </span>

            <span>
              <strong>DocRoute</strong>
              <small>STUDENT</small>
            </span>
          </Link>

          <Link href="/" className={styles.homeLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to homepage
          </Link>
        </header>

        <div className={styles.storyContent}>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>YOUR STUDY DOSSIER</p>

            <h1>
              One route.
              <br />
              Every <span>document.</span>
            </h1>

            <p className={styles.storyDescription}>
              Keep university applications, document requirements and
              residence steps connected in one clear workspace.
            </p>
          </div>

          <div className={styles.routeBoard}>
            <div className={styles.boardHeader}>
              <div>
                <small>ACTIVE ROUTE</small>
                <strong>Application to arrival</strong>
              </div>

              <span>EU / 001</span>
            </div>

            <div className={styles.routeStages}>
              {routeStages.map((stage) => {
                const Icon = stage.icon;

                return (
                  <article key={stage.number} className={styles.routeStage}>
                    <div
                      className={`${styles.stageIcon} ${
                        stage.completed ? styles.stageComplete : ""
                      }`}
                    >
                      <Icon size={18} aria-hidden="true" />

                      {stage.completed && (
                        <span className={styles.checkMark}>
                          <Check size={10} aria-hidden="true" />
                        </span>
                      )}
                    </div>

                    <div className={styles.stageText}>
                      <small>{stage.number}</small>
                      <strong>{stage.title}</strong>
                      <span>{stage.detail}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className={styles.boardFooter}>
              <ShieldCheck size={17} aria-hidden="true" />
              <span>Requirements linked to official sources</span>
            </div>
          </div>
        </div>

        <footer className={styles.storyFooter}>
          <span>
            <Check size={14} aria-hidden="true" />
            Save your progress
          </span>

          <span>
            <Check size={14} aria-hidden="true" />
            Track every requirement
          </span>

          <span>
            <Check size={14} aria-hidden="true" />
            Start free
          </span>
        </footer>
      </section>

      <section className={styles.authPanel}>
        <div className={styles.paperPattern} aria-hidden="true" />

        <div className={styles.authContainer}>
          <Link href="/" className={styles.mobileBrand}>
            <span className={styles.mobileBrandMark}>
              <Route size={21} aria-hidden="true" />
            </span>
            <strong>DocRoute Student</strong>
          </Link>

          <div className={styles.securityLabel}>
            <LockKeyhole size={15} aria-hidden="true" />
            Personal workspace
          </div>

          <div className={styles.modeSwitch} aria-label="Account action">
            <button
              type="button"
              aria-pressed={mode === "signup"}
              onClick={() => changeMode("signup")}
            >
              Create account
            </button>

            <button
              type="button"
              aria-pressed={mode === "login"}
              onClick={() => changeMode("login")}
            >
              Log in
            </button>
          </div>

          <header className={styles.authHeader}>
            <p>{isLogin ? "WELCOME BACK" : "START YOUR ROUTE"}</p>

            <h2>
              {isLogin
                ? "Continue your journey."
                : "Create your study workspace."}
            </h2>

            <span>
              {isLogin
                ? "Return to your saved universities, documents and application routes."
                : "Save universities, track requirements and continue from any device."}
            </span>
          </header>

          <button
            type="button"
            className={styles.googleButton}
            onClick={showPrototypeMessage}
          >
            <span className={styles.googleMark}>G</span>
            Continue with Google
          </button>

          <div className={styles.divider}>
            <span>or continue with email</span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Email address</span>

              <div className={styles.inputWrap}>
                <Mail
                  className={styles.fieldIcon}
                  size={18}
                  aria-hidden="true"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className={styles.field}>
              <span className={styles.passwordLabel}>
                Password

                {isLogin && (
                  <button
                    type="button"
                    onClick={showPrototypeMessage}
                  >
                    Forgot password?
                  </button>
                )}
              </span>

              <div className={styles.inputWrap}>
                <LockKeyhole
                  className={styles.fieldIcon}
                  size={18}
                  aria-hidden="true"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={isLogin ? "Your password" : "At least 8 characters"}
                  autoComplete={
                    isLogin ? "current-password" : "new-password"
                  }
                  minLength={isLogin ? undefined : 8}
                  required
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </label>

            {!isLogin && (
              <label className={styles.consent}>
                <input type="checkbox" required />
                <span>
                  I agree to the Terms of Use and Privacy Policy.
                </span>
              </label>
            )}

            <button type="submit" className={styles.submitButton}>
              {isLogin ? "Log in to DocRoute" : "Create free account"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>

            {message && (
              <p className={styles.prototypeMessage} role="status">
                {message}
              </p>
            )}
          </form>

          <p className={styles.modePrompt}>
            {isLogin ? "New to DocRoute?" : "Already have an account?"}

            <button
              type="button"
              onClick={() => changeMode(isLogin ? "signup" : "login")}
            >
              {isLogin ? "Create an account" : "Log in"}
            </button>
          </p>

          <Link href="/explore" className={styles.guestLink}>
            Explore without an account
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <p className={styles.privacyNote}>
            Your application information remains private and is never
            shared with universities without your permission.
          </p>
        </div>
      </section>
    </main>
  );
}