// Created by Georgina Alacaraz
import React, { useState, useEffect } from "react";
import axios from "axios";
import { UserContextType, AuthResult, UserData, WindowWithEnv, CommunityType , User} from "./Types";
import { onIncompletePaymentFound } from "./Payments";

export const UserContext = React.createContext<UserContextType | null >(null);

const _window: WindowWithEnv = window;
const backendURL = _window.__ENV && _window.__ENV.BACKEND_URL;

const axiosClient = axios.create({ baseURL: `${backendURL}`, timeout: 20000, withCredentials: true });

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = React.useState<User>( { uid: '', username: '', accessToken: '',bio: '', coinbalance: 0, community: [], likes: [], comments: [], posts: [], date: new Date()});
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [community, setCommunity] = useState<CommunityType[]>([]);
    const [post, setPost] = useState<CommunityType[]>([]);
    const [comment, setComment] = useState<CommunityType[]>([]);

    const signIn = async () => {
      const scopes = ['username', 'payments', 'wallet_address'];
      const authResult: AuthResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      await signInUser(authResult);
      setUser(authResult.user);
      setShowModal(false);
    }

    const signInUser = async (authResult: AuthResult) => {
        await axiosClient.post('/users/signin', {authResult});
        return setShowModal(false);
    }
    
    const signOutUser = async() =>{
      const nullUser = { uid: '', username: '', accessToken: '',bio: '', coinbalance: 0, community: [], likes: [], comments: [], posts: [], date: new Date()};
      setUser(nullUser);
    }

    const saveUser = () =>{
      user.uid === '' ? signIn() : signOutUser();
    }

    const saveShowModal = (value: boolean) => {
      setShowModal(value);
    }

    const onModalClose = () => {
      saveShowModal(false);
    }

    const userContext: UserContextType = {
      user, 
      saveUser, 
      showModal, 
      saveShowModal,
      onModalClose,
      community,
      addCommunityToUser: (newCommunity: CommunityType) => {
        setCommunity([...community, newCommunity]);
      },
      addPostToCommunity: (newPost: CommunityType) => {
        setPost([...post, newPost]);
      },
      addCommentToPost: (newComment: CommunityType) => {
        setComment([...comment, newComment]);
      }
    }

    return (
        <UserContext.Provider value={ userContext }>
            {children}
        </UserContext.Provider>
    )
}

export default AuthProvider;


