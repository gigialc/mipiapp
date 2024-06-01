// Created by Paula Lopez Burgos and Beren Donmez
import { UserContextType, MyPaymentMetadata } from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import MuiBottomNavigation from "../../MuiBottomNavigation";
import SignIn from "../components/SignIn";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import Typography from "@mui/material/Typography";
import { UserContext } from "../components/Auth";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Grid } from '@mui/material';

export default function UserToAppPayments() {

  const navigate = useNavigate();

  const handleClick = (page: string) => {
    navigate(page);
  }

  const { user, saveUser, showModal, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;

  const orderProduct = async (memo: string, amount: number, paymentMetadata: MyPaymentMetadata) => {
    if(!user) {
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
         <Header user={user} onSignIn={signIn} onSignOut={signOut}/>

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

    {showModal && <SignIn onSignIn={saveUser} onModalClose={onModalClose} showModal={showModal} />}

    <MuiBottomNavigation />
    </>
  );
}