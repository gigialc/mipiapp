import React, { CSSProperties, useContext, useState } from 'react';
import axios from 'axios';
import { TextField, Button, Stack, colors, FormControl } from '@mui/material';
import { UserContext } from "../components/Auth";
import { UserContextType } from './Types';
import { useLocation } from 'react-router-dom';
import { MyPaymentMetadata, WindowWithEnv } from './Types';
import { onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError } from './Payments';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CommentContent from './CommentContent';
import Box from '@mui/material/Box';
import { useEffect } from 'react';
import { time } from 'console';

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';

export default function Comments() {
    const [showForm, setShowForm] = useState(false);
    const [description, setDescription] = useState<string>('');
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const { user, showModal, saveShowModal, onModalClose } = useContext(UserContext) as UserContextType;
    const location = useLocation();
    const postId = location.state.postId;
    const [commentPrice, setCommentPrice] = useState<number>(0);
    const [communityId, setCommunityId] = useState<string | null>(null);
    const [thankYouMessage, setThankYouMessage] = useState<string | null>(null);

    console.log(postId);

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
      fetchCommunityId();
    }, [postId]);

    useEffect(() => {
      if (communityId) {
        fetchCommunityPrice();
      }
    }, [communityId]);

    const fetchCommunityId = async () => {
      try {
        const response = await axiosClient.get(`/posts/${postId}`);
        setCommunityId(response.data.communityId);
      } catch (error) {
        console.error('Error fetching community ID:', error);
      }
    };

    const fetchCommunityPrice = async () => {
      if (!communityId) return;
      
      try {
        const response = await axiosClient.get(`/community/${communityId}`);
        const priceAsNumber = parseFloat(response.data.price);
        setCommentPrice(isNaN(priceAsNumber) ? 1 : priceAsNumber);
      } catch (error) {
        console.error('Error fetching community price:', error);
        setCommentPrice(1);
      }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!description.trim()) {
            setDescriptionError('Description is required');
            return;
        }
        if(!user) {
            saveShowModal(true);
            return;
        }   
        await orderProduct('Comment', commentPrice, { productId: postId });
    };

    const orderProduct = async (memo: string, amount: number, paymentMetadata: MyPaymentMetadata) => {
        if(!user) {
          return saveShowModal(true);
        }
      
        const paymentData = { amount, memo, metadata: paymentMetadata };
        const callbacks = {
          onReadyForServerApproval,
          onReadyForServerCompletion,
          onCancel,
          onError
        }
        try {
          const payment = await window.Pi.createPayment(paymentData, callbacks);
          console.log('Payment:', payment);
          if(payment) {
          console.log('Reached here');
              const data = {
                content: description,
                user: user.uid,
                posts: postId,
                likes: [],
                timestamp: new Date()
              };
          
              const response = await axiosClient.post(`/comments/comments`, data);
              console.log('Response from backend:', response);
              setThankYouMessage('Thanks for commenting!');          
          }
        } catch (error) {
          console.error('Error creating payment:', error);
        }
      }
    

    const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
        if(descriptionError) setDescriptionError(null);
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
}

  