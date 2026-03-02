import axios from "axios";
import { useState } from "react";
import { Box, Button, Container, Divider, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, TextField, Typography, Grid, LinearProgress } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', password: '', dateOfBirth: '', gender: '' });
  const { fullName, email, phoneNumber, password, dateOfBirth, gender } = formData;
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });

    if (value.length > 8 && /[A-Z]/.test(value) && /[\d]/.test(value) && /[\W]/.test(value)) {
      setPasswordStrength(100);
    } else if (value.length >= 6) {
      setPasswordStrength(50);
    } else {
      setPasswordStrength(10);
    }
  };

  const handleSignup = async () => {
    if (!fullName || !email || !phoneNumber || !password || !dateOfBirth || !gender) {
      alert("Please fill all fields!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:1805/health-care/user-signup`, formData, {
        // params: {
        //   fullName,
        //   email,
        //   phoneNumber,
        //   password,
        //   dateOfBirth,
        //   gender
        // }

      });

      alert("Signup successful!");
      navigate("/otp-verification", { state: { email } }); 
      console.log(response.data);
    } catch (error) {
      console.error("Signup failed", error);
      alert("Signup failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" >
      <Container maxWidth="md">
        <Box display="flex" borderRadius={2} boxShadow={2} overflow="hidden">
          <Box flex={1} p={4} bgcolor="#9cc6f1" color="white" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
            <Typography variant="h4" fontWeight="bold" textAlign="center">
              Welcome to AI-Lume
            </Typography>
            <Typography variant="body1" textAlign="center" mt={1}>
              Join us today and experience the best services. Get started with your free account now!
            </Typography>
            <img src="https://www.neoito.com/blog/wp-content/uploads/2023/03/AI-in-Healthcare-Revolutionizing-the-Way-to-Treat-Patients.png" alt="Signup Illustration" style={{ width: "100%", maxWidth: "300px", marginTop: "20px", borderRadius: "10px" }} />
          </Box>

          <Box flex={1} bgcolor="white" p={4}>
            <Typography variant="h4" fontWeight="bold" textAlign="center">
              Sign up
            </Typography>

            <Typography variant="body2" textAlign="right" color="primary">
              <Link to="/login">Already have an account?</Link>
            </Typography>

            {/* <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full name" variant="outlined" required name="fullName" value={fullName} onChange={handleChange} />
              </Grid>
            </Grid> */}
                <TextField fullWidth label="Full name" variant="outlined" required name="fullName" value={fullName} onChange={handleChange} />
            <TextField fullWidth label="Email Address" variant="outlined" margin="normal" type="email" name="email" required value={email} onChange={handleChange} />
            <TextField fullWidth label="Phone No" variant="outlined" margin="normal" type="number" name="phoneNumber" required value={phoneNumber} onChange={handleChange} />
            
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Password</InputLabel>
              <OutlinedInput
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                endAdornment={
                  <InputAdornment position="end">
                    <VisibilityOff onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }} />
                  </InputAdornment>
                }
                label="Password"
                required
                name="password"
              />
            </FormControl>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: "#fafdff", borderRadius: "8px" }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select
                value={gender}
                onChange={handleChange}
                label="Gender"
                displayEmpty
                sx={{ bgcolor: "#fff", borderRadius: 1 }}
                required
                name="gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            {password.length > 0 && (
              <>
                <LinearProgress variant="determinate" value={passwordStrength} sx={{ height: 8, mt: 1, borderRadius: 1 }} />
                <Typography variant="body2" color={passwordStrength < 50 ? "error" : passwordStrength < 100 ? "warning.main" : "success.main"}>
                  {passwordStrength < 50 ? "Weak" : passwordStrength < 100 ? "Medium" : "Strong"}
                </Typography>
              </>
            )}

            <Typography variant="body2" sx={{ mt: 2 }}>
              By signing up, you agree to our <Link href="#">Terms of Service</Link> and <Link href="#">Privacy Policy</Link>.
            </Typography>

            <Button fullWidth variant="contained" sx={{ mt: 3, bgcolor: "#007bff", color: "white", "&:hover": { bgcolor: "#0056b3" } }} onClick={handleSignup} disabled={loading}>
              {loading ? "Signing Up..." : "Create Account"}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Signup;