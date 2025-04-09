import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { database } from './firebaseConfig';
import '../styles/Login.css';
// import 'font-awesome/css/font-awesome.min.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [output, setOutput] = useState('');
    const [isSignUp, setIsSignUp] = useState(true); // Toggle between sign-up and login
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        setOutput('Please enter your details and click Sign Up or Login.');
    }, []);

    const handleSignUp = useCallback(async () => {
        if (!email || !password || !name) {
            setOutput('Please enter a valid email, password, and name.');
            return;
        } else if (!email.includes('@') || password.length < 6) {
            setOutput('Email must contain "@" and password must be at least 6 characters.');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await set(ref(database, 'users/' + user.uid), {
                email: user.email,
                name: name
            });

            setOutput('User signed up successfully!');
            navigate(`/dashboard`);
        } catch (error) {
            setOutput(`Error signing up: ${error.message}`);
        }
    }, [email, password, name, auth, navigate]);

    const handleLogin = useCallback(async () => {
        if (!email || !password) {
            setOutput('Email and password cannot be empty.');
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setOutput('Login successful!');
            navigate(`/dashboard`);
        } catch (error) {
            setOutput(`Login failed: ${error.message}`);
        }
    }, [email, password, auth, navigate, name]);

    const handleSubmit = useCallback(() => {
        if (isSignUp) {
            handleSignUp();
        } else {
            handleLogin();
        }
    }, [isSignUp, handleSignUp, handleLogin]);

    return (
        <div>
            <div className="login-box">
                <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
                <p>{output}</p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="input-with-icon">
                        <i className="fa fa-envelope icon"></i>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="input-container">
                        <i className="fa fa-lock icon"></i>
                        <div className="input-with-icon">
                            <i className="fa fa-lock icon"></i>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            <i
                                className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    </div>

                    {isSignUp && (
                        <div className="input-with-icon">
                            <i className="fa fa-user icon"></i>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your Name"
                                required
                            />
                        </div>
                    )}

                    <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
                </form>

                <div className="toggle-mode">
                    {isSignUp ? (
                        <p>
                            Already have an account? 
                            <button onClick={() => setIsSignUp(false)}>Login</button>
                        </p>
                    ) : (
                        <p>
                            Don't have an account? 
                            <button onClick={() => setIsSignUp(true)}>Sign Up</button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;