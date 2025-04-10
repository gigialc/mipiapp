// Created by Paula Lopez Burgos and Beren Donmez
import { UserContextType, MyPaymentMetadata } from "../../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../../components/Payments";
import MuiBottomNavigation from "../../../MuiBottomNavigation";
import SignIn from "../../components/SignIn";
import Header from "../../components/Header";
import Typography from "@mui/material/Typography";
import { UserContext } from "../../components/Auth";
import React from "react";


export default function BodyImage(){
  const { user, saveUser, showModal, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;


  return(
    <>
    <Header/>

        <div style={{ overflowY: 'auto', height: '150vh',marginLeft: '20px' }}>

        <h2>The negative side of social media and how we can avoid it</h2>
    
        <img src="1_liHouzcsOxIh9otdoouAjA@2x.jpg" alt="1_liHouzcsOxIh9otdoouAjA@2x.jpg" width="450" height="220"></img>       
          
        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            Have you ever posted a photo of yourself on social media that received a lot of likes and comments? It’s nice to see that people are interested in you. In fact, you probably got a little boost in your self-esteem, which is great! But for some people, that boost can leave them wanting more…and more…and more.
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '100px' }}>
                Source: https://gradesfixer.com/free-essay-examples/perfect-body-image-stereotypes-in-the-society/
        </Typography>

        </div>

        <MuiBottomNavigation />
    </>
  );
}
