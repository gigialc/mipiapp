import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Typography } from '@mui/material';
import Header from "../components/Header";
import PostContent from "../components/PostContent";
import { UserContext } from "../components/Auth";
import { UserContextType } from "../components/Types";
import { CommunityType } from "../components/Types";
import { Box } from '@mui/system';
import {Types} from 'mongoose';
import { CommentType, PostType } from "../components/Types";
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

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://api.destigfemme.com';

const axiosClient = axios.create({
  baseURL: backendURL,
  timeout: 20000,
  withCredentials: true,
  headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
  }
});
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

export default function Chat() {
  const {  saveUser,onModalClose } = useContext(UserContext) as UserContextType;
  const [community, setCommunity] = useState<any>(null);
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[] | null>(null);;
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  


  const navigate = useNavigate();
  const location = useLocation();
  const communityId = location.state?.communityId;

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


  const handleNavigatePublicProfile = (communityId: string) => {
    navigate("/PublicProfile", { state: { communityId } });
  }

  useEffect(() => {
    if (!communityId) return;
    axiosClient.get(`/community/community/${communityId}`)
      .then((response) => {
        setCommunity(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [communityId]);

  const handleFollow = () => {
    if (isFollowing) {
      axiosClient.post("/users/joined", { communityId: communityId })
        .then((response) => {
          console.log(response);
          setIsFollowing(false);
        })
        .catch((error) => {
          console.error(error);
        });

      return;
    }
  
    // Ensure this matches what your backend expects
    const data = {
      userId: user,
      communityId: communityId, 
    };
  
    axiosClient.post('/user/addUser', data)
      .then((response) => {
        console.log('Response:', response);
        setIsFollowing(true); // Update following state based on response
        // Optionally, refresh or update the community data to reflect the new state
      })
      .catch((error) => {
        console.error('Error:', error);
      });

  }

  return (
    <>
       <Header user={user} onSignIn={signIn} onSignOut={signOut}/>
      <div style={{ padding: '15px' }}>
        <div style={{ marginBottom: '20px' }}>
          {community ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                {community.name}
                </Typography>
                {/* <Button
                  variant="contained"
                  onClick={handleFollow}
                  style={{ borderRadius: 20, backgroundColor: isFollowing ? '#D3D3D3' : '#9E4291', color: 'white', textTransform: 'none' }}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button> */}
              </div>
              <Typography variant="subtitle1" style={{ marginTop: '0px' }}>
                {/* user button */}
                <Button
                  style={{
                    color: '#4C4E52',
                    textTransform: 'none',
                    padding: 0, // Remove padding if you want the button to look like plain text
                    minWidth: 0, // Use this to prevent the button from having a minimum size
                  }}
                  onClick={() => handleNavigatePublicProfile(communityId)}
                >
                  @{community.user.username}
                </Button>

              </Typography>
              <Typography variant="body1" style={{ marginTop: '10px' }}>
                {community.description}
              </Typography>
            </>
          ) : (
            <Typography variant="h6">Loading community details...</Typography>
          )}
        </div>
        <div>
          <PostContent communityId={communityId} />

        </div>
      </div>
      <br />
      <br />
      <br />

      { showModal && <SignIn onSignIn={signIn} onModalClose={onModalClose} /> }
    </>
  );
  
}
