import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import axiosInstance from "../utils/axios";

const AuthCallback = () => {
  const navigate = useNavigate();

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
        await axiosInstance.post('/auth/createProfile', {
          supabase_id: user.id,
          email: user.email,
          name: user.user_metadata?.name,
          role: user.user_metadata?.role,
          location: user.user_metadata?.location,
          skills: user.user_metadata?.skills,
          phone: user.user_metadata?.phone
        });

        navigate("/dashboard");
      } catch (err) {
        console.error("Verification error:", err);
        navigate("/login?error=verification_failed");
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Verifying your email, please wait...</p>
    </div>
  );
};

export default AuthCallback;
