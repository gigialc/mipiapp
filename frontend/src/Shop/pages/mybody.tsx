// Created by Paula Lopez Burgos and Beren Donmez
import { UserContextType, MyPaymentMetadata } from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import MuiBottomNavigation from "../../MuiBottomNavigation";
import SignIn from "../components/SignIn";
import Header from "../components/Header";
import Typography from "@mui/material/Typography";
import { UserContext } from "../components/Auth";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Grid } from '@mui/material';
import axios from 'axios';


const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

export default function UserToAppPayments() {
  const { user, saveUser, saveShowModal, showModal,  onModalClose } = React.useContext(UserContext) as UserContextType;

  const axiosClient = axios.create({
    baseURL: backendURL,
    timeout: 20000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'user': user? user.accessToken : ''
    }
  });
  const navigate = useNavigate();

  const handleClick = (page: string) => {
    navigate(page);
  }

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


return(
    <>
      <Header />

      <Typography variant="h5" margin={2} color="#9E4291">
        Body Image
      </Typography>

      {/* Replace Mybodycard components with buttons */}
      <Button variant='contained'sx={{ marginBottom: '16px', width: '100%',backgroundColor: '#ffe6ff', color: 'black', padding: '12px', margin: '12px',borderRadius: '30px' }} onClick={() => handleClick('/socialmediaBlog')}>
        Why are so many people on social media so perfect?
      </Button>

      <Button variant='contained' color='secondary'sx={{ marginBottom: '16px', width: '100%',backgroundColor: '#ffe6ff', color: 'black', padding: '12px', margin: '12px',borderRadius: "30px" }} onClick={() => handleClick('/BodyImage')}>
      "Perfect" Body Image Stereotypes in Society
      </Button>

      <Button variant='contained' color='secondary'sx={{ marginBottom: '16px', width: '100%',backgroundColor: '#ffe6ff', color: 'black', padding: '12px', margin: '12px',borderRadius: "30px" }} onClick={() => handleClick('/Blogilates')}>
        Blogilates on Body Image 
      </Button>

      <Button variant='contained' color='secondary'sx={{marginBottom: '16px', width: '100%',backgroundColor: '#ffe6ff', color: 'black', padding: '12px', margin: '12px',borderRadius: "30px" }} onClick={() => handleClick('/Eatingdisorders')}>
        Social Media Use and Body Image Disorders
      </Button>
      {/* Remove the Mybodycard components */}

      { showModal && <SignIn onSignIn={saveUser} onModalClose={onModalClose} showModal={showModal}/> }

    <MuiBottomNavigation />
    </>
  );
}