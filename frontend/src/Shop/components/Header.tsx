// Created by Georgina Alacaraz
import React, { useState, useEffect } from "react";
import { UserContextType, User } from "./Types";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Container } from "@mui/material";
import { UserContext } from "./Auth";
import axios from "axios";

const logoImageUrl = 'df2.png'; // Replace with actual logo image URL

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';


export default function Header() {
  const { user, saveUser } = React.useContext(UserContext) as UserContextType;
  const [coins, setCoins] = useState<number>(0);
  const [bio, setBio] = useState<string>('');

  const axiosClient = axios.create({
    baseURL: backendURL,
    timeout: 20000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${user?.accessToken || ''}`,
    }
  });

  //define the axios call to send the user info to the backend
  useEffect(() => {
    if (user) {
      axiosClient.get(`/user/userInfo`)
        .then((response) => {
          console.log('Response data for /user/me:', response.data);
          setCoins(response.data.coinbalance);
          console.log('Coins:', coins);
          setBio(response.data.bio);
        })
        .catch((error) => {
          console.error('Error fetching /user/me:', error);
        });
    }
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: 'white' }} elevation={0}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', paddingX: 0.4 }}>
          {/* Adjusted Logo Box */}
          <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', height: '80px', width: '140px' }}>
            <img src={logoImageUrl} alt="Destig Femme" style={{ height: 'auto', width: '100%', objectFit: 'cover' }} />
          </Box>

          <IconButton
                    size="small"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={user?.uid === '' ? (saveUser ) : (saveUser)}
                    color="inherit"
                  >
                  { user?.uid === '' ? (
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 , color:"black"}}>
                      Sign-In
                    </Typography>
                    ) : (
                  <Container>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 , color:"black"}}>
                    @{user?.username} - Sign Out
                    </Typography>
                  </Container>
              )}
              </IconButton>

        </Toolbar>
        <Typography component="div" sx={{ flexGrow: 1, color: 'black', textAlign: 'right', paddingRight: 4 }}>
          {coins} 💎 (rewards)
        </Typography>
      </AppBar>
    </Box>
  );
}
