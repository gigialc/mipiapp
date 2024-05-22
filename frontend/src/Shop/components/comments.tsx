import React, { CSSProperties, useContext, useState } from 'react';
import axios from 'axios';
import { TextField, Button, Stack, colors, FormControl } from '@mui/material';
import { UserContext } from "../components/Auth";
import { UserContextType } from './Types';
import { useLocation } from 'react-router-dom';
import { MyPaymentMetadata, WindowWithEnv } from './Types';
import { onReadyForServerApproval, onReadyForServerCompletion } from './Payments';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CommentContent from './CommentContent';
import Box from '@mui/material/Box';

// Make TS accept the existence of our window.__ENV object - defined in index.html:
const _window: WindowWithEnv = window;
const backendURL = _window.__ENV && _window.__ENV.backendURL;

const axiosClient = axios.create({ baseURL: `${backendURL}`, timeout: 20000, withCredentials: true});

export default function Comments() {
    const [showForm, setShowForm] = useState(false);
    const [description, setDescription] = useState<string>('');
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const { user, showModal, saveShowModal, onModalClose, addCommentToPost, addPostToCommunity } = useContext(UserContext) as UserContextType;
   //get the post id from the button

    const location = useLocation();
    const postId = location.state.postId;
    console.log(postId);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!description.trim()) {
            setDescriptionError('Description is required');
            return;
        }

        if(!user) {
          
            saveShowModal(true);
            return; // Exit if user is not signed in
        }
        
        orderProduct('Comment', 1, { postId }); // Call orderProduct with postId
    };

    const orderProduct = async (memo: string, amount: number, paymentMetadata: MyPaymentMetadata) => {
        if(!user) {
          return saveShowModal(true);
        }
      
        const paymentData = { amount, memo, metadata: paymentMetadata };
        const callbacks = {
          onReadyForServerApproval,
          onReadyForServerCompletion,
          //onCancel,
          //onError
        }
              
        //make a payment
        const payment = await window.Pi.createPayment(paymentData, callbacks);
        console.log(payment);

        // Make an API call to add person to the community if the payment was successful
        if (description !== '' ) {
            const data = {
              description: description,
              user_id: user?.uid,
              post_id: postId,
              likes: [],

            };
                //check if payment was successful
                // if (payment.paymentCompleted === true){
            
               axiosClient.post(`/comments/comments`, data)
               .then((response) => {
                 console.log(response.data);
                 addCommentToPost(response.data);
                 setDescription('');
                 setShowForm(false);
               })
               .catch((error) => {
                 console.log(error);
               });
        }
        
    };

    const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
        if(descriptionError) setDescriptionError(null); // Reset error when user starts typing
    };

    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>   
        <CommentContent/>
        <br />
        <form onSubmit={handleSubmit}>
          <Stack spacing={1} direction="row" alignItems="center" justifyContent="center">
            <TextField
              id="description"
              label="Comment"
              value={description}
              onChange={onDescriptionChange}
              error={!!descriptionError}
              helperText={descriptionError || ''}
              fullWidth
              InputProps={{
                style: {
                  borderRadius: '30px',
                  height: "35px", // Adjust this value to control the roundness of the input field
                  textAlign: 'center', // Center the text in the input field
                },
                inputProps: {
                  style: {
                    textAlign: 'center', // Center the text in the input field
                  },
                },
              }}
              InputLabelProps={{ // Move the label to the center
                style: {
                  textAlign: 'center',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#ffe6ff', borderRadius: '20px', color: 'black', height: '30px' ,textTransform: 'none'}} // Adjust height here
            >
              Submit
            </Button>
          </Stack>
        </form>
        <br />
        <br />
        <br />
        <br />
      </div>
    );
  };
  