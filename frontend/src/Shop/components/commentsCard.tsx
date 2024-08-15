import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Typography, IconButton, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HeartIcon from '@mui/icons-material/Favorite';
import { UserContext } from "./Auth";
import { UserContextType } from './Types';
import { useLocation } from 'react-router-dom';

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';

interface CommentType {
  _id: string;
  content: string;
  posts: string;
  user: string;
  likes: string[];
  timestamp: Date;
}

export default function CommentCard({ _id, content, posts, user, likes }: CommentType) {
  const { user: currentUser } = React.useContext(UserContext) as UserContextType;
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikesCount] = useState(likes.length);
  const [comments, setComments] = useState<CommentType[]>([]);
  const location = useLocation();
  const postId = location.state.postId;

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
    if (currentUser) {
      setIsLiked(likes.includes(currentUser.uid));
    }
  }, [currentUser, likes]);


  const handleLike = async () => {
    try {
      const response = await axiosClient.post(`/comments/like/${_id}`);
      // Update based on the actual response
      setIsLiked(response.data.isLiked);
      setLikesCount(response.data.likeCount);
    } catch (error) {
      console.error("Failed to handle post like/unlike: ", error);
 
    }
  };

  useEffect(() => {
    //fetch the like status and count
    const fetchLikeStatus = async () => {
      try {
        const response = await axiosClient.get(`/comments/like/${_id}`);
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likeCount);
      } catch (error) {
        console.error("Failed to fetch like status: ", error);
      }
    };
    fetchLikeStatus();
    }
    , [_id]);

  
  const handleNavigatePublicProfile = (user: string) => {
    navigate(`/profile/${user}`);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="body1" component="p">
          {content}
        </Typography>
      </CardContent>
      <CardActions>
        <Typography>
          {likeCount}
        </Typography>
        <IconButton
          aria-label="like comment"
          onClick={handleLike}
          style={{ padding: '0' }}
        >        
          <HeartIcon
            style={{
              fontSize: '16px',
              fill: isLiked ? 'red' : 'none',
              stroke: 'black',
              strokeWidth: '2px',
            }}
          />
        </IconButton>
        <Button
          onClick={() => handleNavigatePublicProfile(user)} 
          style={{ fontWeight: 'bold', color: '#9E4291', textTransform: 'none' }}
        >
            by @{user || 'anonymous'}  

        </Button>   
      </CardActions>
      <br />
    </Card>
    
  );
}