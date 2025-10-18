"use client"; // if using Next.js App Router

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo
} from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {FaFacebook} from "react-icons/fa6";
import {Input} from "@/components/ui/input";
import {GoogleLogin} from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import {Alert, AlertTitle, AlertDescription} from "@/components/ui/alert";
import {AlertCircleIcon} from "lucide-react";

const AuthContext = createContext();

const SIGN_IN = 'SIGN_IN';
const SIGN_UP = 'SIGN_UP';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // user object (e.g. {id, name, email})
  const [token, setToken] = useState(null); // JWT or session token
  const [isOpen, setIsOpen] = useState(false)
  const [isPhoneRequired, setIsPhoneRequired] = useState(false)
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(SIGN_IN)

  // Load token & user from localStorage (or cookies) on mount
  useEffect(() => {
    setLoading(true);
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Persist to localStorage whenever auth changes
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [token, user]);

  const login = async (credentials) => {
    setLoading(true);
    let request;
    switch (credentials.provider) {
      case 'google':
        request = { idToken: credentials.credential, provider: 'google' }
        break;
      default:
        request = {username: credentials.username, password: credentials.password};
    }

    const {data, status} = await axios.post('/api/auth', request);
    setLoading(false);
    if(status !== 200) return;

    const { user, token } = data?.data;
    localStorage.setItem('token', token);

    setToken(token);
    setUser(user);
    setIsOpen(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isValidToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return !(decoded.exp && decoded.exp < currentTime);
    } catch (err) {
      console.error("Invalid token format:", err);
      return false;
    }
  };

  const displayAuthModal = () => {
    console.log("Calling display auth")
    const storedToken = localStorage.getItem("token");
    // validate stored token is still valid
    const isTokenValid = false; // TODO: remember to validate this
    if (!isTokenValid) setIsOpen(true)
  }

  const toggleModal = () => setIsOpen(!isOpen);

  const handleEmailCheck = async (email) => {
    // do validation
    if (!email || typeof email !== "string") {
      return { error: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Invalid email format" };
    }

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check-email", email }),
    });

    const {isSignedUp} = await response.json();
    if (isSignedUp) {
      // show password button, else show signup modal
    }
  };

  return (<AuthContext.Provider value={{
        activeModal,
        user,
        token,
        handleEmailCheck,
        login,
        logout,
        setLoading,
        loading,
        isOpen,
        setIsOpen,
        displayAuthModal,
        toggleModal,
        setUser,
        setActiveModal,
        isValidToken
      }}>
      {children}
        <AuthModal />
      </AuthContext.Provider>
  );
};

const AuthModal = () => {
  const {activeModal, isOpen, toggleModal, loading, login, setActiveModal, setIsOpen, setLoading} = useAuth();
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [phone, setPhone] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [isSignedUp, setIsSignedUp] = useState(false)

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(null);
  }

  const handleEmailCheck = async () => {
    console.log("Email check started")
    // do validation
    if (!email || typeof email !== "string") {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check-email", email }),
    });

    const {isSignedUp} = await response.json();
    setIsSignedUp(isSignedUp)
    /*
      if not signed up, redirect to the signup page
      else redirect to password page
     */
  };

  const handleSignUp = async () => {
    // validate the form
    setError(null); // clear any existing error

    // --- Basic validation ---
    if (!firstName?.trim()) return setError("First name is required");
    if (!lastName?.trim()) return setError("Last name is required");
    if (!email?.trim()) return setError("Email is required");
    if (!phone?.trim()) return setError("Phone number is required");
    if (!password?.trim()) return setError("Password is required");
    if (!confirmPassword?.trim()) return setError("Please confirm your password");

    // --- Email validation ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("Invalid email format");

    // --- Phone validation (basic Nigerian format example, adjust as needed) ---
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phone)) return setError("Invalid phone number");

    // --- Password strength ---
    if (password.length < 8) return setError("Password must be at least 8 characters long");

    // --- Password match ---
    if (password !== confirmPassword) return setError("Passwords do not match");

    const data = {action: "signup", firstName, lastName, email, phone, password}

    setLoading(true);
    const response = await axios.post("/api/auth", data);
    if (response.status !== 200) {
      setError(response?.body?.error)
    }
    setLoading(false);
    const token = response.data.data.token;
    localStorage.setItem('token', token);
    setIsOpen(false);
  }

  const SignIn = useMemo(() => (
      <Dialog open={isOpen} onOpenChange={toggleModal}>
        <form>
          {/*Remove trigger after completing username/password sign in*/}
          <DialogTrigger asChild>
            <button className={`font-bold text-white w-full p-3 rounded-lg bg-black`}>
              Continue
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className={"text-3xl"}>Log in or Sign up</DialogTitle>
              <DialogDescription className={"text-sm"}>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid">
                <GoogleLogin
                    onSuccess={(data) => login({...data, provider: 'google'})}
                    onError={() => console.log('Google Login Failed')}
                    useOneTap
                />
              </div>

              <OrDivider />

              <div className="grid gap-3">
                <Input className={"py-5"} id="email" onChange={handleEmailChange} name="email" type="email" placeholder="Email"/>
              </div>
            </div>
            {error && <p className={"text-red-600 text-sm"}>{error}</p>}
            <DialogFooter>
              <Button className="w-full" type="button" isLoading={loading} onClick={handleEmailCheck}>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
  ), [toggleModal, loading, error])

  const SignUp = useMemo(() => (
      <Dialog open={isOpen && activeModal === 'SIGNUP'} onOpenChange={toggleModal}>
        <form>
          <DialogContent
              className="sm:max-w-[425px]"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-3xl">Sign up</DialogTitle>
              <DialogDescription className="text-sm">
                Create an account using Google or your email and password.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <GoogleLogin
                  onSuccess={(data) => login({ ...data, provider: "google" })}
                  onError={() => console.log("Google Login Failed")}
                  useOneTap
                  text="signup_with"
              />

              <OrDivider />

              <div className="grid grid-cols-2 gap-3">
                <Input className="py-5" id="firstName" onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
                <Input className="py-5" id="lastName" onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
              </div>

              <Input className="py-5" id="email" onChange={handleEmailChange} placeholder="Email" />
              <Input className="py-5" id="phone" onChange={(e) => setPhone(e.target.value)} placeholder="Mobile Number" />
              <Input className="py-5" id="password" onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
              <Input className="py-5" id="confirmPassword" onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <DialogFooter>
              <Button
                  className="w-full"
                  type="button"
                  isLoading={loading}
                  onClick={handleSignUp}
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
  ), [
    isOpen,
    toggleModal,
    handleEmailCheck,
    handleEmailChange,
    error,
    loading,
    login,
    setFirstName,
    setLastName,
    setPhone,
    setPassword,
    setConfirmPassword,
  ]);

  return (
      <>
        {activeModal === SIGN_IN ? SignIn : SignUp}
      </>
  );
}

const OrDivider = ({text = "OR"}) => (<div className="flex items-center my-2">
      <div className="flex-grow border-t border-gray-300"/>
      <span className="px-3 text-gray-500 text-sm">{text}</span>
      <div className="flex-grow border-t border-gray-300"/>
    </div>);


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};