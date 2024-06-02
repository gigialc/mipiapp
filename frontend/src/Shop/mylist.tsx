import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CommunityType, UserContextType, UserData, CommentType, PostType } from "./components/Types";
import { UserContext } from "./components/Auth";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "./components/Payments";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import MuiForm from "./components/MuiForm";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Tabs, Tab, Box } from "@mui/material";
import SignIn from "./components/SignIn";
import { ObjectId, Types } from 'mongoose';


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

export default function MyList() {
  const { saveUser, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  console.log("User Data :", userData);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 12) {
      return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Night";
    }
  };

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

  const handleCommunityClick = (community: CommunityType) => {
    console.log(community._id);
    navigate("/ChatCreator", { state: { communityId: community._id } });
  };

  const handleCommunityClick1 = (community: CommunityType) => {
    console.log(community._id);
    navigate("/community/Chat", { state: { communityId: community._id } });
  };

  const handleOpenFormModal = () => {
    setOpenFormModal(true);
  };

  const handleCloseFormModal = () => {
    setOpenFormModal(false);
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

  useEffect(() => {
    if (user) {
      axiosClient
        .get(`/user/me`)
        .then((response) => {
          console.log("Response data for /user/me:", response.data);
          if (Array.isArray(response.data) && response.data.length > 0) {
            response.data.forEach((community: CommunityType) => {
              if (!community._id) {
                console.error("Community does not have _id:", community);
              }
            });
            setCreateCommunityData(response.data);
          } else {
            console.error("Expected an array for /user/me response data, but got:", response.data);
            setCreateCommunityData([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching /user/me:", error);
          setCreateCommunityData([]);
          if (error.response && error.response.data) {
            console.error("Error response data:", error.response.data);
          } else {
            console.error("Error response:", error.response);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    axiosClient
      .get(`/user/joined`)
      .then((response) => {
        console.log("Joined communities:", response.data);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setSelectedCommunity(response.data);
        } else {
          console.error("Expected an array for /user/joined response data, but got:", response.data);
          setSelectedCommunity([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching joined communities:", error);
        setSelectedCommunity([]);
        if (error.response && error.response.data) {
          console.error("Error response data:", error.response.data);
        } else {
          console.error("Error response:", error.response);
        }
      });
  }, []);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "5px" }}></div>

      <List>
        {createCommunityData.length > 0 ? (
          createCommunityData.map((community) => (
            <ListItem
              key={community._id}
              onClick={() => handleCommunityClick(community)}
              style={{
                backgroundColor: "#efc9e4",
                marginBottom: "10px",
                borderRadius: "4px",
                boxShadow: `
                0 -2px 4px rgba(255, 182, 193, 0.2), 
                0 2px 4px rgba(255, 182, 193, 0.2),
                0 2px 4px rgba(0,0,0,0.1)`,
              }}
            >
              <ListItemText primary={community.name} secondary={community.description} />
            </ListItem>
          ))
        ) : (
          <Typography variant="body1">No community data available</Typography>
        )}
      </List>

      <List>
        {selectedCommunity.length > 0 ? (
          selectedCommunity.map((community) => (
            <ListItem
              key={community._id}
              onClick={() => handleCommunityClick1(community)}
              style={{
                backgroundColor: "#efc9e4",
                marginBottom: "10px",
                borderRadius: "4px",
                boxShadow: `
                0 -2px 4px rgba(255, 182, 193, 0.2), 
                0 2px 4px rgba(255, 182, 193, 0.2),
                0 2px 4px rgba(0,0,0,0.1)`,
              }}
            >
              <ListItemText primary={community.name} secondary={community.description} />
            </ListItem>
          ))
        ) : (
          <Typography variant="body1">No joined community data available</Typography>
        )}
      </List>
      { showModal && <SignIn onSignIn={signIn} onModalClose={onModalClose} /> }
    </div>
    
  );
}
