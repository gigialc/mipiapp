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

interface LocationState {
  communityId: string;
}

export default function PublicProfile() {
  const { user, saveUser, saveShowModal, showModal, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[] | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType[] | null>(null);
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorData, setCreatorData] = useState<UserData | null>(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get(`/community/community/${communityId}`);
        const community = response.data;
        setCommunity(community);
        // Fetch creator data
        const creatorResponse = await axiosClient.get(`/user/userInfo/${community.creator.uid}`);
        const creatorData = creatorResponse.data;
        setCreatorData(creatorData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
        setLoading(false);
      }
    }
    fetchData();
  }
  , [communityId]);




  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!community) {
    return <Typography>No user data available.</Typography>;
  }

  return (
    <>
      <Header />
      <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar alt={creatorData?.username}  />
          </Grid>
          <Grid item xs>
            <Typography variant="h5">@{creatorData?.username}</Typography>
            <Typography variant="body1">{creatorData?.coinbalance} 💎</Typography>
            <Typography variant="body2">{creatorData?.bio || 'Bio not available.'}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
