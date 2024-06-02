// Created by Georgina Alacaraz
import { UserContextType,PostType, CommentType, CommunityType  } from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import SignIn from "../components/SignIn";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import Typography from "@mui/material/Typography";
import { UserContext } from "../components/Auth";
import React from "react";
import MuiBottomNavigation from "../../MuiBottomNavigation";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { useNavigate } from 'react-router-dom';
import {ObjectId, Types } from 'mongoose';
import { useState } from "react";
import axios from 'axios';
import { PaymentDTO } from "../components/Types";
import { SyntheticEvent } from 'react';

/* DEVELOPER NOTE:
* this page facilitates the purchase of pies for pi. all of the callbacks
* can be found on the Payments.tsx file in components file. 
*/

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


export default function UserToAppPayments() {
  const {  saveUser, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);

  const handleClick = (page: string) => {
    navigate(page);
  }

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

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
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
        
    <br></br>
        
               
    <div style={{ overflowY: 'auto', height: '150vh',marginLeft: '20px' }}>
    
<h2 style={{ color: '#9E4291', fontFamily: 'comic-sans' }}>Body Image</h2>
<div style={{ display: "flex", overflowX: "auto" }}>
{/* Scrollable container for text boxes */}
<div style={{ display: "flex", marginRight: "10px" }}>
{/* First text box content */}
<Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px", backgroundColor: "white",border: '2px solid #ef9a9a'}}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  Why Do People on Social Media Seem So Perfect?
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> {/* Add this div for bottom alignment */}
<Button variant='contained' color='secondary'sx={{  backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/SocialMediaBlog')}>
  Read More
</Button>
</div>
</Paper>

<div style={{ display: "flex", overflowX: "auto" }}>
{/* Scrollable container for text boxes */}
<div style={{ display: "flex", marginRight: "10px" }}>
{/* First text box content */}
<Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px", backgroundColor: "white",border: '2px solid #ef9a9a'}}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  Blogilates on Body Image
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> {/* Add this div for bottom alignment */}
<Button variant='contained' color='secondary'sx={{ backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/Blogilates')}>
  Read More
</Button>
</div>
</Paper>

<div style={{ display: "flex", overflowX: "auto" }}>
{/* Scrollable container for text boxes */}
<div style={{ display: "flex", marginRight: "10px" }}>
{/* First text box content */}
<Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px",backgroundColor: "white",border: '2px solid #ef9a9a'}}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  "Perfect" Body Image Stereotypes in Society
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> {/* Add this div for bottom alignment */}
<Button variant='contained' color='secondary'sx={{  backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/BodyImage')}>
  Read More
</Button>
</div>
</Paper>

<div style={{ display: "flex", overflowX: "auto" }}>
{/* Scrollable container for text boxes */}
<div style={{ display: "flex", marginRight: "10px" }}>
{/* First text box content */}
<Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px", backgroundColor: "white",border: '2px solid #ef9a9a'}}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  Social Media Use and Body Image Disorders
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> {/* Add this div for bottom alignment */}
<Button variant='contained' color='secondary'sx={{  backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/Eatingdisorders')}>
  Read More
</Button>
</div>
</Paper>

</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div> 

<br />

{/* <h2 style={{ color: '#9E4291', fontFamily: 'comic-sans' }}>Sex Education</h2>
<div style={{ display: "flex", overflowX: "auto" }}>

<div style={{ display: "flex", marginRight: "10px" }}>

<Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px", backgroundColor: "white",border: '2px solid #ef9a9a'}}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  Contraception Methods and their Importance
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> 
<Button variant='contained' color='secondary'sx={{  backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/sexed')}>
  Read More
</Button>
</div>
</Paper>

<div style={{ display: "flex", overflowX: "auto" }}>

<div style={{ display: "flex", marginRight: "10px" }}>

<Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px",backgroundColor: "white",border: '2px solid #ef9a9a'}}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  Sexual Education and Parenting
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> 
<Button variant='contained' color='secondary'sx={{   backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/sexed')}>
  Read More
</Button>
</div>
</Paper> */}

<div style={{ display: "flex", overflowX: "auto" }}>
{/* Scrollable container for text boxes */}
<div style={{ display: "flex", marginRight: "10px" }}>
{/* First text box content */}
{/* <Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px", backgroundColor: "white",border: '2px solid #ef9a9a'}}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  Covid-19 vs Sexual Health
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> 
<Button variant='contained' color='secondary'sx={{   backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/sexed')}>
  Read More
</Button>
</div>
</Paper> */}

{/* </div>
</div> */}
{/* </div> */}
{/* </div> */}
 </div>
 </div>

<br />

<h2 style={{ color: '#9E4291', fontFamily: 'comic-sans' }}>Trending Blogs</h2>
<div style={{ display: "flex", overflowX: "auto" }}>
{/* Scrollable container for text boxes */}
<div style={{ display: "flex", marginRight: "10px" }}>
{/* First text box content */}
<Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px", backgroundColor: "white",border: '2px solid #ef9a9a'}}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  Confidence and Body Image
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> {/* Add this div for bottom alignment */}
<Button variant='contained' color='secondary'sx={{  backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/mybody')}>
  Read More
</Button>
</div>
</Paper>

{/* <div style={{ display: "flex", overflowX: "auto" }}>
{/* Scrollable container for text boxes */}
<div style={{ display: "flex", marginRight: "10px" }}>
{/* First text box content */}
{/* <Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px", backgroundColor: "white",border: '2px solid #ef9a9a'}}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  IBS
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> 
<Button variant='contained' color='secondary'sx={{  backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/mybody')}>
  Read More
</Button>
</div>
</Paper> */}

<div style={{ display: "flex", overflowX: "auto" }}>
{/* Scrollable container for text boxes */}
<div style={{ display: "flex", marginRight: "10px" }}>
{/* First text box content */}
{/* <Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px", backgroundColor: "white",border: '2px solid #ef9a9a'}}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  First Time Mother Diaries
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> 
<Button variant='contained' color='secondary'sx={{ backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/mybody')}>
  Read More
</Button>
</div>
</Paper> */}

<div style={{ display: "flex", overflowX: "auto" }}>
{/* Scrollable container for text boxes */}
<div style={{ display: "flex", marginRight: "10px" }}>
{/* First text box content */}
{/* <Paper style={{ display: 'flex', flexDirection: 'column', width: "200px", padding: "10px", marginRight: "10px", backgroundColor: "white" }}>
<Typography variant="h6" style={{ fontFamily: 'Your Chosen Font', fontSize: '20px', marginBottom: '8px' }}>
  Menstruation Changes
</Typography>
<Typography variant="body2"> 

</Typography>
<div style={{ marginTop: 'auto' }}> 
<Button variant='contained'sx={{ backgroundColor: '#ffe6ff', marginBottom: '16px', width: '100%', color: "black"}} onClick={() => handleClick('/mybody')}>
  Read More
</Button>
</div>
</Paper>  */}

</div>
</div>
</div>
</div>
</div>
</div>
</div>
{/* </div> */}

<br />
</div>     
{ showModal && <SignIn onSignIn={signIn} onModalClose={onModalClose} /> }

        <MuiBottomNavigation />
    </>
  );  
}