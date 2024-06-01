// Created by Paula Lopez Burgos and Beren Donmez
import { UserContextType, MyPaymentMetadata } from "../../components/Types";
import { onCancel, onError, onReadyForServerApproval, onReadyForServerCompletion } from "../../components/Payments";
import MuiBottomNavigation from "../../../MuiBottomNavigation";
import SignIn from "../../components/SignIn";
import Header from "../../components/Header";
import Typography from "@mui/material/Typography";
import { UserContext } from "../../components/Auth";
import React from "react";


export default function Blogilates(){
  const { user, saveUser, showModal, saveShowModal, onModalClose } = React.useContext(UserContext) as UserContextType;

  return(
    <>
         {/* <Header user={user} onSignIn={signIn} onSignOut={signOut}/>    */}
        <div style={{ overflowY: 'auto', height: '150vh',marginLeft: '20px' }}>  

        <h2>What I’d look like if I had the “perfect” body throughout history…</h2>
          
        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            Sometimes, I stare at myself in the mirror and I wonder how I would look if I had a “perfect” body, like the ones I see splashed all over magazines and on the explore page of Instagram. But…what if it wasn’t 2018? What would my “ideal” body look like then?
            So, I decided to find out.
            Here’s what I’d look like if I had the “perfect” body throughout history.
        </Typography>

        <img src="2018.jpeg" alt="2018" width="400" height="420"></img>
        
        <Typography variant="body2" sx={{ marginBottom: '16px', fontWeight: 'bold'  }}>
            Mid 2010s-2018:
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            Small waist, big butt butts, wide hips, tiny waists, and full lips are in! There is a huge surge in plastic surgery for butt implants thanks to Instagram models posting “belfies”. 🍑 Even cosmetic surgery doctors have become IG-famous for reshaping women. Between 2012-2014, butt implants and injections rise by 58%.
        </Typography>

        <img src="90s.jpeg" alt="90" width="400" height="420"></img>

        <Typography variant="body2" sx={{ marginBottom: '16px', fontWeight: 'bold'  }}>
            Mid 90s-2000s:
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            Big boobs, flat stomachs, and thighs gaps are in. In 2010, breast augmentation is the highest performed cosmetic surgery in the United States. 👙 It’s the age of the Victoria’s Secret Angel. She’s tall, thin, and she’s always got long legs and a full chest.
        </Typography>

        <img src="early90s.jpeg" alt="early90" width="400" height="420"></img>

        <Typography variant="body2" sx={{ marginBottom: '16px', fontWeight: 'bold'  }}>
            Early 90s:
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            THIN IS IN. Having angular bone structure, looking emaciated, and super skinny is what’s dominating the runways and the magazine covers. There’s even a name for it: “heroin chic”.
        </Typography>

        <img src="1950.jpeg" alt="1950" width="400" height="420"></img>

        <Typography variant="body2" sx={{ marginBottom: '16px', fontWeight: 'bold'  }}>
            1950s:
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            The hourglass shape is in. ⏳ Elizabeth Taylor‘s 36-21-36 measurements are the ideal. Marilyn Monroe’s soft voluptuousness is lusted after. Women are advertised weight gaining pills to fill themselves out. Playboy magazine and Barbie are created in this decade.
            Appearing boyish, androgynous and youthful, with minimal breasts, and a straight figure is in! Unlike the “Gibson Girl” of the Victorian Era, women are choosing to hide their curves, and are doing so by binding their chests with strips of cloth to create that straight figure suitable for flapper dresses.
            The Italian Renaissance – Looking full with a rounded stomach, large hips, and an ample bosom is in. Being well fed is a sign of wealth and status. Only the poor are thin.
        </Typography>

        <img src="90s.jpeg" alt="2018" width="400" height="420"></img>

        <Typography variant="body2" sx={{ marginBottom: '16px', fontWeight: 'bold'  }}>
            Real me today, 2018.
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            You know, this project was so interesting to me because as I was looking at myself getting photoshopped, I thought that I might secretly like one of the results. But the super odd thing was…all of them didn’t sit right with me. Not one! As obvious as it is to say this, I didn’t look like myself in the photos. I actually much prefer my body just as it is. Sure I’ve got a small butt, small boobs, a soft belly, and hip dips, but I’ve also got powerful legs, strong shoulders, and a figure that is all mine – unlike anyone else’s.
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            My question to all of us women is this: Why do we treat our bodies like we treat fashion?
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            “Boobs are out! Butts are in!” Well, the reality is, manufacturing our bodies is a lot more dangerous than manufacturing clothes. Stop throwing out your body like it’s fast fashion.
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            Please treat your body with love & respect and do not succumb to the beauty standard. Embrace your body because it is YOUR own perfect body. Please share this blog post or my Instagram post with as many women as you can. Let’s get this message out.
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
            Also, I want to thank the amazing artist Daniel Kordek for helping me photoshop my body! (Haha, thought I’d never say that!) I’ve been wanting to do this for a while now, and would not have been able to do it at this level without his help.
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: '100px' }}>
            Source: https://www.blogilates.com/blog/what-id-look-like-if-i-had-the-perfect-body-throughout-history/
        </Typography>

        </div>

        

       { showModal && <SignIn onSignIn={saveUser} onModalClose={onModalClose} showModal={showModal}/> }

        <MuiBottomNavigation />
    </>
  );
}
