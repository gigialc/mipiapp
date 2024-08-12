import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Stack } from '@mui/material';
import { UserContext } from "../components/Auth";
import { UserContextType, MyPaymentMetadata } from './Types';
import { useLocation } from 'react-router-dom';
import CommentContent from './CommentContent';

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';

export default function Comments() {
    const [description, setDescription] = useState<string>('');
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const { user, saveShowModal } = useContext(UserContext) as UserContextType;
    const location = useLocation();
    const postId = location.state.postId;
    const [commentPrice, setCommentPrice] = useState<number>(0);
    const [communityId, setCommunityId] = useState<string | null>(null);
    const [thankYouMessage, setThankYouMessage] = useState<string | null>(null);

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
          onReadyForServerApproval: ({ paymentId }: { paymentId: string }) => {
            console.log("onReadyForServerApproval", paymentId);
            return axiosClient.post('/payments/approve', { paymentId });
          },
          onReadyForServerCompletion: ({ paymentId, txid }: { paymentId: string, txid: string }) => {
            console.log("onReadyForServerCompletion", paymentId, txid);
            return axiosClient.post('/payments/complete', { paymentId, txid }).then(() => {
              postComment();
            });
          },
          onCancel: ({ paymentId }: { paymentId: string }) => {
            console.log("Payment Cancelled", paymentId);
          },
          onError: (error: Error, payment?: any) => {
            console.error("Error", error);
            if (payment) {
              console.log(payment);
            }
          }
        };

        try {
          const payment = await (window as any).Pi.createPayment(paymentData, callbacks);
          console.log('Payment:', payment);
        } catch (error) {
          console.error('Error creating payment:', error);
        }
    };

    const postComment = async () => {
      if (description !== '') { 
        const data = {
          content: description,
          user: user?.uid,
          posts: postId,
          likes: [],
          timestamp: new Date()
        };
    
        try {
          const response = await axiosClient.post(`/comments/comments`, data);
          console.log(response);
          setThankYouMessage("Thanks for commenting!");
          setDescription('');  // Clear the comment input after posting
        } catch (error) {
          console.error('Error posting comment:', error);
        }
      }
    };

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
                  height: "35px",
                  textAlign: 'center',
                },
                inputProps: {
                  style: {
                    textAlign: 'center',
                  },
                },
              }}
              InputLabelProps={{
                style: {
                  textAlign: 'center',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#ffe6ff', borderRadius: '20px', color: 'black', height: '30px' ,textTransform: 'none'}}
            >
              Submit
            </Button>
          </Stack>
        </form>
        {thankYouMessage && <p>{thankYouMessage}</p>}
      </div>
    );
}