//Created by Georgina Alacaraz
import React from "react";
import { User, AuthResult, UserContextType, WindowWithEnv, CommunityType, UserData, PostType } from "./Types";
import axios from "axios";
import { onIncompletePaymentFound } from "./Payments";
import { useState } from "react";

export const UserContext = React.createContext<UserContextType | null >(null);

const _window: WindowWithEnv = window;
const backendURL = _window.__ENV && _window.__ENV.BACKEND_URL;

const axiosClient = axios.create({ baseURL: `${backendURL}`, timeout: 20000, withCredentials: true});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = React.useState<UserData >(null);
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [community, setCommunity] = React.useState<CommunityType[]>([]);
    const [post, setPost] = React.useState<CommunityType[]>([]);
    const [comment, setComment] = React.useState<CommunityType[]>([]);

    const addCommunityToUser = (newCommunity: CommunityType) => {
      setCommunity((prevCommunities) => [...prevCommunities, newCommunity]);
    };

    const addCommentToPost = (newComment: CommunityType) => {
      setPost((prevComments) => [...prevComments, newComment]);
    }

    const addPostToCommunity = (newPost: CommunityType) => {
      setPost((prevPosts) => [...prevPosts, newPost]);
    }

    const addlikeToComment = (newLike: CommunityType) => {
      setComment((prevLikes) => [...prevLikes, newLike]);
    }

    const addlikeToPost = (newLike: CommunityType) => {
      setPost((prevLikes) => [...prevLikes, newLike]);
    }
  
    const signIn = async () => {
      const scopes = ['username', 'payments', 'wallet_address'];
      const authResult: AuthResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const user = await signInUser(authResult);
      setUser(user.data.user);
      setShowModal(false);
      // getCommunity();
    }

    const signInUser = async (authResult: AuthResult) => {
        const user = await axiosClient.post('/user/signin', {authResult});
        setShowModal(false);
        return user;
    }
    
    const signOutUser = async() =>{
      const nullUser = null;
      setUser(nullUser);
    }

    const saveUser = () =>{
      user? signIn() : signOutUser();
    }

    const saveShowModal = (value: boolean) => {
      setShowModal(value);
    }

    const onModalClose = () => {
      saveShowModal(false);
    }

    const userContext: UserContextType = {
      user,
      community, // Add the community property to the userContext
      saveUser,
      showModal,
      saveShowModal,
      onModalClose,
      addCommunityToUser,
      addPostToCommunity,
      addCommentToPost, 
      
    };

    return (
        <UserContext.Provider value={ userContext }>
            {children}
        </UserContext.Provider>
    )
  }
export default AuthProvider;

