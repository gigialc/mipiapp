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
import { UserData } from "../components/Types";


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
    console.log(createCommunityData);
  }, [createCommunityData]);

  useEffect(() => {
    // Make an API call to fetch the create community data
    axiosClient.get(`/community/hi`)
      .then((response) => {
        console.log('Response data for /community/hi:', response.data);
        setCreateCommunityData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching /community/hi:', error);
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
              title={community.title}
              description={community.description}
              creator={community.creator as any}
              price={community.price}
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
