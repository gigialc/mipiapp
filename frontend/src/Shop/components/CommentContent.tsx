//Created by Georgina Alacaraz
import { UserContextType } from './Types';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { UserContext } from './Auth';
import { Card, CardContent, Typography } from '@mui/material';
import { PostType } from './Types';
import CommentCard from './commentsCard';
import { formatDistanceToNow } from 'date-fns';
import { Box, Divider } from '@mui/material';
import { Avatar } from '@mui/material';

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';

interface CommentType {
  _id: string;
  content: string;
  user: { username: string };
  likes: string[];
  posts: string;
  timestamp: Date;
}


export default function CommentContent (){ 
  const { user, saveUser, showModal, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;
  const [post, setPost] = useState<PostType | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentId, setCommentId] = useState<string | null>(null);
  const [usernames, setUsernames] = useState<string[]>([]);
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

    useEffect(() => {
      const fetchComments = async () => {
        try {
          const response = await axiosClient.get(`/comments/fetch/${postId}`);
          setUsernames(response.data.username);
          console.log(response.data.comments);
          setComments(response.data.comments || []);
        } catch (error) {
          console.error("Failed to fetch comments: ", error);
        }
      };
        fetchComments();

      const fetchLikeStatus = async () => {
        try {
          const response = await axiosClient.get(`/comments/likeComment/${postId}`);
          setIsLiked(response.data.isLiked);
          console.log(response.data);
          setLikesCount(response.data.likeCount);
        } catch (error) {
          console.error("Failed to fetch like status: ", error);
        }
      };
       fetchLikeStatus();

      const fetchPost = async () => {
        try {
          const response = await axiosClient.get(`/posts/${postId}`);
          console.log(response.data);
          setPost(response.data || null);
        } catch (error) {
          console.error("Failed to fetch post: ", error);
        }
      }
      fetchPost();
      }, [postId, commentId]);


      return (
        <Card sx={{ maxWidth: '600px', margin: 'auto', mt: 4, boxShadow: 3 }}>
          {post ? (
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                {post.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {post.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Comments
              </Typography>
            </CardContent>
          ) : (
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontStyle: "italic", color: 'primary.main' }}>
                Loading post...
              </Typography>
            </CardContent>
          )}
          
          {comments.map((comment, index) => (
            <Box key={comment._id} sx={{ p: 2, borderTop: index > 0 ? 1 : 0, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                  {comment.user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="subtitle2" fontWeight="bold">
                  {usernames[index]}
                </Typography>
                <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
                  {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 5 }}>
                {comment.content}
              </Typography>
            </Box>
          ))}
          
          {comments.length === 0 && (
            <CardContent>
              <Typography variant="body2" sx={{ fontStyle: "italic", color: 'text.secondary' }}>
                No comments yet. Be the first to comment!
              </Typography>
            </CardContent>
          )}
        </Card>
      );
    };