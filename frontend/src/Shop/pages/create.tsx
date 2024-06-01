// Created by Georgina Alacaraz
import { UserContextType, PostType, CommentType, CommunityType } from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import SignIn from "../components/SignIn";
import MuiBottomNavigation from "../../MuiBottomNavigation";
import Header from "../components/Header";
import Typography from "@mui/material/Typography";
import { UserContext } from "../components/Auth";
import React from "react";
import MuiForm from "../components/MuiForm";
import PostContent from "../components/PostContent";
import Posts from "../components/posts";
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Types } from 'mongoose';


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

const axiosClient = axios.create({ baseURL: backendURL, timeout: 20000, withCredentials: true });
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

/* DEVELOPER NOTE:
* this page facilitates the purchase of pies for pi. all of the callbacks
* can be found on the Payments.tsx file in components file. 
*/
export default function UserToAppPayments() {
  const {  saveUser, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [showModal, setShowModal] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);

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

return(
  <>
   <Header user={user} onSignIn={signIn} onSignOut={signOut}/>
  <div style={{ padding: '20px', marginBottom: '80px' }}>
  <Typography variant="h6" style={{ fontWeight: 'bold', color: '#E69BD1', marginBottom: '10px' }}>
        Create your own community ✨
    </Typography>
    <Typography  margin={1}  color="black" style={{ } }>
     Create your own community and start earning pi 💸
    </Typography>
  <MuiForm />
  </div>

  { showModal && <SignIn onSignIn={signIn} onModalClose={onModalClose} /> }
</>
);

};
// Created by Georgina Alacaraz