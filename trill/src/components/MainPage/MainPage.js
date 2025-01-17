import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  List,
  ListItemText,
  IconButton,
  Divider,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ReplyIcon from "@mui/icons-material/Reply";
import RepeatIcon from "@mui/icons-material/Repeat";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { auth } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Define bad words list
const badWords = [
  "abuse", "alcoholic", "asshole", "bastard", "bitch", "blacklist", "bloodsucker", "blowjob",
  "bomb", "boobs", "bullshit", "cunt", "dick", "douchebag", "dyke", "fag", "faggot", "fuck",
  "gangbang", "goddamn", "homo", "idiot", "jackass", "jerk", "kike", "lesbian", "masturbation",
  "motherfucker", "nazi", "nigger", "piss", "porn", "prick", "pussy", "racist", "rape", "scum",
  "shit", "slut", "sodomize", "spic", "tits", "twat", "whore", "wop"
];

// Function to remove bad words from text
const removeBadWords = (text) => {
  let cleanedText = text;
  badWords.forEach((badWord) => {
    const regex = new RegExp(`\\b${badWord}\\b`, "gi");
    cleanedText = cleanedText.replace(regex, "[REDACTED]");
  });
  return cleanedText;
};

const MainPage = () => {
  const [posts, setPosts] = useState([]);
  const [input, setInput] = useState("");
  const [replyInputs, setReplyInputs] = useState({}); // Track replies per post
  const [badWordAlert, setBadWordAlert] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Set the current user when logged in
      } else {
        setCurrentUser(null); // Handle the case where no user is logged in
      }
    });
    return () => unsubscribe(); // Clean up the listener
  }, []);

  // Handle new post
  const handlePostMessage = () => {
    if (input.trim()) {
      const cleanedMessage = removeBadWords(input);
      if (cleanedMessage !== input) {
        setBadWordAlert("Your message contains inappropriate words.");
      } else {
        setBadWordAlert(""); // Clear the alert if no bad words
        setPosts((prevPosts) => [
          ...prevPosts,
          { 
            id: Date.now(), 
            user: currentUser?.displayName || "User hasn't set a name yet",  // Use name or placeholder
            text: cleanedMessage, 
            liked: false, 
            replies: [], 
            reposted: false 
          },
        ]);
        setInput(""); // Clear input after successful post
      }
    }
  };

  // Handle like post
  const handleLikePost = (id) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, liked: !post.liked } : post
      )
    );
  };

  // Handle repost post
  const handleRepost = (id) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id ? { ...post, reposted: !post.reposted } : post
      )
    );
  };

  // Handle delete post
  const handleDeletePost = (id) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
  };

  // Handle reply input change
  const handleReplyInputChange = (id, value) => {
    setReplyInputs((prevReplyInputs) => ({ ...prevReplyInputs, [id]: value }));
  };

  // Handle reply post
  const handleReplyPost = (id) => {
    const replyText = replyInputs[id] || "";
    if (replyText.trim()) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id
            ? { ...post, replies: [...post.replies, { user: currentUser?.displayName || "Anonymous", text: replyText }] }
            : post
        )
      );
      setReplyInputs((prevReplyInputs) => ({ ...prevReplyInputs, [id]: "" }));
    }
  };

  return (
    <Container>
      <Box sx={{ display: "flex", flexDirection: "column", marginTop: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h4">
            Welcome, {currentUser ? currentUser.displayName || "User hasn't set a name yet" : "Guest"}!
          </Typography>
        </Box>

        {/* New Post Section */}
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="What's happening?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePostMessage()}
            error={!!badWordAlert}
            helperText={badWordAlert}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePostMessage}
            endIcon={<SendIcon />}
            disabled={!!badWordAlert} // Disable post button if bad word detected
          >
            Post
          </Button>
        </Box>

        {/* Posts Section */}
        <List>
          {posts.length === 0 ? (
            <Typography variant="h6">No posts yet. Be the first to share something!</Typography>
          ) : (
            posts.map((post) => (
              <Box key={post.id} sx={{ marginBottom: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AccountCircleIcon sx={{ marginRight: 1 }} />
                  <Typography variant="h6" sx={{ fontSize: "0.9rem" }}>
                    {post.user}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <ListItemText primary={post.text} sx={{ marginTop: 1 }} />
                  <Box>
                    <IconButton onClick={() => handleLikePost(post.id)}>
                      <FavoriteIcon color={post.liked ? "primary" : "default"} />
                    </IconButton>
                    <IconButton onClick={() => handleRepost(post.id)}>
                      <RepeatIcon color={post.reposted ? "primary" : "default"} />
                    </IconButton>
                    {post.user === (currentUser ? currentUser.displayName || "User hasn't set a name yet" : "") && (
                      <IconButton onClick={() => handleDeletePost(post.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center", marginTop: 2 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Reply..."
                    value={replyInputs[post.id] || ""}
                    onChange={(e) => handleReplyInputChange(post.id, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReplyPost(post.id)}
                  />
                  <IconButton
                    onClick={() => handleReplyPost(post.id)}
                    color="primary"
                    disabled={!replyInputs[post.id]?.trim()}
                  >
                    <ReplyIcon />
                  </IconButton>
                </Box>

                {post.replies.length > 0 && (
                  <Box sx={{ marginTop: 1, paddingLeft: 2 }}>
                    {post.replies.map((reply, index) => (
                      <Typography key={index} variant="body2" sx={{ fontSize: "0.8rem" }}>
                        {reply.user}: {reply.text}
                      </Typography>
                    ))}
                  </Box>
                )}

                <Divider sx={{ marginTop: 2 }} />
              </Box>
            ))
          )}
        </List>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          marginTop: 4,
          padding: 2,
          textAlign: "center",
          backgroundColor: "#f1f1f1",
          borderTop: "1px solid #ccc",
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} My Social App. All Rights Reserved.
        </Typography>
        <Typography variant="body2">
          Built with ❤️ using React and Firebase.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/profile")} // Redirect to profile page
          sx={{ marginTop: 1 }}
        >
          Go to Profile Page
        </Button>
      </Box>
    </Container>
  );
};

export default MainPage;
