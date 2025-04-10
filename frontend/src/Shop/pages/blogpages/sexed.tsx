
// Created by Paula Lopez Burgos and Beren Donmez
import { UserContextType, MyPaymentMetadata } from "../../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../../components/Payments";
import MuiBottomNavigation from "../../../MuiBottomNavigation";
import SignIn from "../../components/SignIn";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";
import Typography from "@mui/material/Typography";
import { UserContext } from "../../components/Auth";
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Button, Grid } from '@mui/material';

export default function Sexed() {

  const navigate = useNavigate();

  const handleClick = (page: string) => {
    navigate(page);
  }

  const { user, saveUser, showModal, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;


return(
    <>
    <Header/>
    <Typography variant="h5" margin={2} color="pink">
      Sex Education
    </Typography>

    {/* Replace Mybodycard components with buttons */}
    <Button variant='contained' color='secondary'sx={{ backgroundColor: 'pink', marginBottom: '16px', width: '100%' }} onClick={() => handleClick('/socialmediaBlog')}>
      Sex Education
    </Button>

    <Button variant='contained' color='secondary'sx={{ backgroundColor: 'pink', marginBottom: '16px', width: '100%' }} onClick={() => handleClick('/BodyImage')}>
      Sex Education
    </Button>

    <Button variant='contained' color='secondary'sx={{ backgroundColor: 'pink', marginBottom: '16px', width: '100%'}} onClick={() => handleClick('/Blogilates')}>
    Sex Education
    </Button>

    <Button variant='contained' color='secondary'sx={{ backgroundColor: 'pink', marginBottom: '16px', width: '100%'}} onClick={() => handleClick('/Eatingdisorders')}>
    Sex Education
    </Button>
    {/* Remove the Mybodycard components */}


    <MuiBottomNavigation />
    </>
  );
}