import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Database interface
export interface User {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  company?: string
  role?: string
  createdAt: Date
  lastLoginAt?: Date
  preferences?: UserPreferences
}

export interface UserPreferences {
  language: string
  region: string
  autoAnalysis: boolean
  keywordSuggestions: boolean
  formattingTips: boolean
  industryInsights: boolean
  emailNotifications: {
    analysisCompletion: boolean
    weeklyTips: boolean
    productUpdates: boolean
  }
  defaultAnalysisMode: string
}

export interface PendingSignup {
  name: string
  email: string
  password: string
  createdAt: Date
}

export interface UserSession {
  id: string
  userId: string
  token: string
  createdAt: Date
  expiresAt: Date
}

export interface ResumeAnalysis {
  id: string
  userId: string
  fileName: string
  fileType: string
  fileSize: number
  candidateName: string
  candidateRole: string
  extractedText: string
  atsScore: number
  analysisData: any
  createdAt: Date
  updatedAt: Date
}

let db: Database | null = null

function getDatabase(): Database {
  if (db) return db

  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    db = new Database(path.join(dataDir, 'resume-analyzer.db'))

    // Initialize tables
    initializeTables()
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw new Error(`Database initialization failed: ${error}`)
  }
}

function initializeTables() {
  try {
    const database = getDatabase()

    // Users table
    database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        role TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLoginAt DATETIME,
        preferences TEXT
      )
    `)

    // Pending signups table
    database.exec(`
      CREATE TABLE IF NOT EXISTS pending_signups (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Sessions table
    database.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        expiresAt DATETIME NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `)

    // Resume analyses table
    database.exec(`
      CREATE TABLE IF NOT EXISTS resume_analyses (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        fileName TEXT NOT NULL,
        fileType TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        candidateName TEXT NOT NULL,
        candidateRole TEXT NOT NULL,
        extractedText TEXT NOT NULL,
        atsScore REAL NOT NULL,
        analysisData TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `)

    // Create indexes
    database.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);
      CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions (userId);
      CREATE INDEX IF NOT EXISTS idx_resume_analyses_userId ON resume_analyses (userId);
      CREATE INDEX IF NOT EXISTS idx_resume_analyses_createdAt ON resume_analyses (createdAt);
    `)

    // Tables initialized successfully
  } catch (error) {
    console.error('Failed to initialize database tables:', error)
    throw error
  }
}

// User operations
export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  try {
    const database = getDatabase()
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    database.prepare(
      'INSERT INTO users (id, name, email, password, phone, company, role, preferences) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      user.name,
      user.email,
      user.password,
      user.phone || null,
      user.company || null,
      user.role || null,
      user.preferences ? JSON.stringify(user.preferences) : null
    )

    return {
      id,
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone,
      company: user.company,
      role: user.role,
      createdAt: new Date(),
      preferences: user.preferences
    }
  } catch (error) {
    console.error('Failed to create user:', error)
    throw new Error(`Failed to create user: ${error}`)
  }
}

export function getUserByEmail(email: string): User | null {
  try {
    const database = getDatabase()
    const user = database.prepare('SELECT * FROM users WHERE email = ?').get(email)
    
    if (!user) return null

    return {
      ...user,
      createdAt: new Date(user.createdAt),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
      preferences: user.preferences ? JSON.parse(user.preferences) : undefined
    }
  } catch (error) {
    console.error('Failed to get user by email:', error)
    return null
  }
}

export function updateUser(email: string, updates: Partial<User>): User | null {
  const database = getDatabase()
  
  const setFields: string[] = []
  const values: any[] = []
  
  if (updates.name !== undefined) {
    setFields.push('name = ?')
    values.push(updates.name)
  }
  if (updates.phone !== undefined) {
    setFields.push('phone = ?')
    values.push(updates.phone)
  }
  if (updates.company !== undefined) {
    setFields.push('company = ?')
    values.push(updates.company)
  }
  if (updates.role !== undefined) {
    setFields.push('role = ?')
    values.push(updates.role)
  }
  if (updates.preferences !== undefined) {
    setFields.push('preferences = ?')
    values.push(JSON.stringify(updates.preferences))
  }
  if (updates.lastLoginAt !== undefined) {
    setFields.push('lastLoginAt = ?')
    values.push(updates.lastLoginAt.toISOString())
  }

  if (setFields.length === 0) return null

  values.push(email)
  
  database.prepare(
    `UPDATE users SET ${setFields.join(', ')} WHERE email = ?`
  ).run(...values)

  return getUserByEmail(email)
}

// Pending signup operations
export function createPendingSignup(signup: PendingSignup): void {
  const database = getDatabase()
  database.prepare(
    'INSERT OR REPLACE INTO pending_signups (email, name, password, createdAt) VALUES (?, ?, ?, ?)'
  ).run(signup.email, signup.name, signup.password, signup.createdAt.toISOString())
}

export function getPendingSignup(email: string): PendingSignup | null {
  const database = getDatabase()
  const signup = database.prepare('SELECT * FROM pending_signups WHERE email = ?').get(email)
  
  if (!signup) return null

  return {
    name: signup.name,
    email: signup.email,
    password: signup.password,
    createdAt: new Date(signup.createdAt)
  }
}

export function deletePendingSignup(email: string): void {
  const database = getDatabase()
  database.prepare('DELETE FROM pending_signups WHERE email = ?').run(email)
}

// Session operations
export function createSession(userId: string, token: string, expiresInHours: number = 24): UserSession {
  try {
    const database = getDatabase()
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    
    database.prepare(
      'INSERT INTO sessions (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)'
    ).run(id, userId, token, expiresAt.toISOString())

    return {
      id,
      userId,
      token,
      createdAt: new Date(),
      expiresAt
    }
  } catch (error) {
    console.error('Failed to create session:', error)
    throw new Error(`Failed to create session: ${error}`)
  }
}

export function getSessionByToken(token: string): UserSession | null {
  const database = getDatabase()
  const session = database.prepare('SELECT * FROM sessions WHERE token = ? AND expiresAt > ?').get(
    token,
    new Date().toISOString()
  )
  
  if (!session) return null

  return {
    id: session.id,
    userId: session.userId,
    token: session.token,
    createdAt: new Date(session.createdAt),
    expiresAt: new Date(session.expiresAt)
  }
}

export function deleteSession(token: string): void {
  const database = getDatabase()
  database.prepare('DELETE FROM sessions WHERE token = ?').run(token)
}

export function deleteExpiredSessions(): void {
  const database = getDatabase()
  database.prepare('DELETE FROM sessions WHERE expiresAt <= ?').run(new Date().toISOString())
}

// Resume analysis operations
export function saveResumeAnalysis(analysis: Omit<ResumeAnalysis, 'id' | 'createdAt' | 'updatedAt'>): ResumeAnalysis {
  const database = getDatabase()
  const id = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  database.prepare(
    `INSERT INTO resume_analyses (
      id, userId, fileName, fileType, fileSize, candidateName, candidateRole, 
      extractedText, atsScore, analysisData
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    analysis.userId,
    analysis.fileName,
    analysis.fileType,
    analysis.fileSize,
    analysis.candidateName,
    analysis.candidateRole,
    analysis.extractedText,
    analysis.atsScore,
    JSON.stringify(analysis.analysisData)
  )

  return {
    id,
    ...analysis,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function getUserAnalyses(userId: string, limit: number = 50): ResumeAnalysis[] {
  const database = getDatabase()
  const analyses = database.prepare(
    'SELECT * FROM resume_analyses WHERE userId = ? ORDER BY createdAt DESC LIMIT ?'
  ).all(userId, limit)
  
  return analyses.map(analysis => ({
    ...analysis,
    createdAt: new Date(analysis.createdAt),
    updatedAt: new Date(analysis.updatedAt),
    analysisData: JSON.parse(analysis.analysisData)
  }))
}

export function getAnalysisById(id: string): ResumeAnalysis | null {
  const database = getDatabase()
  const analysis = database.prepare('SELECT * FROM resume_analyses WHERE id = ?').get(id)
  
  if (!analysis) return null

  return {
    ...analysis,
    createdAt: new Date(analysis.createdAt),
    updatedAt: new Date(analysis.updatedAt),
    analysisData: JSON.parse(analysis.analysisData)
  }
}

// Database will be initialized lazily when first accessed

// Cleanup expired sessions periodically
setInterval(deleteExpiredSessions, 60 * 60 * 1000) // Every hour

// Legacy compatibility - keep in-memory maps for backward compatibility
export const users = new Map<string, User>()
export const pendingSignups = new Map<string, PendingSignup>()
