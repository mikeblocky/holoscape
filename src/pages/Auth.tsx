import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PRESET_USERS, SPECIAL_DISPLAY_NAMES } from '@/data/presetUsers';
import { useAuthSession } from '@/context/AuthSessionProvider';

type SignupUser = {
  username: string;
  password: string;
  createdAt: number;
};

type ResolvedUser = {
  username: string;
  displayName: string;
  special: boolean;
  asset?: string;
  source: 'preset' | 'custom';
};

type HintFragment = {
  id: number;
  user: string;
  message: string;
  top: number;
  left: number;
  rotation: number;
  scale: number;
  ghost: boolean;
};

const SIGNUP_KEY = 'holoscape:auth:signups';
const REMEMBER_KEY = 'holoscape:auth:lastUser';
const DEFAULT_GRADIENT = ['#c8d3ee', '#f7a2b0', '#b88369', '#b4eba0'];
const AVATAR_GATE_USERS = new Set(['guy', 'larry', 'joey', 'gary']);

const formatStripes = (palette: string[]) => {
  const slice = 100 / palette.length;
  return palette
    .map((color, index) => {
      const start = (index * slice).toFixed(2);
      const end = ((index + 1) * slice).toFixed(2);
      return `${color} ${start}% ${end}%`;
    })
    .join(', ');
};

export const AuthPage: React.FC = () => {
  const [signups, setSignups] = useLocalStorage<SignupUser[]>(SIGNUP_KEY, []);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<ResolvedUser | null>(null);
  const [hintPalette, setHintPalette] = useState<string[] | null>(null);
  const [hintFragments, setHintFragments] = useState<HintFragment[]>([]);
  const [hintAnnouncement, setHintAnnouncement] = useState<string | null>(null);
  const [hintCounts, setHintCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { login: establishSession } = useAuthSession();
  const fragmentIdRef = useRef(0);
  const fragmentTimers = useRef<Record<number, number>>({});

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedHandle = window.localStorage.getItem(REMEMBER_KEY);
    if (storedHandle) {
      setLoginUsername(storedHandle);
      setRememberMe(true);
    }
  }, []);

  const clearHintFragments = useCallback(() => {
    setHintFragments([]);
    if (typeof window !== 'undefined') {
      Object.values(fragmentTimers.current).forEach((timerId) => window.clearTimeout(timerId));
    }
    fragmentTimers.current = {};
  }, []);

  const spawnHintFragment = useCallback((user: string, message: string) => {
    const id = fragmentIdRef.current++;
    const fragment: HintFragment = {
      id,
      user,
      message,
      top: 8 + Math.random() * 84,
      left: 6 + Math.random() * 88,
      rotation: Math.random() * 24 - 12,
      scale: 0.85 + Math.random() * 0.6,
      ghost: Math.random() > 0.6
    };
    setHintFragments((prev) => {
      const next = [...prev, fragment];
      return next.slice(-8);
    });
    setHintAnnouncement(`${user}: ${message}`);
    if (typeof window !== 'undefined') {
      const timeout = window.setTimeout(() => {
        setHintFragments((prev) => prev.filter((entry) => entry.id !== id));
        delete fragmentTimers.current[id];
      }, 10000);
      fragmentTimers.current[id] = timeout;
    }
  }, []);

  useEffect(
    () => () => {
      clearHintFragments();
    },
    [clearHintFragments]
  );

  const allUsernames = useMemo(
    () =>
      new Set<string>([
        ...PRESET_USERS.map((record) => record.username.toLowerCase()),
        ...signups.map((user) => user.username.toLowerCase())
      ]),
    [signups]
  );

  const resetSignupFields = () => {
    setSignupUsername('');
    setSignupPassword('');
    setSignupConfirm('');
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setPendingUser(null);
    const handle = loginUsername.trim();
    if (!handle || !loginPassword) {
      setStatus('Please enter both a username and password.');
      return;
    }
    const normalized = handle.toLowerCase();
    const presetMatch = PRESET_USERS.find(
      (record) => record.username.toLowerCase() === normalized && record.password === loginPassword
    );
    const presetHandle = PRESET_USERS.find((record) => record.username.toLowerCase() === normalized);

    let resolved: ResolvedUser | null = null;
    if (presetMatch) {
      resolved = {
        username: presetMatch.username,
        displayName: presetMatch.data.displayName,
        special: presetMatch.special,
        asset: presetMatch.asset,
        source: 'preset'
      };
    } else {
      const customMatch = signups.find(
        (entry) => entry.username.toLowerCase() === normalized && entry.password === loginPassword
      );
      if (customMatch) {
        resolved = {
          username: customMatch.username,
          displayName: customMatch.username,
          special: false,
          source: 'custom'
        };
      }
    }

    if (!resolved) {
      if (presetHandle) {
        setHintCounts((prev) => {
          const prevCount = prev[presetHandle.username] ?? 0;
          const nextHint = presetHandle.hints[prevCount % presetHandle.hints.length];
          spawnHintFragment(presetHandle.data.displayName, nextHint.message);
          if (nextHint.type === 'palette') {
            setHintPalette([...nextHint.palette]);
          } else {
            setHintPalette(null);
          }
          return {
            ...prev,
            [presetHandle.username]: prevCount + 1
          };
        });
        setStatus('That combo still looks off – the clue is somewhere on the wall.');
      } else {
        setHintPalette(null);
        setHintAnnouncement(null);
        clearHintFragments();
        setStatus('That combo did not match any account.');
      }
      return;
    }

    setLoginPassword('');
    setStatus(`Welcome, ${resolved.displayName}. Confirm to proceed.`);
    setPendingUser(resolved);
    setHintPalette(null);
    setHintAnnouncement(null);
    clearHintFragments();

    if (typeof window !== 'undefined') {
      if (rememberMe) {
        window.localStorage.setItem(REMEMBER_KEY, resolved.username);
      } else {
        window.localStorage.removeItem(REMEMBER_KEY);
      }
    }
  };

  const handleSignup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    const handle = signupUsername.trim();
    if (!handle) {
      setStatus('Choose a username for your badge.');
      return;
    }
    if (signupPassword.length < 4) {
      setStatus('Pick a password with at least 4 characters.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setStatus('Passwords must match exactly.');
      return;
    }
    const normalized = handle.toLowerCase();
    if (allUsernames.has(normalized)) {
      setStatus('That username is already reserved.');
      return;
    }
    const next: SignupUser = {
      username: handle,
      password: signupPassword,
      createdAt: Date.now()
    };
    setSignups([next, ...signups]);
    resetSignupFields();
    setStatus('Signup complete! Use the login card to access the portal.');
  };

  const handleCancelVerification = () => {
    setPendingUser(null);
    setStatus('Verification canceled. Start again whenever you are ready.');
  };

  const handleProceed = () => {
    if (!pendingUser) {
      return;
    }
    const destination = pendingUser.special
      ? `/mystery?user=${encodeURIComponent(pendingUser.username)}`
      : '/';
    establishSession({
      username: pendingUser.username,
      displayName: pendingUser.displayName,
      special: pendingUser.special,
      source: pendingUser.source
    });
    setPendingUser(null);
    navigate(destination);
  };

  const showAvatarGate = pendingUser
    ? AVATAR_GATE_USERS.has(pendingUser.username.toLowerCase()) && Boolean(pendingUser.asset)
    : false;

  return (
    <section
      className="auth-wall"
      style={{ background: `linear-gradient(90deg, ${formatStripes(hintPalette ?? DEFAULT_GRADIENT)})` }}
    >
      <div className="auth-gate">
        <article className="auth-card">
          <p className="auth-eyebrow">Login</p>
          <h1>Welcome holovillian</h1>
          <p className="auth-subline">Enter your holofidentials to continue.</p>
          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-label">
              Username
              <input
                type="text"
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
                placeholder="guy"
                autoComplete="username"
              />
            </label>
            <label className="auth-label">
              Password
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
              />
            </label>
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Remember me
            </label>
            <button type="submit" className="auth-primary">Next</button>
            {status && <p className="auth-status">{status}</p>}
            <span className="sr-only" aria-live="polite">
              {hintAnnouncement ?? ''}
            </span>
            <p className="auth-link">
              <Link to="/">Return to desktop</Link>
            </p>
          </form>
        </article>

        <article className="auth-card auth-card--signup">
          <p className="auth-eyebrow">Sign up</p>
          <h2>New badge</h2>
          <p className="auth-subline">Create a local alias to practice the flow.</p>
          <form className="auth-form" onSubmit={handleSignup}>
            <label className="auth-label">
              Username
              <input
                type="text"
                value={signupUsername}
                onChange={(event) => setSignupUsername(event.target.value)}
                placeholder="your-name"
                autoComplete="off"
              />
            </label>
            <label className="auth-label">
              Password
              <input
                type="password"
                value={signupPassword}
                onChange={(event) => setSignupPassword(event.target.value)}
                placeholder="create one"
                autoComplete="new-password"
              />
            </label>
            <label className="auth-label">
              Confirm password
              <input
                type="password"
                value={signupConfirm}
                onChange={(event) => setSignupConfirm(event.target.value)}
                placeholder="repeat it"
              />
            </label>
            <button type="submit" className="auth-secondary">Create badge</button>
          </form>
        </article>
      </div>

      {hintFragments.map((fragment) => (
        <div
          key={fragment.id}
          className={`auth-hint-fragment${fragment.ghost ? ' is-ghost' : ''}`}
          style={{
            top: `${fragment.top}%`,
            left: `${fragment.left}%`,
            transform: `translate(-50%, -50%) rotate(${fragment.rotation}deg) scale(${fragment.scale})`
          }}
        >
          <span className="auth-hint-fragment__user">{fragment.user}</span>
          <span className="auth-hint-fragment__message">{fragment.message}</span>
        </div>
      ))}

      {pendingUser && (
        <div className="identity-gate" role="dialog" aria-modal="true">
          <div className={`identity-card${showAvatarGate ? ' identity-card--avatar' : ''}`}>
            {showAvatarGate ? (
              <>
                <figure className="identity-avatar">
                  <img src={pendingUser.asset} alt={`${pendingUser.displayName} avatar`} />
                  <figcaption>Proceed as {pendingUser.displayName}</figcaption>
                </figure>
                <div className="identity-actions identity-actions--avatar">
                  <button type="button" className="auth-link-btn" onClick={handleCancelVerification}>
                    Cancel
                  </button>
                  <button type="button" className="auth-primary auth-primary--mixed" onClick={handleProceed}>
                    Continue as<span>{pendingUser.displayName}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="auth-eyebrow">Identity check</p>
                <h2>{pendingUser.displayName}</h2>
                <p>
                  These special visitors trigger classified routes: <strong>{SPECIAL_DISPLAY_NAMES.join(', ')}</strong>.
                  {pendingUser.special ? ' Your badge is on the list.' : ' You are cleared for the public desktop.'}
                </p>
                <div className="identity-actions">
                  <button type="button" className="auth-link-btn" onClick={handleCancelVerification}>
                    Cancel
                  </button>
                  <button type="button" className="auth-primary auth-primary--mixed" onClick={handleProceed}>
                    Continue as<span>{pendingUser.displayName}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
