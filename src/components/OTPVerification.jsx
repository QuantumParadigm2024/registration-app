import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Grid } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function OTPVerification() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "example@gmail.com";
    const emph = location.state?.emph || "example@gmail.com";
    console.log(emph);
    // const query = new URLSearchParams(useLocation().search);
    // const email = query.get("email")
    console.log(email);

    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(60);

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

    const handleSubmit = async () => {
        try {
            const response = await axios.get(`http://localhost:1805/health-care/user-verify-otp?email=${encodeURIComponent(email || emph)}&otp=${otp}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
            if (response.data.status === "success") {
                alert("OTP Verified Successfully!");
                navigate("/login");
            }
        } catch (error) {
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
                    Your verification code has been sent to <b>{email}</b>. Check your email and enter the OTP code below
                    </Typography>
                    <TextField
                        label="Enter OTP"
                        variant="outlined"
                        fullWidth
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                            
                    />
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Didn’t receive the OTP?{timer > 0 ? `Resend in ${timer}s` : <Link href="#" sx={{ textDecoration: "none", fontWeight: 600 }} onClick={() => setTimer(60)}>
                            Resend OTP
                        </Link> }
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        sx={{ borderRadius: 3, fontSize: 16 ,padding:0.9}}
                        onClick={handleSubmit}
                    >
                        Verify
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
}
