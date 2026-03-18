import React from 'react'
import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Grid } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateOTPVerification = () => {


    const location = useLocation();
    const navigate = useNavigate();
    const emph = location.state?.emph 
    console.log(emph);
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(60);
    const [error, seterror]= useState("")

    useEffect(() => {
        if (timer > 0) {
            const countdown = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(countdown);
        }
    }, [timer])

    const handleChange = (index, value) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
        }
    }

    const handleResendOTP= async ()=>{
        try {
            const response= await axios.post(`http://localhost:1805/health-care/resend-otp?emph=${encodeURIComponent(emph)}`,{
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
            console.log(response);
        } catch (error) {
            
        }
    }

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`http://localhost:1805/health-care/verify-otp?emph=${encodeURIComponent(emph)}&otp=${otp}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
            if (response.data.status === "success") {
                alert("OTP Verified Successfully!", { state: { emph } });
                navigate("/update-password");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const { message } = error.response.data;
                seterror(message);
            }
            console.error("Error verifying OTP:", error);
        }
    }
    return (
        <Grid container sx={{ minHeight: "100vh", alignItems: "center", px: 5, boxShadow: "0" }}>
            <Grid item xs={12} md={6} sx={{ textAlign: "center" }}>
                <img src="https://png.pngtree.com/png-clipart/20230824/original/pngtree-ai-use-in-healthcare-abstract-concept-vector-illustration-picture-image_8431326.png" alt="" width="60%" />
                <Typography variant="h5" fontWeight={500} sx={{ mt: 2 }}>
                    Monitor Your Patient Health Anytime
                </Typography>
                <Typography variant="body1" sx={{ color: "gray" }}>
                    Smarter, Faster & More Effective with AI
                </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
                <Box sx={{ maxWidth: 400, mx: "auto", textAlign: "center", p: 3 }}>
                    <Typography variant="h5" fontWeight={600}>
                        Verification
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, mb: 2, color: "gray" }}>
                        Your verification code has been sent to <b>{emph}</b>. Check your email and enter the OTP code below
                    </Typography>
                    <TextField
                        label="Enter OTP"
                        variant="outlined"
                        fullWidth
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        sx={{ mb: 2 }}
                        FormHelperTextProps={{
                            sx: { color: 'red' }
                          }}
                        helperText={error}
                        
                    />
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Didn’t receive the OTP?{timer > 0 ? `Resend in ${timer}s` : <Link href="#" sx={{ textDecoration: "none", fontWeight: 600 }} onClick={() => setTimer(60) || handleResendOTP}>
                            Resend OTP
                        </Link>}
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        sx={{ borderRadius: 3, fontSize: 16, padding: 0.9 }}
                        onClick={handleSubmit}
                    >
                        Verify
                    </Button>
                </Box>
            </Grid>
        </Grid>
    )
}

export default UpdateOTPVerification