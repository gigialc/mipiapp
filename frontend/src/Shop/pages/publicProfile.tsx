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
  const communityId = location.state?.communityId;

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
      if (!communityId) return;
      axiosClient.get(`/community/community/${communityId}`, config)
        .then((response) => {
          setCommunity(response.data);
          setUserData(response.data);

        })
        .catch((error) => {
          console.error(error);
        });
    }, [communityId]);

    return (
      <>
  <Header/>
  <Paper style={{ padding: 16, margin: '16px auto', maxWidth: 600, boxShadow: 'none' }}>
    <Grid container direction="column" alignItems="center" justifyContent="center" spacing={2}>
      {community.user && (
        <>
          <Grid item>
            <Avatar
              alt={community.user.username}
              // src={community.user.avatarUrl} // Uncomment and use the actual path to the avatar image
              sx={{ width: 100, height: 100 }} // Adjust size as needed
            />
          </Grid>
          <Grid item>
            <Typography variant="h5" component="h1" color="black" gutterBottom>
              @{community.user.username}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1" color="textSecondary">
              {community.user.coinbalance} 💎
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="body1">
              {community.user.bio || 'Bio not available.'}
            </Typography>
          </Grid>

          { showModal && <SignIn onSignIn={saveUser} onModalClose={onModalClose} showModal={showModal}/> }
        </>
      )}
    </Grid>
  </Paper>
</>

    );
  }
  
