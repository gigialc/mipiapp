// Created by Georgina Alacaraz
import { UserContextType, MyPaymentMetadata } from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import SignIn from "../components/SignIn";
import Header from "../components/Header";
import Typography from "@mui/material/Typography";
import { UserContext } from "../components/Auth";
import React from "react";
import MuiForm from "../components/MuiForm";
import axios from 'axios';
import { Types } from 'mongoose';
import { Rule } from "@mui/icons-material";
import RulesDialog from "../components/RulesDialog";


const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

/* DEVELOPER NOTE:
* this page facilitates the purchase of pies for pi. all of the callbacks
* can be found on the Payments.tsx file in components file. 
*/
export default function UserToAppPayments() {
  const { user, saveUser, saveShowModal, showModal,  onModalClose } = React.useContext(UserContext) as UserContextType;
  const [rulesDialogOpen, setRulesDialogOpen] = React.useState(false);
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

  const handleOpenRulesDialog = () => {
    setRulesDialogOpen(true);
  };

  const handleCloseRulesDialog = () => {
    setRulesDialogOpen(false);
  };

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
   <Header/>
  <div style={{ padding: '20px', marginBottom: '80px' }}>
  <Typography variant="h6" style={{ fontWeight: 'bold', color: '#E69BD1', marginBottom: '10px' }}>
        Create your own community ✨
    </Typography>
  <MuiForm />
  <Typography margin={1} color="black">
          <a href="" onClick={handleOpenRulesDialog} style={{ textDecoration: 'underline', color: '#E69BD1' }}>
            How to earn pi? Click here! 🌟
          </a>
        </Typography>
  </div>

  { showModal && <SignIn onSignIn={saveUser} onModalClose={onModalClose} showModal={showModal}/> }
  <RulesDialog open={rulesDialogOpen} onClose={handleCloseRulesDialog} />  {/* Add the RulesDialog component */}

</>
);

};
// Created by Georgina Alacaraz