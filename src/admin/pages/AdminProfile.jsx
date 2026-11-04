import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { updateAdminProfile } from "../store/slices/adminAuthSlice";
import { saveAdminCredentials, verifyAdminPassword } from "../utils/adminCredentials";
import "./AdminProfile.css";

function AdminProfile() {
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.adminAuth.admin);
  const [profile, setProfile] = useState(() => ({
    name: admin?.name || "",
    email: admin?.email || "",
    phone: admin?.phone || "",
    photo: admin?.photo || "",
  }));
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileError("");
    setProfileMessage("");
    if (!file.type.startsWith("image/")) {
      setProfileError("Choose an image file for your profile photo.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Choose an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProfile((current) => ({ ...current, photo: String(reader.result || "") }));
    reader.onerror = () => setProfileError("Could not read that image. Try another file.");
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setIsSavingProfile(true);
    try {
      const normalizedEmail = profile.email.trim().toLowerCase();
      await saveAdminCredentials({ email: normalizedEmail });
      dispatch(updateAdminProfile({ ...profile, email: normalizedEmail }));
      setProfile((current) => ({ ...current, email: normalizedEmail }));
      setProfileMessage("Profile details saved.");
    } catch {
      setProfileError("Could not save your profile. Check browser storage and try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.next.length < 8) {
      setPasswordError("Your new password must be at least 8 characters.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      if (!(await verifyAdminPassword(passwordForm.current))) {
        setPasswordError("Current password is incorrect. Sign out and sign in again to sync your saved credentials, then retry.");
        return;
      }
      const normalizedEmail = profile.email.trim().toLowerCase();
      await saveAdminCredentials({ email: normalizedEmail, password: passwordForm.next });
      dispatch(updateAdminProfile({ ...profile, email: normalizedEmail }));
      setPasswordForm({ current: "", next: "", confirm: "" });
      setProfileMessage("");
      setPasswordMessage("Password updated. Use the new password next time you sign in.");
      setIsChangingPassword(false);
    } catch {
      setPasswordError("Could not update your password in this browser.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const updateProfileField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const updatePasswordField = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const initials = (profile.name || profile.email || "A").trim().charAt(0).toUpperCase();

  return (
    <section className="admin-profile-page">
      <div className="admin-profile-heading"><span>Account settings</span><h1>Admin profile</h1></div>

      <div className="admin-profile-grid">
        <form className="admin-profile-card" onSubmit={handleProfileSave}>
          <div className="admin-profile-card-heading">
            <div className="admin-profile-section-icon"><UserRound size={17} /></div>
            <div><h3>Personal details</h3><p>Manage your administrator identity.</p></div>
          </div>

          <div className="admin-profile-photo-row">
            <div className="admin-profile-photo">
              {profile.photo ? <img src={profile.photo} alt="Admin profile" /> : <span>{initials}</span>}
            </div>
            <div className="admin-profile-photo-actions">
              <button type="button" className="admin-secondary-button" onClick={() => setIsEditingPhoto((editing) => !editing)}>
                <Camera size={14} /> {isEditingPhoto ? "Cancel photo edit" : "Edit photo"}
              </button>
              {isEditingPhoto && <>
                <label className="admin-secondary-button">
                  Choose image
                  <input type="file" accept="image/*" onChange={handlePhotoChange} />
                </label>
                {profile.photo && <button type="button" className="admin-profile-remove-photo" onClick={() => setProfile((current) => ({ ...current, photo: "" }))}>Remove photo</button>}
                <small>Image file up to 2 MB. Save profile to apply.</small>
              </>}
            </div>
          </div>

          <div className="admin-profile-fields">
            <label>Full name<input name="name" value={profile.name} onChange={updateProfileField} placeholder="Your name" autoComplete="name" /></label>
            <label>Email address<input name="email" type="email" value={profile.email} onChange={updateProfileField} placeholder="admin@example.com" autoComplete="email" required /></label>
            <label>Phone number<input name="phone" type="tel" value={profile.phone} onChange={updateProfileField} placeholder="Optional" autoComplete="tel" /></label>
          </div>

          <div className="admin-profile-security-row">
            <div><strong>Password</strong><span>Update the password used to sign in to the admin panel.</span></div>
            <button className="admin-profile-password-trigger" type="button" onClick={() => { setIsChangingPassword(true); setPasswordError(""); setPasswordMessage(""); }}>
              <KeyRound size={14} /> Change password
            </button>
          </div>

          {profileError && <p className="admin-profile-feedback is-error" role="alert">{profileError}</p>}
          {profileMessage && <p className="admin-profile-feedback is-success" role="status">{profileMessage}</p>}
          {passwordMessage && <p className="admin-profile-feedback is-success" role="status">{passwordMessage}</p>}
          <div className="admin-profile-card-footer">
            <span><ShieldCheck size={14} /> Admin account</span>
            <button className="admin-profile-primary-button" type="submit" disabled={isSavingProfile}>
              <Save size={14} /> {isSavingProfile ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>

      </div>

      {isChangingPassword && (
        <div className="admin-password-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsChangingPassword(false); }}>
          <section className="admin-password-modal" role="dialog" aria-modal="true" aria-labelledby="admin-password-title">
            <div className="admin-profile-card-heading">
              <div className="admin-profile-section-icon"><KeyRound size={17} /></div>
              <div><h3 id="admin-password-title">Change password</h3><p>Confirm your current password to continue.</p></div>
            </div>
            <form onSubmit={handlePasswordSave}>
              <div className="admin-profile-fields">
                <label>Current password<input name="current" type="password" value={passwordForm.current} onChange={updatePasswordField} autoComplete="current-password" required /></label>
                <label>New password<input name="next" type="password" value={passwordForm.next} onChange={updatePasswordField} autoComplete="new-password" minLength={8} required /></label>
                <label>Confirm new password<input name="confirm" type="password" value={passwordForm.confirm} onChange={updatePasswordField} autoComplete="new-password" minLength={8} required /></label>
              </div>
              {passwordError && <p className="admin-profile-feedback is-error" role="alert">{passwordError}</p>}
              <div className="admin-profile-card-footer">
                <button type="button" className="admin-secondary-button" onClick={() => { setIsChangingPassword(false); setPasswordForm({ current: "", next: "", confirm: "" }); }}>Cancel</button>
                <button className="admin-profile-primary-button" type="submit" disabled={isSavingPassword}>
                  <KeyRound size={14} /> {isSavingPassword ? "Updating…" : "Update password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default AdminProfile;
