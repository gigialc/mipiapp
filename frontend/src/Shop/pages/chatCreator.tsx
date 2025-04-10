import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContextType, MyPaymentMetadata } from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import axios from 'axios';
import { Button, Typography } from '@mui/material';
import Header from "../components/Header";
import Posts from "../components/posts";
import PostContent from "../components/PostContent";
import SignIn from "../components/SignIn";
import { UserContext } from "../components/Auth";

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

export default function ChatCreator() {
  const { user, saveUser, saveShowModal, showModal,  onModalClose } = React.useContext(UserContext) as UserContextType;
  const [community, setCommunity] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false); // New state to track following status
  const navigate = useNavigate(); // Hook from react-router-dom to navigate programmatically
  const location = useLocation();
  const communityId = location.state.communityId;

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

  // const handleFollow = () => {
  //   if (isFollowing) {
  //     // If already following, possibly implement "unfollow" logic here
  //     return;
  //   }
  //   // Assuming paymentMetadata needs to be defined or fetched before this call
  //   const paymentMetadata = {}; // Define or update this according to your actual data structure
  //   axiosClient.post(`/user/addUser`, paymentMetadata, config)
  //     .then((response) => {
  //       console.log(response);
  //       setIsFollowing(true); // Update follow status
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  return (
    <>
      <Header />
      <div style={{ padding: '15px' }}>
        <div style={{ marginBottom: '20px' }}>
          {community ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                  🩷 {community.title}
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
                  @{community.creator.username}
                </Button>
              </Typography>
              <Typography variant="subtitle1" style={{ marginTop: '10px' }}>
                {community.description}
              </Typography>
            </>
          ) : (
            <Typography variant="h6">Loading community details...</Typography>
          )}
        </div>
        <div>
          <PostContent communityId={communityId} />
          <Posts communityId={communityId} />
        </div>
      </div>
  
      { showModal && <SignIn onSignIn={saveUser} onModalClose={onModalClose} showModal={showModal}/> }
    </>
  );
  
  
}
