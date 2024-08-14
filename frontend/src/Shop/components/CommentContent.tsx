//Created by Georgina Alacaraz
import { UserContextType } from './Types';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { UserContext } from './Auth';
import { PostType } from './Types';
import CommentCard from './commentsCard';
import { CardContent, Typography } from '@mui/material';

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
        <div style={{ maxWidth: '600px', margin: '1', textAlign: 'left' }}>
          {post ? (
            <CardContent>
              <Typography variant="h6" gutterBottom align="left">
                {post.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" align="left">
                {post.description}
              </Typography>
            </CardContent>
          ) : (
            <Typography variant="subtitle2" style={{ marginTop: '5px', fontStyle: "italic", color: '#9E4291' }}>
              Loading post...
            </Typography>
          )}
          
          {comments.map((comment) => (
            <CommentCard 
              _id={comment._id}
              content={comment.content}
              user={comment.user}
              likes={comment.likes as []}
              posts={comment.posts}
              timestamp={comment.timestamp}
            />
        
          ))}
        </div>
      );
    }
