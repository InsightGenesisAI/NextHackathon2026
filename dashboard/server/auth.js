// Auth + per-user company profiles. Pure Node (crypto), no dependencies.
//
// In-memory stores (consistent with the rest of the hub): users and sessions
// live in process memory, so they reset on restart / serverless cold starts.
// Swap for a database + durable session store for production.

const crypto = require("crypto");

const users = new Map();      // email -> user
const sessions = new Map();   // token -> { email, created }

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  const [salt, original] = stored.split(":");
  if (!salt || !original) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(derived, "hex");
  const b = Buffer.from(original, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createUser({ name, email, company, password }) {
  const key = String(email || "").trim().toLowerCase();
  if (!key) throw new Error("Email is required");
  if (!password || password.length < 6) throw new Error("Password must be at least 6 characters");
  if (users.has(key)) throw new Error("An account with this email already exists");

  const user = {
    name: (name || "").trim() || key.split("@")[0],
    email: key,
    company: (company || "").trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    profileComplete: false,
    profile: null, // { basics: {...}, aiAnswers: [...] }
  };
  users.set(key, user);
  return user;
}

function authenticate(email, password) {
  const key = String(email || "").trim().toLowerCase();
  const user = users.get(key);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

function getUser(email) {
  return users.get(String(email || "").trim().toLowerCase()) || null;
}

function saveProfile(email, profile) {
  const user = getUser(email);
  if (!user) return null;
  user.profile = profile;
  user.profileComplete = true;
  if (profile && profile.basics && profile.basics.company && !user.company) {
    user.company = profile.basics.company;
  }
  return user;
}

// Stash step-1 answers + generated AI questions between onboarding steps.
function setPendingOnboarding(email, { basics, aiQuestions, aiSource }) {
  const user = getUser(email);
  if (!user) return null;
  user.pending = { basics, aiQuestions, aiSource };
  return user;
}

function getPendingOnboarding(email) {
  const user = getUser(email);
  return user ? user.pending || null : null;
}

// ── Sessions ──
function createSession(email) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { email, created: Date.now() });
  return token;
}

function getSessionUser(token) {
  if (!token) return null;
  const sess = sessions.get(token);
  if (!sess) return null;
  if (Date.now() - sess.created > SESSION_TTL_MS) {
    sessions.delete(token);
    return null;
  }
  return getUser(sess.email);
}

function destroySession(token) {
  if (token) sessions.delete(token);
}

// ── Cookie helpers ──
function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx > -1) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      if (k) out[k] = decodeURIComponent(v);
    }
  });
  return out;
}

function sessionCookie(token) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `sid=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearCookie() {
  return `sid=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

function userFromRequest(req) {
  const cookies = parseCookies(req);
  return getSessionUser(cookies.sid);
}

module.exports = {
  createUser,
  authenticate,
  getUser,
  saveProfile,
  setPendingOnboarding,
  getPendingOnboarding,
  createSession,
  destroySession,
  parseCookies,
  sessionCookie,
  clearCookie,
  userFromRequest,
};
