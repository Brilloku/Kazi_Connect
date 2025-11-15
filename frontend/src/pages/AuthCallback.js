import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import axiosInstance from "../utils/axios";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email, please wait...");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
          console.error("Supabase session error:", error);
          navigate("/login?error=verification_failed");
          return;
        }

        const user = data.session.user;
        console.log("Verified Supabase user:", user);

        // Create MongoDB user profile (uses axiosInstance withCredentials)
        const response = await axiosInstance.post('/auth/createProfile', {
          supabase_id: user.id,
          email: user.email,
          name: user.user_metadata?.name,
          role: user.user_metadata?.role,
          location: user.user_metadata?.location,
          skills: user.user_metadata?.skills,
          phone: user.user_metadata?.phone
        });

        // Show welcome message
        const userName = response.data.user.name || user.user_metadata?.name || "User";
        setMessage(`Welcome ${userName}!`);
        setIsVerified(true);

        // Navigate to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("Verification error:", err);
        navigate("/login?error=verification_failed");
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg mb-4">{message}</p>
        {isVerified && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
