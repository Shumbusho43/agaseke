import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Signup(){
  const [name, setName] = useState('')
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
      await api.post('/auth/register', { name, email, password })
      // after signup redirect to login
      navigate('/login')
    }catch(err){
      setError(err.response?.data?.message || 'Signup failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        {error && <div className="error">{error}</div>}
        <label>
          Full name
          <input value={name} onChange={e=>setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </label>
        <button className="primary-btn" type="submit" disabled={loading}>{loading? 'Creating...':'Create account'}</button>
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  )
}
