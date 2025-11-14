import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    setError(null)
    try{
      const res = await api.post('/auth/login', { email, password })
      // store token if returned
      if(res.data && res.data.token){
        localStorage.setItem('token', res.data.token)
      }
      // redirect to dashboard or home later
      navigate('/')
    }catch(err){
      setError(err.response?.data?.message || 'Login failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign in</h2>
        {error && <div className="error">{error}</div>}
        <label>
          Email
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </label>
        <button className="primary-btn" type="submit" disabled={loading}>{loading? 'Signing in...':'Sign in'}</button>
        <p>Don't have an account? <Link to="/signup">Create one</Link></p>
      </form>
    </div>
  )
}
