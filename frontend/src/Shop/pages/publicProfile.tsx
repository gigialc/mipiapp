// Created by Georgina Alacaraz
import { UserContextType , CommunityType, CommentType, PostType} from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import Header from "../components/Header";
import Typography from "@mui/material/Typography";
import { UserContext } from "../components/Auth";
import React, { useEffect, useState,SyntheticEvent } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {UserData } from "../components/Types";
import { Tabs, Tab, Box } from "@mui/material";
import MyList from "../mylist";
import Subscribed from "../components/subscribed";
import { TextField, Button } from '@mui/material';
import EditProfile from "../components/editProfile";
import { useLocation } from 'react-router-dom';
import { Paper, Grid, Avatar, Link } from '@mui/material';
import {Types} from 'mongoose';
import SignIn from "../components/SignIn";

type MyPaymentMetadata = {};

type AuthResult = {
  accessToken: string,
  user: {
  uid: string;
  username: string;
  bio: string;
  coinbalance: number;
  communitiesCreated: Types.ObjectId[];
  communitiesJoined: Types.ObjectId[];
  likes: string[]; // Changed from ObjectId[] to string[]
  comments: CommentType[]; // Assuming CommentType is defined elsewhere
  posts: PostType[]; // Assuming PostType is defined elsewhere
  timestamp: Date;
  accessToken: string; // Added
  community: CommunityType[]; // Added, assuming CommunityType is defined elsewhere
  date: Date;
  }
};

interface PaymentDTO {
  amount: number,
  user_uid: string,
  created_at: string,
  identifier: string,
  metadata: Object,
  memo: string,
  status: {
    developer_approved: boolean,
    transaction_verified: boolean,
    developer_completed: boolean,
    cancelled: boolean,
    user_cancelled: boolean,
  },
  to_address: string,
  transaction: null | {
    txid: string,
    verified: boolean,
    _link: string,
  },
};

export type User = AuthResult['user'];

// Make TS accept the existence of our window.__ENV object - defined in index.html:
const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://api.destigfemme.com';

const axiosClient = axios.create({ baseURL: backendURL, timeout: 20000, withCredentials: true });
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

export default function  PublicProfile() {
  const {  saveUser, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[] | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType[] | null>(null); // Moved here
  const [community, setCommunity] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const location = useLocation();
  const communityId = location.state?.communityId;
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [bio, setBio] = useState("");
  const [coins, setCoins] = useState(0);
  const [username, setUsername] = useState("");


  const signIn = async () => {
    const scopes = ['username', 'payments'];
    const authResult: AuthResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
    signInUser(authResult);
    setUser(authResult.user);
  }

  const signOut = () => {
    setUser(null);
    signOutUser();
  }

  const signInUser = (authResult: AuthResult) => {
    axiosClient.post('/user/signin', {authResult});
    return setShowModal(false);
  }

  const signOutUser = () => {
    return axiosClient.get('/user/signout');
  }

  const orderProduct = async (memo: string, amount: number, paymentMetadata: MyPaymentMetadata) => {
    if(user === null) {
      return setShowModal(true);
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

  const onIncompletePaymentFound = (payment: PaymentDTO) => {
    console.log("onIncompletePaymentFound", payment);
    return axiosClient.post('/payments/incomplete', {payment});
  }

  const onReadyForServerApproval = (paymentId: string) => {
    console.log("onReadyForServerApproval", paymentId);
    axiosClient.post('/payments/approve', {paymentId}, config);
  }

  const onReadyForServerCompletion = (paymentId: string, txid: string) => {
    console.log("onReadyForServerCompletion", paymentId, txid);
    axiosClient.post('/payments/complete', {paymentId, txid}, config);
  }

  const onCancel = (paymentId: string) => {
    console.log("onCancel", paymentId);
    return axiosClient.post('/payments/cancelled_payment', {paymentId});
  }

  const onError = (error: Error, payment?: PaymentDTO) => {
    console.log("onError", error);
    if (payment) {
      console.log(payment);
      // handle the error accordingly
    }
  }

    useEffect(() => {
      if (!communityId) return;
      axiosClient.get(`/community/community/${communityId}`)
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
  <Header user={user} onSignIn={signIn} onSignOut={signOut}/>
  <Paper style={{ padding: 16, margin: '16px auto', maxWidth: 600, boxShadow: 'none' }}>
    <Grid container direction="column" alignItems="center" justifyContent="center" spacing={2}>
      {community?.user && (
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

          { showModal && <SignIn onSignIn={signIn} onModalClose={onModalClose} /> }
        </>
      )}
    </Grid>
  </Paper>
</>

    );
  }
  
