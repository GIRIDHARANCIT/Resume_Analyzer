"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Upload, BarChart3, Users, Zap, Shield, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { authAPI, apiUtils } from "@/lib/api-client"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await authAPI.login({
        email,
        password
      })
      
      if (result.requiresOTP) {
        setShowOTP(true)
      }
    } catch (error) {
      setError(apiUtils.handleError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await authAPI.signup({
        name,
        email,
        password
      })
      
      if (result.requiresOTP) {
        setShowOTP(true)
      }
    } catch (error) {
      setError(apiUtils.handleError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = isLogin
        ? await authAPI.verifyOTP({ email, otp })
        : await authAPI.verifySignupOTP({ email, otp })
      
      if (result.success) {
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            email: result.user.email,
            name: result.user.name,
            sessionToken: result.sessionToken,
            loginTime: new Date().toISOString(),
          }),
        )

        router.push("/dashboard")
      }
    } catch (error) {
      setError(apiUtils.handleError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError("")
    try {
      if (isLogin) {
        await authAPI.login({ email, password })
      } else {
        await authAPI.signup({ name: name || email.split("@")[0], email, password })
      }
    } catch (error) {
      setError(apiUtils.handleError(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Resume Analyzer</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional ATS analysis, keyword optimization, and personalized recommendations to boost your resume success rate
          </p>
        </div>

        {/* Auth Tabs */}
        <Tabs defaultValue="signin" className="max-w-md mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" onClick={() => setIsLogin(true)}>Sign In</TabsTrigger>
            <TabsTrigger value="signup" onClick={() => setIsLogin(false)}>Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            {/* Sign In Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">{isLogin ? "Sign In" : "Create Account"}</CardTitle>
                <CardDescription className="text-center">
                  {isLogin
                    ? "Welcome back! Sign in to analyze your resumes"
                    : "Join thousands of professionals improving their resumes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            {/* Sign Up Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">{isLogin ? "Sign In" : "Create Account"}</CardTitle>
                <CardDescription className="text-center">
                  {isLogin
                    ? "Welcome back! Sign in to analyze your resumes"
                    : "Join thousands of professionals improving their resumes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter username" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleSignup} className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">ATS Score Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Get detailed ATS compatibility scores with 90%+ accuracy</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Upload className="h-12 w-12 text-secondary mx-auto mb-2" />
              <CardTitle className="text-lg">Bulk Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Upload multiple resumes and compare them side by side</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-accent mx-auto mb-2" />
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Get personalized suggestions to improve your resume</p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>10,000+ Users</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span>90%+ Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showOTP} onOpenChange={setShowOTP}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit verification code to {email}. Please enter it below to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button onClick={handleOTPVerification} className="w-full">
              Verify & Continue
            </Button>
            <Button variant="outline" onClick={() => setShowOTP(false)} className="w-full">
              Back to Login
            </Button>
            <Button variant="outline" onClick={handleResendOTP} className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending…' : 'Resend Code'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
