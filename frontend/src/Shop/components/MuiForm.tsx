import React, { CSSProperties, useContext, useState } from 'react';
import axios from 'axios';
import { TextField, Button, Stack } from '@mui/material';
import { UserContext } from "../components/Auth";
import { UserContextType } from './Types';
import { on } from 'events';

const backendURL = process.env.REACT_APP_BACKEND_URL || 'https://backend-piapp-d985003a74e5.herokuapp.com/';

export default function MuiForm() {

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [open, setOpen] = useState(false);
    const [thankYouMessage, setThankYouMessage] = useState<string>('');
    
    const [titleError, setTitleError] = useState<boolean>(false);
    const [descriptionError, setDescriptionError] = useState<boolean>(false);
    const [priceError, setPriceError] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    
    const [titleErrorMessage, setTitleErrorMessage] = useState<string>('');
    const [descriptionErrorMessage, setDescriptionErrorMessage] = useState<string>('');
    const [priceErrorMessage, setPriceErrorMessage] = useState<string>('');

    const { user, showModal, saveShowModal, addCommunityToUser } = useContext(UserContext) as UserContextType;

    const onModalClose = () => {
        setShowDialog(false);
    }

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
    
    const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }
    
    const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    }
    
    const onPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(event.target.value);
    }
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (title === '') {
            setTitleError(true);
            setTitleErrorMessage('Title is required');
        } else {
            setTitleError(false);
            setTitleErrorMessage('');
        }

        if (description === '') {
            setDescriptionError(true);
            setDescriptionErrorMessage('Description is required');
        } else {
            setDescriptionError(false);
            setDescriptionErrorMessage('');
        }

        if (price === '') {
            setPriceError(true);
            setPriceErrorMessage('Price is required');
        } else {
            setPriceError(false);
            setPriceErrorMessage('');
        }

        if (title !== '' && description !== '' && price !== '' && user) { // Ensure user is not null
            const data = {
                title,
                description,
                price,
                user_id: user.uid // Pass the user id
            };

            axiosClient
                .post(`/community/create`, data)
                .then((response) => {
                    console.log(response);
                    setShowDialog(true);
                    setOpen(false); // Close the form dialog
                    if (addCommunityToUser) {
                        addCommunityToUser(response.data);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    const modalStyle: CSSProperties = {
        backgroundColor: '#FEEAEE',
        position: 'absolute',
        left: '15vw',
        top: '40%',
        width: '70vw',
        height: '25vh',
        border: '1px solid pink',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    };

    const inputStyle = {
        backgroundColor: "white",
        margin: "8px 0",
        borderRadius: "4px"
    };

    return (
        <div style={{ padding: '15px', backgroundColor: 'white' }}>
            <form onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
                <Stack spacing={4}>
                    <TextField
                        id="title"
                        label="Title"
                        variant="outlined"
                        value={title}
                        onChange={onTitleChange}
                        error={titleError}
                        helperText={titleError ? titleErrorMessage : ""}
                        fullWidth
                        required
                        style={{ backgroundColor: '#f8f8f8' }}
                    />
                    <TextField
                        id="description"
                        label="Content"
                        variant="outlined"
                        value={description}
                        onChange={onDescriptionChange}
                        error={descriptionError}
                        helperText={descriptionError ? descriptionErrorMessage : ""}
                        fullWidth
                        required
                        multiline
                        rows={3}
                        style={{ backgroundColor: '#f8f8f8' }}
                    />
                    <TextField
                        id="price"
                        label="Comment Price"
                        variant="outlined"
                        value={price}
                        onChange={onPriceChange}
                        error={priceError}
                        helperText={priceError ? priceErrorMessage : ""}
                        required
                        style={{ backgroundColor: '#f8f8f8' }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ alignSelf: 'start', mt: 2 }}
                        style={{
                            backgroundColor: "#9E4291",
                            color: "white",
                            borderRadius: "20px",
                            padding: '10px 30px',
                            textTransform: 'none'
                        }}
                    >
                        Create
                    </Button>
                </Stack>
            </form>
            {showDialog && (
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '20px', borderRadius: '10px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
                    <p style={{ fontWeight: 'light', marginBottom: '16px', color: '#333' }}>Your community has been created successfully!</p>
                    <Button onClick={onModalClose} variant="contained" style={{ backgroundColor: "#9E4291", color: "white", borderRadius: "100px", padding: '8px 32px' }}>Close</Button>
                </div>
            )}
        </div>
    );
}
