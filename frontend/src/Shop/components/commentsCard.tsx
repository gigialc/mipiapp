// Import React and Material UI components as before...
import { Card, CardContent, CardActions, Typography, IconButton } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { CommunityType } from './Types';
import { useLocation } from 'react-router-dom';
import HeartIcon from '@mui/icons-material/Favorite';
import { UserContext } from "./Auth";
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';


interface WindowWithEnv extends Window {
    __ENV?: {
      backendURL: string, // REACT_APP_BACKEND_URL environment variable
      sandbox: "true" | "false", // REACT_APP_SANDBOX_SDK environment variable - string, not boolean!
    }
}
  
const _window: WindowWithEnv = window;
const backendURL = _window.__ENV && _window.__ENV.backendURL;
  
const axiosClient = axios.create({ baseURL: `${backendURL}`, timeout: 20000, withCredentials: true });
const config = { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } };
  

interface CommentType {
    _id: string,
    content: string,
    user: { username: string }
    postId: string,
    likes: []

}

// Define the PostCard component    

export default function CommentCard({ _id, content }: CommentType) {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikesCount] = useState(0);
    const location = useLocation();
    const [comment, setComment] = useState<CommentType | null>(null);

    const [commentId, setCommentId] = useState<string | null>(null);
    const postId = location.state.postId;
    console.log(commentId);


    const handleLike = async () => {
        try {
          const response = await axiosClient.post(`/comments/likeComment/${_id}`);
          // Update based on the actual response
          setIsLiked(response.data.isLiked);
          setLikesCount(response.data.likeCount);
        } catch (error) {
          console.error("Failed to handle post like/unlike: ", error);
          // Optionally revert optimistic updates in case of error
     
        }
      };

      const handleNavigatePublicProfile = (username: string = '') => {
        navigate(`/profile/${username}`);
    };


      const handleCommentClick = async (comment: CommentType | null = null) => {
        if (comment) {
            setCommentId(comment._id);
        }
        handleLike();
    };

      useEffect(() => {
        //fetch the like status and count
        const fetchLikeStatus = async () => {
          try {
            const response = await axiosClient.get(`/comments/likeComment/${_id}`);
            setIsLiked(response.data.isLiked);
            console.log(response.data);
            setLikesCount(response.data.likeCount);
          } catch (error) {
            console.error("Failed to fetch like status: ", error);
          }
        };
        fetchLikeStatus();
        }
        , [_id]);


        return (
            <Card>
              <CardContent>
                <Typography variant="body1" component="h2">
                  {content}
                </Typography>
              </CardContent>
              <CardActions>
                <Typography>
                  {likeCount}
                </Typography>
                <IconButton
                  aria-label="like post"
                  onClick={() => handleCommentClick(comment)}
                  style={{ padding: '0' }}
                >        
                  <HeartIcon
                    style={{
                      fontSize: '16px',
                      fill: isLiked ? 'red' : 'none', // Change color based on like status
                      stroke: 'black',
                      strokeWidth: '2px',
                    }}
                  />
                </IconButton>
                <Button
                  onClick={() => handleNavigatePublicProfile(comment?.user.username)} 
                  style={{ fontWeight: 'bold', color: '#9E4291', textTransform: 'none' }}
                >
                 By: {comment?.user.username || 'Anonymous'} 
                </Button>   
              </CardActions>
            </Card>
          );
        };

        


            