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

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://api.destigfemme.com';

const axiosClient = axios.create({ baseURL: backendURL, timeout: 20000, withCredentials: true });
const config = { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } };

interface HeaderProps {
  onSignIn: () => void;
  onSignOut: () => void;
  user: User | null;
}

export default function Header({ onSignIn, onSignOut, user }: HeaderProps) {
  const [coins, setCoins] = useState(user?.coinbalance || 0);

  useEffect(() => {
    if (user) {
      axiosClient.get(`${backendURL}/api/user/userInfo`)
        .then((response) => {
          console.log('Response data for /user/me:', response.data);
          setCoins(response.data.coinbalance);
          console.log('Coins:', coins);
        })
        .catch((error) => {
          console.error('Error fetching /user/me:', error);
        });
    }
  }, [user]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: 'white' }} elevation={0}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', paddingX: 0.4 }}>
          {/* Adjusted Logo Box */}
          <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden', height: '80px', width: '140px' }}>
            <img src={logoImageUrl} alt="Destig Femme" style={{ height: 'auto', width: '100%', objectFit: 'cover' }} />
          </Box>

          {user === null ? (
            <button onClick={onSignIn}>Sign in</button>
          ) : (
            <div>
              @{user.username} <button type="button" onClick={onSignOut}>Sign out</button>
            </div>
          )}

        </Toolbar>
        <Typography component="div" sx={{ flexGrow: 1, color: 'black', textAlign: 'right', paddingRight: 4 }}>
          {coins} 💎 (rewards)
        </Typography>
      </AppBar>
    </Box>
  );
}
