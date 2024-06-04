// Date: 09/08/2021
// Description: This is the main page for the Add page. It will display the header, the form, and the bottom navigation bar.
// Created by Georgina Alacaraz
import React, { CSSProperties, useContext, useState } from 'react';
import axios from 'axios';
import { TextField, Button, Stack, colors, FormControl } from '@mui/material';
import { UserContext } from "../components/Auth";
import { UserContextType } from './Types';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { UserData } from './Types';
import {User } from './Types';


const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';

export default function ProfileEdit() {
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState<User>({ uid: '', username: '', accessToken: '',bio: '', coinbalance: 0, community: [], likes: [], comments: [], posts: [], date: new Date()}); // Add initial state
  const { user: contextUser } = useContext(UserContext) as UserContextType;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profile, setProfile] = useState({
    username: user.username, // Initial state, replace with user.username
    bio: user.bio, 
  });

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [event.target.name]: event.target.value });
  };

  const handleSave = () => {
    axiosClient.post(`/user/update`, {
      username: profile.username,
      bio: profile.bio
    })
    .then((response) => {
      console.log('Response data for /user/update:', response.data);
      setEditMode(false); 
    })  
    .catch((error) => {
      console.error('Error fetching /user/update:', error);
    });
  };


  useEffect(() => {
    if (contextUser) {
      axiosClient.get(`/user/userInfo`)
        .then((response) => {
          console.log('Response data for /user/userInfo:', response.data);
          setProfile({
            username: response.data.username,
            bio: response.data.bio,
          });
        })  
        .catch((error) => {
          console.error('Error fetching /user/userInfo:', error);
        });
    }
  }, [contextUser]);


  return (
    <Card style={{ maxWidth: "100%", margin: 'auto', marginTop: 0, boxShadow: 'none', border: 'none' }}>
      <CardContent >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            {editMode ? (
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                name="username"
                value={profile.username}
                onChange={handleChange}
              />
            ) : (
                <Typography>
                <span style={{ fontWeight: 'bold' }}>@</span>{profile.username}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            {editMode ? (
              <TextField
                label="Bio"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                name="bio"
                value={profile.bio}
                onChange={handleChange}
              />
            ) : (
                <Typography>
                <span style={{ fontWeight: 'bold' }}></span> {profile.bio}
              </Typography>
            )}
          </Grid>
          <Grid item xs={5}>
          <Button
              variant="contained"
              color="secondary"
              onClick={() => setEditMode(!editMode)}
              onSubmit={handleSave}
              style={{ padding: '6px 5px', height: '25px', textTransform: 'none'}}
            >
              {editMode ? 'Save' : 'Edit'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

