// Created by Georgina Alacaraz
import * as React from "react";
import 'normalize.css';
// import '/defaults.css';
import { Routes, Route } from 'react-router-dom';
import MuiBottomNavigation from '../MuiBottomNavigation';
import Shop from './pages/home';
import Add from './pages/create';
//import Chat from "./Shop/pages/chat";
import Profile from './pages/profile';
import Newsletter from "./pages/newsletter";
import AuthProvider from "./components/Auth";
import Mybody from "./pages/mybody";
import SocialMediaBlog from "./pages/blogpages/SocialMediaBlog";
import Blogilates from "./pages/blogpages/Blogilates";
import BodyImage from "./pages/blogpages/BodyImage";
import Eatingdisorders from "./pages/blogpages/Eatingdisorders";
import Sexed from "./pages/blogpages/sexed";
import Chat from "./pages/chat";
import ChatCreator from "./pages/chatCreator";
import Comments from "./components/comments";
import PublicProfile from "./pages/publicProfile";

function App() {
    const user = null;
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Shop />} />
                <Route path="/Add" element={<Add />} />
                <Route path="/Profile" element={<Profile />} />// Make sure Profile is a valid React component
                <Route path="/Newsletter" element={<Newsletter />} /> 
                <Route path="/mybody" element={<Mybody />} />
                <Route path="/sexed" element={<Sexed />} />
                <Route path="/publicProfile" element={<PublicProfile />} />
                {/*<Route path="/Chat" element={<Chat />} />*/}
                <Route path="/socialmediaBlog" element={<SocialMediaBlog />} />
                <Route path="/Blogilates" element={<Blogilates />} />
                <Route path="/BodyImage" element={<BodyImage />} />
                <Route path="/Eatingdisorders" element={<Eatingdisorders />} />
                <Route path="/Chat" element={<Chat />} />
                <Route path="/ChatCreator" element={<ChatCreator />} />
                <Route path="/comments" element={<Comments />} />

            </Routes>
            <MuiBottomNavigation />
        </AuthProvider>
    );
}

export default App;