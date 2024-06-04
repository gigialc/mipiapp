import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CommunityType, UserContextType, CommentType, PostType } from "./components/Types";
import { UserContext } from "./components/Auth";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "./components/Payments";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import SignIn from "./components/SignIn";
import { Types } from 'mongoose';


const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';

const config = { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } };

export default function MyList() {
  const { user, saveUser, saveShowModal, showModal, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [createCommunityData, setCreateCommunityData] = useState<CommunityType[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType[]>([]);
  const navigate = useNavigate();

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
 
  useEffect(() => {
    if (user) {
      axiosClient
        .get('/user/me', config)
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
    if (user) {
      axiosClient
        .get('/user/joined', config)
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
    }
  }, [user]);

  const handleCommunityClick = (community: CommunityType) => {
    console.log(community._id);
    navigate("/ChatCreator", { state: { communityId: community._id } });
  };

  const handleCommunityClick1 = (community: CommunityType) => {
    console.log(community._id);
    navigate("/community/Chat", { state: { communityId: community._id } });
  };

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
      { showModal && <SignIn onSignIn={saveUser} onModalClose={onModalClose} showModal={showModal}/> }
    </div>
  );
}
