// Created by Georgina Alacaraz
import { UserContextType , CommunityType, MyPaymentMetadata} from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import Header from "../components/Header";
import Typography from "@mui/material/Typography";
import { UserContext } from "../components/Auth";
import React, { useEffect, useState } from "react";
import axios from 'axios';
import {UserData } from "../components/Types";
import { useLocation } from 'react-router-dom';
import { Paper, Grid, Avatar, Link } from '@mui/material';
import SignIn from "../components/SignIn";


const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

export default function  PublicProfile() {
  const { user, saveUser, saveShowModal, showModal,  onModalClose } = React.useContext(UserContext) as UserContextType;
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[] | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType[] | null>(null); // Moved here
  const [community, setCommunity] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const location = useLocation();
  const userId = location.state?.userId;


  const axiosClient = axios.create({
    baseURL: backendURL,
    timeout: 20000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const orderProduct = async (memo: string, amount: number, paymentMetadata: MyPaymentMetadata) => {
    if(user?.uid === "") {
      return saveShowModal(true);
    }

    const paymentData = { amount, memo, metadata: paymentMetadata };
    const callbacks = {
      onReadyForServerApproval,
      onReadyForServerCompletion,
      onCancel,
      onError
    };

    const payment = await window.Pi.createPayment(paymentData, callbacks);
    console.log(payment);
  }

  useEffect(() => {
    if (!userId) return;
    axiosClient.get(`/user/public/${userId}`)
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }, [userId]);

  if (!userData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <Header />
      <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography >alt={userData.username} </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="h5">@{userData.username}</Typography>
            <Typography variant="body1">{userData.coinbalance} 💎</Typography>
            <Typography variant="body2">{userData.bio || 'Bio not available.'}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
