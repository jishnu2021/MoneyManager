import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/utils/AuthContext"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const { setUser } = useAuth();
  const navigate = useNavigate()
  const location = useLocation()
  const baseUrl = import.meta.env.VITE_API_URI || "http://localhost:3000/api";
  // Handle OAuth success/error from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const token = urlParams.get('token')
    const error = urlParams.get('error')
    
    if (token) {
      localStorage.setItem("token", token)
      alert("Login Successfully with Google!")
      navigate('/')
    } else if (error) {
      let errorMessage = "OAuth authentication failed"
      switch (error) {
        case 'oauth_cancelled':
          errorMessage = "Google authentication was cancelled"
          break
        case 'oauth_failed':
          errorMessage = "Google authentication failed"
          break
        case 'server_error':
          errorMessage = "Server error during authentication"
          break
      }
      alert(errorMessage)
      // Clean URL
      navigate('/login', { replace: true })
    }
  }, [location, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({ email: '', password: '' })

    const values = { email, password }
    
    try {
      const result = await axios.post(
        `${baseUrl}/auth/login`,
        values,
        { withCredentials: true }
      )

      if (result) {
        const response = result.data
        console.log("Login response:", response)
        localStorage.setItem("token", response.accessToken)
        setUser(response.user);
        alert("Login Successfully!")
        navigate('/')
      }
    } catch (error: any) {
      console.error("Login Failed", error)
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else if (error.response?.data?.message) {
        alert(error.response.data.message)
      } else {
        alert("Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Redirect to your backend's Google OAuth route
    window.location.href = "http://localhost:3000/api/auth/google"
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br"
      style={{ backgroundColor: "white", marginTop: "-3rem" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-xl bg-white/80 shadow-2xl rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Login into your Account
            </CardTitle>
            <p className="text-gray-500 mt-1 text-sm">
              Login to get started with{" "}
              <span className="font-semibold text-indigo-600">MoneyManager</span>
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Normal Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  className={`mt-1 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  className={`mt-1 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-base py-2 rounded-xl shadow-lg transition"
              >
                {loading ? "Signing In..." : "Login"}
              </Button>
            </form>

            {/* Or divider */}
            <div className="flex items-center gap-2 my-4">
              <hr className="flex-1 border-gray-300" />
              <span className="text-gray-500 text-sm">or</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              variant="secondary"
              disabled={loading}
              className="w-full flex items-center gap-2 justify-center border-gray-400 hover:bg-gray-50 transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
              Continue with Google
            </Button>

            <p className="text-sm text-gray-600 text-center mt-3">
              Don't have an account?{" "}
              <a href="/signup" className="text-indigo-600 hover:underline font-medium">
                Signup
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Login