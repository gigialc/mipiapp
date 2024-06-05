// Created by Georgina Alacaraz

export type AuthResult = {
    accessToken: string,
    user: {
      uid: string,
      bio: string,
      accessToken: string,
      coinbalance: number,
      username: string,
      community: CommunityType[];
      likes: string[];
      comments: CommentType[];
      posts: PostType[];
      date: Date;
    }
    };

    export type User = AuthResult['user'];


    export type CommunityType = {
      _id: string,
      title: string,
      description: string,
      creator: Object,
      members: User[],
      price: number,
      posts: PostType[],
      comments: CommentType[],
      timestamp: Date,

    };
    
    export type UserContextType = {
      user: { uid: string; username: string; accessToken: string; bio: string; coinbalance: number; community: CommunityType[]; likes: string[]; comments: CommentType[]; posts: PostType[]; date: Date } | null;
      saveUser: () => void;
      showModal: boolean;
      saveShowModal: (value: boolean) => void;
      onModalClose: () => void;
      community: CommunityType[];
      addCommunityToUser: (newCommunity: CommunityType) => void;
      addPostToCommunity: (newPost: CommunityType) => void;
      addCommentToPost: (newComment: PostType) => void;   
    };

    export type PostType = {
      _id: string,
      title: string,
      description: string,
      community_id: string,
      user_uid: string,
      likes: string[],
      comments: CommentType[],
    };

    export type CommentType = {
      _id: string,
      comment: string,
      post_id: string,
      user_uid: string,
      likes: string[],
    };// Import the 'ObjectId' type from the 'mongodb' package

    export type UserData = {
      uid: string,
      bio: string,
      coinbalance: number,
      accessToken: string,
      username: string,
      community: CommunityType[],
      likes: string[];      // Changed to array of ObjectId
      comments: CommentType[];   // Changed to array of ObjectId
      posts: PostType[];      // Changed to array of ObjectId
      date: Date;
    };

    

    export type CommunityContextType = {
      community: CommunityType[];
      addPostToCommunity: (newPost: CommunityType) => void;
      addCommentToPost: (newComment: CommunityType) => void;
      
    };

    export type MyPaymentMetadata = {};
    
    export interface PaymentDTO {
    amount: number,
    user_uid: string,
    created_at: string,
    identifier: string,
    metadata: Object,
    memo: string,
    status: {
      developer_approved: boolean,
      transaction_verified: boolean,
      developer_completed: boolean,
      cancelled: boolean,
      user_cancelled: boolean,
    },
    to_address: string,
    transaction: null | {
      txid: string,
      verified: boolean,
      _link: string,
    },
    }; 
  
  // Make TS accept the existence of our window.__ENV object - defined in index.html:
  export interface WindowWithEnv extends Window {
      __ENV?: {
        backendURL: string, // REACT_APP_BACKEND_URL environment variable
        sandbox: string, // REACT_APP_SANDBOX_SDK environment variable - string, not boolean!
      }
    }

    