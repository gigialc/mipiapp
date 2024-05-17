// Created by Georgina Alacaraz
import React, { useState, useEffect } from "react";
import axios from "axios";
import { UserContextType, AuthResult, UserData, WindowWithEnv, CommunityType } from "./Types";
import { onIncompletePaymentFound } from "./Payments";

export const UserContext = React.createContext<UserContextType | null >(null);

const _window: WindowWithEnv = window;
const backendURL = _window.__ENV && _window.__ENV.BACKEND_URL;

const axiosClient = axios.create({ baseURL: `${backendURL}`, timeout: 20000, withCredentials: true });

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [community, setCommunity] = useState<CommunityType[]>([]);
    const [post, setPost] = useState<CommunityType[]>([]);
    const [comment, setComment] = useState<CommunityType[]>([]);


    const addCommunityToUser = (newCommunity: CommunityType) => {
      setCommunity((prevCommunities) => [...prevCommunities, newCommunity]);
    };

    const addCommentToPost = (newComment: CommunityType) => {
      setPost((prevComments) => [...prevComments, newComment]);
    };

    const addPostToCommunity = (newPost: CommunityType) => {
      setPost((prevPosts) => [...prevPosts, newPost]);
    };

    const addLikeToComment = (newLike: CommunityType) => {
      setComment((prevLikes) => [...prevLikes, newLike]);
    };

    const addLikeToPost = (newLike: CommunityType) => {
      setPost((prevLikes) => [...prevLikes, newLike]);
    };

    const signIn = async () => {
      const scopes = ['username', 'payments', 'wallet_address'];
      const authResult: AuthResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      try {
        const response = await axiosClient.post('/users/signin', { authResult });
        setUser(response.data.user);
        setShowModal(false);
      } catch (error) {
        console.error('Sign-in error:', error);
      }
    };

    const signOutUser = async () => {
      try {
        await axiosClient.post('/users/signout');
        setUser(null);
      } catch (error) {
        console.error("Error signing out user:", error);
      }
    };

    const saveUser = () => {
      if (user) {
          signOutUser();
      } else {
          signIn();
      }
    };

    const saveShowModal = (value: boolean) => {
      setShowModal(value);
    };

    const onModalClose = () => {
      saveShowModal(false);
    };

    const userContext: UserContextType = {
      user,
      community,
      saveUser,
      showModal,
      saveShowModal,
      onModalClose,
      addCommunityToUser,
      addPostToCommunity,
      addCommentToPost,
    };

    return (
      <UserContext.Provider value={userContext}>
        {children}
      </UserContext.Provider>
    );
};

export default AuthProvider;
