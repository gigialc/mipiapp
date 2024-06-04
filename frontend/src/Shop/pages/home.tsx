// Created by Georgina Alacaraz
import MuiBottomNavigation from "../../MuiBottomNavigation";
import Header from "../components/Header";
import { Box, Grid, Typography } from "@mui/material";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import { UserContextType, MyPaymentMetadata , CommunityType} from "../components/Types";
import SignIn from "../components/SignIn";
import ProductCard from "../components/ProductCard";
import { UserContext } from "../components/Auth";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';
const config = { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } };

export default function HomePage() {
  const { user, saveUser, saveShowModal, showModal, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[] | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType | null>(null);
  const navigate = useNavigate();

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

  // Make an API call to add person to the community if the payment was successful
  // if (payment.paymentCompleted === true) {
  console.log("Payment was successful");
  axiosClient.post(`/user/addUser`)
    .then((response) => {
      console.log(response);
      // Redirect to the chat page
      navigate("/Chat", { state: { communityId: selectedCommunity?._id } });
    })
    .catch((error) => {
      console.log(error);
    });
  // }

  useEffect(() => {
    console.log(createCommunityData);
  }, [createCommunityData]);

  useEffect(() => {
    axiosClient.get(`/user/userInfo`)
      .then((response) => {
        console.log('Response data for /user/me:', response.data);
      })
      .catch((error) => {
        console.error('Error fetching /user/me:', error);
      });
  }, []);

  useEffect(() => {
    // Make an API call to fetch the create community data
    axiosClient.get(`/community/hi`)
      .then((response) => {
        console.log(response);
        setCreateCommunityData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    axiosClient.get(`/user/joined`)
      .then((response) => {
        console.log('Joined communities:', response.data);
        setSelectedCommunity(response.data);
      })
      .catch((error) => {
        console.error('Error fetching joined communities:', error);
      });
  }, []);

  return (
    <>
      <Header  />
      <Typography variant="h5" style={{ fontWeight: 'bold', color: '#E69BD1', marginBottom: '10px', marginLeft: 20 }}>
        Communities ✨
      </Typography>
      {createCommunityData ? (
        createCommunityData.map((community) => {
          console.log(community);
          return (
            <ProductCard
              key={community._id} // Make sure to include a unique key prop for each element in the array
              name={community.name}
              description={community.description}
              price={community.price}
              owner={community.user && (community.user as any).username} // Ensure owner is correctly referenced
              community={community}
            />
          );
        })
      ) : (
        <Typography variant="body1" style={{ color: '#ff69b4' }}>No community data available</Typography>
      )}

      { showModal && <SignIn onSignIn={saveUser} onModalClose={onModalClose} showModal={showModal}/> }

      <div style={{ paddingTop: '20px' }}> {/* Add padding here */}
        <br />
        <br />
        <br />
        <br />
        <MuiBottomNavigation />
      </div>
    </>
  );
}
