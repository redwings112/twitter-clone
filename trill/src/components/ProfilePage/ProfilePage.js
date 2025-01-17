import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: "",
    image: "",
    phone: "",
    location: "",
    birthday: "",
    age: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = doc(db, "users", user.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            setUserData(userSnapshot.data());
          }
        }
      } catch (error) {
        setError("Error fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth, db]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (file) {
      setLoading(true);
      try {
        const storageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            console.error("Upload failed:", error);
            setError("Error uploading file.");
          },
          async () => {
            const downloadURL = await getDownloadURL(storageRef);
            setUserData((prev) => ({ ...prev, image: downloadURL }));
            await setDoc(doc(db, "users", auth.currentUser.uid), { image: downloadURL }, { merge: true });
          }
        );
      } catch (error) {
        setError("Error uploading the image.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!userData.name || !userData.phone || !userData.location) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        await setDoc(userDoc, userData, { merge: true });
        setIsEditing(false); // Exit edit mode
        setError(null); // Clear previous error
      } else {
        setError("User not authenticated. Please log in again.");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      setError("Error saving user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteDoc(doc(db, "users", user.uid));
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        await deleteObject(storageRef);
        await deleteUser(user);
        console.log("User and profile deleted.");
        // Optionally, redirect to a login or home page
      }
    } catch (error) {
      setError("Error deleting profile.");
    } finally {
      setLoading(false);
    }
  };

  const toggleEditing = () => {
    setIsEditing((prev) => !prev);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={userData.image || "/default-avatar.png"} alt="User Avatar" className="profile-image" />
        <h1>{isEditing ? "Edit Profile" : userData.name || "User"}</h1>
        <button onClick={toggleEditing}>{isEditing ? "Cancel" : "Edit"}</button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Loading...</p>}

      <div className="content-area">
        {isEditing ? (
          <>
            <div className="input-field">
              <label>Username:</label>
              <input type="text" name="name" value={userData.name} onChange={handleInputChange} />
            </div>
            <div className="input-field">
              <label>Phone:</label>
              <input type="text" name="phone" value={userData.phone} onChange={handleInputChange} />
            </div>
            <div className="input-field">
              <label>Location:</label>
              <input type="text" name="location" value={userData.location} onChange={handleInputChange} />
            </div>
            <div className="input-field">
              <label>Birthday:</label>
              <input type="date" name="birthday" value={userData.birthday} onChange={handleInputChange} />
            </div>
            <div className="input-field">
              <label>Age:</label>
              <input type="number" name="age" value={userData.age} onChange={handleInputChange} />
            </div>
            <div className="input-field">
              <label>Upload Profile Picture:</label>
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleUpload} disabled={loading}>Upload</button>
            </div>
            <button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </>
        ) : (
          <>
            <p>Phone: {userData.phone}</p>
            <p>Location: {userData.location}</p>
            <p>Birthday: {userData.birthday}</p>
            <p>Age: {userData.age}</p>
          </>
        )}
        <button onClick={handleDeleteProfile} disabled={loading}>
          {loading ? "Deleting..." : "Delete Profile"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
