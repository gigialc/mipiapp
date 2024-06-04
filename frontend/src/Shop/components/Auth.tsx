import React from "react";
import { User, AuthResult, UserContextType, WindowWithEnv, CommentType, CommunityType, PostType } from "./Types";
import axios from "axios";
import { onIncompletePaymentFound } from "./Payments";
import { useEffect } from "react";

export const UserContext = React.createContext<UserContextType | null >(null);

const _window: WindowWithEnv = window;
const backendURL = _window.__ENV && _window.__ENV.backendURL;

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [community, setCommunity] = React.useState<CommunityType[]>([]);
    const [post, setPost] = React.useState<CommunityType[]>([]);
    const [comment, setComment] = React.useState<PostType[]>([]);
    const [user, setUser] = React.useState<User>({
        uid: '',
        username: '',
        bio: '',
        accessToken: '',
        coinbalance: 0,
        community: [],
        likes: [],
        comments: [],
        posts: [],
        date: new Date()
    });
    const [showModal, setShowModal] = React.useState<boolean>(false);

    const axiosClient = axios.create({
        baseURL: backendURL,
        timeout: 20000,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Retrieve the token from localStorage
        }
    });
 
    const signIn = async () => {
      const scopes = ['username', 'payments', 'wallet_address'];
      const authResult: AuthResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      await signInUser(authResult);
      setUser(authResult.user);
      setShowModal(false);

    }

    const signInUser = async (authResult: AuthResult) => {
        const response = await axiosClient.post('/auth/signin', {authResult});
        const { token } = response.data;
        localStorage.setItem('token', token); // Store token in localStorage
        setShowModal(false);
    }
    
    const signOutUser = async() =>{
        const nullUser: User = {
            uid: '',
            username: '',
            bio: '',
            accessToken: '',
            coinbalance: 0,
            community: [],
            likes: [],
            comments: [],
            posts: [],
            date: new Date()
          };
          setUser(nullUser);
          localStorage.removeItem('token'); // Remove the token from localStorage
    }

    const saveUser = () =>{
      user?.uid === '' ? signIn() : signOutUser();
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
        addCommentToPost: (newComment: PostType) => {
         setComment([...comment, newComment]);
        }
    }

    useEffect(() => {
        const checkSession = async () => {
          try {
            const response = await axiosClient.get(`/user/me`);
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user)); // Store user in localStorage
          } catch (error) {
            console.error("No active session found", error);
          }
        };
    
        checkSession();
      }, []);

    
      useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }, []);



    return (
        <UserContext.Provider value={ userContext }>
            {children}
        </UserContext.Provider>
    )
}

export default AuthProvider;