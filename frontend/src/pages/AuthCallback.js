import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase"; // adjust path if needed
import axios from "axios";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Exchange the email verification token with Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
          console.error("Supabase session error:", error);
          navigate("/login?error=verification_failed");
          return;
        }

        const user = data.session.user;
        console.log("Verified Supabase user:", user);

        // Send verified user info to your backend (Mongo)
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/supabase-verify`,
          {
            email: user.email,
            supabaseId: user.id,
          }
        );

        navigate("/login?verified=true");
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
