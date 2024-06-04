// Import React and Material UI components as before...
import { Card, CardContent, CardActions, Typography, IconButton } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { CommunityType } from './Types';
import { useLocation } from 'react-router-dom';
import HeartIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { UserContext } from "./Auth";
import Grid from '@mui/material/Grid';
import { UserContextType } from './Types';

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';

interface PostType {
    _id: string,
    title: string,
    description: string,
}

// Define the PostCard component    

export default function PostCard({ _id, title, description }: PostType) {
    const { user, saveUser, showModal, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikesCount] = useState(0);
    const location = useLocation();
    const postId = location.state.postId;
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

    const handleLike = async () => {
        try {
          const response = await axiosClient.post(`/posts/like/${_id}`);
          // Update based on the actual response
          setIsLiked(response.data.isLiked);
          setLikesCount(response.data.likeCount);
        } catch (error) {
          console.error("Failed to handle post like/unlike: ", error);
          // Optionally revert optimistic updates in case of error
     
        }
      };

      useEffect(() => {
        //fetch the like status and count
        const fetchLikeStatus = async () => {
          try {
            const response = await axiosClient.get(`/posts/like/${_id}`);
            setIsLiked(response.data.isLiked);
            setLikesCount(response.data.likeCount);
          } catch (error) {
            console.error("Failed to fetch like status: ", error);
          }
        };
        fetchLikeStatus();
        }
        , [_id]);

      return (
        <Card style={{ margin: 16, paddingBottom: 10, marginLeft: 20, width: 'calc(100% - 40px)', boxShadow: "0 0 0 1px #E69BD1", backgroundColor: "#eec1e1"}}>
          <CardContent>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>
                  {title}
                </Typography>
                <Typography variant="body1" component="p">
                  {description}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
            <IconButton aria-label="add a comment" onClick={() => navigate("/comments", { state: { postId: _id } })}>
                <ChatBubbleOutlineIcon style={{ fontSize: '16px', color: "black" }} />
            </IconButton>
            
            <Grid container justifyContent="flex-end" alignItems="center" spacing={1}>
                <Grid item>
                <IconButton
                    aria-label="like post"
                    onClick={handleLike}
                    style={{ padding: '0' }}
                >
                    <HeartIcon
                    style={{
                        fontSize: '16px',
                        // Change the color based on the like status
                        fill: isLiked ? 'red' : 'none',
                        stroke: 'black',
                        strokeWidth: '2px',
                    }}
                    />
                </IconButton>
                </Grid>
                <Grid item>
                <Typography variant="body2" sx={{ display: 'inline', marginRight: '4px' }}>
                    {likeCount}
                </Typography>
                </Grid>
            </Grid>
            </CardActions>

                    </Card>
                );
                };


            