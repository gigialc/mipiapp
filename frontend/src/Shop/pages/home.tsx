// Created by Georgina Alacaraz
import MuiBottomNavigation from "../../MuiBottomNavigation";
import Header from "../components/Header";
import { Box, Grid, Typography } from "@mui/material";
import { UserContextType , CommunityType, CommentType, PostType} from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import SignIn from "../components/SignIn";
import ProductCard from "../components/ProductCard";
import { UserContext } from "../components/Auth";
import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { UserData } from "../components/Types";
import axios from 'axios';
import { Types } from 'mongoose';
import { User } from "../components/Types";

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

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://api.destigfemme.com';

const axiosClient = axios.create({ baseURL: backendURL, timeout: 20000, withCredentials: true });
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};


export default function HomePage() {
  const {  saveUser, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType; // also added this!!!!!!
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[] | null>(null);;
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType | null>(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
 
  

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

    //make a payment
    //const payment = await window.Pi.createPayment(paymentData, callbacks);

    // Make an API call to add person to the community if the payment was successful
    //if (payment.paymentCompleted === true){
      console.log("Payment was successful");
        axiosClient.post('/user/addUser')
            .then((response) => {
            console.log(response);
             // Redirect to the chat page
              navigate("/Chat", { state: { communityId: selectedCommunity?._id } });
            })
            .catch((error) => {
            console.log(error);
            });
         //}

  useEffect(() => {
    console.log(createCommunityData);
  }, [createCommunityData]);

  useEffect(() => {
    axiosClient.get('/user/userInfo')
      .then((response) => {
        console.log('Response data for /user/me:', response.data);
      })  
      .catch((error) => {
        console.error('Error fetching /user/me:', error);
      });

    }
  , []);

  useEffect(() => {
    // Make an API call to fetch the create community data
    axiosClient.get('/community/hi')
            .then((response) => {
            console.log(response);
            setCreateCommunityData(response.data);
            console.log(response.data);
          
            })
            .catch((error) => {
            console.log(error);
            });
        }
    
    , []);

  useEffect(() => {
    axiosClient.get('/user/joined')
      .then((response) => {
        console.log('Joined communities:', response.data);
        setSelectedCommunity(response.data);
      })  
      .catch((error) => {
        console.error('Error fetching joined communities:', error);
      });
  }
  , []);

return(
  <>
   <Header user={user} onSignIn={signIn} onSignOut={signOut}/>
  <Typography variant="h5" style={{ fontWeight: 'bold', color: '#E69BD1', marginBottom: '10px' , marginLeft: 20 }}>
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
          //user who created the community
          owner={community.user && (community.user as any).username}
          community={community}
        />
      );
    })
  ) : (
    <Typography variant="body1" style={{ color: '#ff69b4' }}>No community data available</Typography>
  )}

  {showModal && <SignIn onSignIn={saveUser} onModalClose={onModalClose} showModal={showModal}/> }

  <div style={{ paddingTop: '20px' }}> {/* Add padding here */}
  <br />
  <br />
  <br />
  <br />
    <MuiBottomNavigation/>
  </div>
</>
);
}

