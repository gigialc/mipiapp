// Created by Georgina Alacaraz
import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "./Auth";
import { PostType, UserContextType } from "./Types";
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import { useLocation } from 'react-router-dom';
import PostCard from "./PostCard";

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://api.destigfemme.com';

const axiosClient = axios.create({ baseURL: backendURL, timeout: 20000, withCredentials: true });
const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

export default function PostContent({ communityId }: { communityId: string }) {
  const { user, saveUser, showModal, saveShowModal, onModalClose } = useContext(UserContext) as UserContextType;
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const location = useLocation();
  const postId = location.state.postId;
  console.log(postId);
 
  
  // get the posts that have the same community id as the current session
  useEffect(() => {
      const fetchPosts = async () => {
          try {
              const response = await axiosClient.get(`/posts/posts1?community_id=${communityId}`);
              console.log(response.data.posts);
              setPosts(response.data.posts || []);

          } catch (error) {
              console.error("Failed to fetch posts: ", error);
          }
      };
      fetchPosts();
  }, [communityId]);// Empty dependency array means this effect runs once on mount

  
  return (
    <div>
      {posts.map((post) => (
        <PostCard
        _id={post._id}
        title={post.title}
        description={post.description}
        />
        
      ))}
    </div>
    
  );
}