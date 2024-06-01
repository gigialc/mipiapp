// Created by Georgina Alacaraz
import { UserContextType, MyPaymentMetadata , CommunityType} from "../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../components/Payments";
import SignIn from "../components/SignIn";
import Header from "../components/Header";
import Typography from "@mui/material/Typography";
import { UserContext } from "../components/Auth";
import React, { useEffect, useState } from "react";
import MuiBottomNavigation from "../../MuiBottomNavigation";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bloodtype } from "@mui/icons-material";
import { Button, Divider } from "@mui/material";
import {UserData } from "../components/Types";
import Dialog from '@mui/material/Dialog'; // Import Dialog component
import MuiForm from "../components/MuiForm";
import { Fab } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Tabs, Tab, Box } from "@mui/material";
import MyList from "../mylist";


const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://api.destigfemme.com';

const axiosClient = axios.create({ baseURL: backendURL, timeout: 20000, withCredentials: true });
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

export default function  UserToAppPayments() {
  const { user, saveUser, showModal, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[] | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType[] | null>(null); // Moved here
  const [userData, setUserData] = useState<UserData | null>(null);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [tabValue, setTabValue] = useState(0); // Default to the first tab

  console.log("User Data :" , userData);
  const navigate = useNavigate();
  
  const handleCommunityClick = (community: CommunityType) => {
    // get the community id and make it a current session
    console.log(community._id);
    navigate("/ChatCreator", { state: { communityId: community._id } });
  };

  const handleCommunityClick1 = (community: CommunityType) => {
   
    console.log(community._id);
    navigate("/Chat", { state: { communityId: community._id } });
  };
  
  const orderProduct = async (memo: string, amount: number, paymentMetadata: MyPaymentMetadata) => {
    if (!user ) {
      return saveShowModal(true);
    }

    // Define a state to track the selected community

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
    console.log(user);
  }
  , [user]);

  useEffect(() => {
    if (user){
    axiosClient.get(`/user/me`)
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
  , []);
  


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
            <div>
            
              <List>
                {selectedCommunity ? (
                  selectedCommunity.map((community) => (
                    <ListItem key={community._id} onClick={() => handleCommunityClick1(community)} style={{ backgroundColor: '#efc9e4', marginBottom: '10px', borderRadius: '4px',boxShadow: `
                    0 -2px 4px rgba(255, 182, 193, 0.2), /* Top shadow */
                    0 2px 4px rgba(255, 182, 193, 0.2), /* Bottom shadow */
                    0 2px 4px rgba(0,0,0,0.1)` /* Additional bottom shadow for depth */
                  }}>
                      <ListItemText primary={community.name} secondary={community.description}/>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body1">No community data available</Typography>
                )}
              </List>
            </div>
  );
}