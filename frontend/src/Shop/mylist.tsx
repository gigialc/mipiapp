import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CommunityType, UserContextType, UserData, MyPaymentMetadata } from "./components/Types";
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

interface WindowWithEnv extends Window {
  __ENV?: {
    backendURL: string;
    sandbox: string;
  };
}

const _window: WindowWithEnv = window;
const backendURL = _window.__ENV && _window.__ENV.backendURL;

const axiosClient = axios.create({ baseURL: `${backendURL}`, timeout: 20000, withCredentials: true });

export default function MyList() {
  const { user, saveUser, showModal, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [openFormModal, setOpenFormModal] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  console.log("User Data :", userData);
  const navigate = useNavigate();

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

  const handleCommunityClick = (community: CommunityType) => {
    console.log(community._id);
    navigate("/ChatCreator", { state: { communityId: community._id } });
  };

  const handleCommunityClick1 = (community: CommunityType) => {
    console.log(community._id);
    navigate("/Chat", { state: { communityId: community._id } });
  };

  const handleOpenFormModal = () => {
    setOpenFormModal(true);
  };

  const handleCloseFormModal = () => {
    setOpenFormModal(false);
  };

  const orderProduct = async (memo: string, amount: number, paymentMetadata: MyPaymentMetadata) => {
    if (!user) {
      return saveShowModal(true);
    }

    const paymentData = { amount, memo, metadata: paymentMetadata };
    const callbacks = {
      onReadyForServerApproval,
      onReadyForServerCompletion,
      onCancel,
      onError,
    };
    const payment = await window.Pi.createPayment(paymentData, callbacks);
    console.log(payment);
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

  useEffect(() => {
    if (user) {
      axiosClient
        .get("/user/me")
        .then((response) => {
          console.log("Response data for /user/me:", response.data);
          if (Array.isArray(response.data)) {
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
      .get("/user/joined")
      .then((response) => {
        console.log("Joined communities:", response.data);
        if (Array.isArray(response.data)) {
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
    </div>
  );
}
