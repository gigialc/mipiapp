import React, { useState, useEffect } from "react";
import axios from "axios";
import { UserContextType, AuthResult, UserData, CommunityType, User } from "./Types";
import { onIncompletePaymentFound } from "./Payments";

export const UserContext = React.createContext<UserContextType | null>(null);

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://api.destigfemme.com';

const axiosClient = axios.create({
    baseURL: backendURL,
    timeout: 20000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
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
        const response = await axiosClient.post(`/user/signin`, { authResult });
        setUser(response.data.user); // Save user data to context
        return response.data.user;
    }

    const signOutUser = async () => {
        await axiosClient.get(`/user/signout`);
        setUser(null);
    }

    const saveUser = () => {
        user ? signOutUser() : signIn();
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

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axiosClient.get(`/user/me`);
                setUser(response.data.user);
            } catch (error) {
                console.error("No active session found", error);
            }
        };

        checkSession();
    }, []);

    return (
        <UserContext.Provider value={userContext}>
            {children}
        </UserContext.Provider>
    );
}

export default AuthProvider;
