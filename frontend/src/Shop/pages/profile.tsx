// Created by Georgina Alacaraz
import { UserContextType, CommunityType, MyPaymentMetadata} from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import Header from "../components/Header";
import Typography from "@mui/material/Typography";
import { UserContext } from "../components/Auth";
import React, { useEffect, useState,SyntheticEvent } from "react";
import axios from 'axios';
import {UserData } from "../components/Types";
import { Tabs, Tab, Box } from "@mui/material";
import MyList from "../mylist";
import Subscribed from "../components/subscribed";
import EditProfile from "../components/editProfile";
import SignIn from "../components/SignIn";


const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';

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

export default function Posts() {
  const { user, saveUser, saveShowModal, showModal, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[] | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType[] | null>(null); // Moved here
  const [userData, setUserData] = useState<UserData | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [tabValue, setTabValue] = useState(0); // Default to the first tab
  const [showUpdate, setShowUpdate] = useState(false);
  const [bio, setBio] = useState("");


  console.log("User Data :" , userData);
  console.log("User: ", user);
  console.log("User Data: ", user?.username);
  //user bio
  console.log("Bio: ", bio);
  
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

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };


  useEffect(() => {
    console.log(user);
  }, [user]);  // Added dependency array


  useEffect(() => {
    if (user) {
    axiosClient.get('/user/me')
      .then((response) => {
        console.log('Response data for /user/me:', response.data);
        // If response.data is an array, we can use forEach
        if (Array.isArray(response.data)) {
          response.data.forEach((community: CommunityType) => {
            if (!community._id) {
              console.error('Community does not have _id:', community);
            }
          });
          setCreateCommunityData(response.data);
        } else {
          console.error('Expected an array for /user/me response data, but got:', response.data);
        }
      })  
      .catch((error) => {
        console.error('Error fetching /user/me:', error);
      });
    }}
  , [user]);
  

  useEffect(() => {
    if (user){
    axiosClient.get('/user/joined')
      .then((response) => {
        console.log('Joined communities:', response.data);
        setSelectedCommunity(response.data);
      })  
      .catch((error) => {
        console.error('Error fetching joined communities:', error);
      });}
  }, [user]);

  
  return (
    <>
      <Header/>

      <div style={{ padding: '20px', marginBottom: '80px' }}>
        <Typography variant="h6" style={{ fontWeight: 'bold', color: '#E69BD1', marginBottom: '0px' }}>
          Welcome to your profile, {user?.username}! ✨
        </Typography>
        <EditProfile />
        <div style={{}}>
        <Box sx={{ width: '100%', bgcolor: 'background.paper' // This sets the background color of the Tabs
        }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          TabIndicatorProps={{style: {background:'pink'}}}
        
        >
            <Tab label="my communities"  style={{ textTransform: 'none' , fontSize: 15, color:"black", fontWeight: "bold"}}/>
            <Tab label="subscribed"style={{ textTransform: 'none' , fontSize: 15, color:"black", fontWeight: "bold"}} />
          </Tabs>
        </Box>
        {tabValue === 0 && <MyList />}
        {tabValue === 1 && <Subscribed />}
      </div>
      </div>
      {/* Additional components like SignIn Modal and Bottom Navigation */}
      { showModal && <SignIn onSignIn={saveUser} onModalClose={onModalClose} showModal={showModal}/> }
    </>
  );
}