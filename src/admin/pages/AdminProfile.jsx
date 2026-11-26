import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { updateAdminProfile } from "../store/slices/adminAuthSlice";
import { saveAdminUser } from "../services/userService";
import { updatePassword } from "../../services/authService";
import { ADMIN_SERIF_FONT } from "../adminClasses";

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
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
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
    reader.onload = () =>
      setProfile((current) => ({
        ...current,
        photo: String(reader.result || ""),
      }));
    reader.onerror = () =>
      setProfileError("Could not read that image. Try another file.");
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    const normalizedEmail = profile.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setProfileError("Please enter a valid email address.");
      return;
    }
    setIsSavingProfile(true);
    try {
      const saved = await saveAdminUser({
        name: profile.name,
        email: normalizedEmail,
        phone: profile.phone,
        photo: profile.photo,
      });
      dispatch(updateAdminProfile(saved));
      setProfile((current) => ({
        ...current,
        ...saved,
        email: saved.pendingEmail ? saved.email : normalizedEmail,
      }));
      setProfileMessage(
        normalizedEmail !== admin?.email
          ? "Profile details saved. Confirm the email change using the link sent to your new address."
          : "Profile details saved.",
      );
    } catch (error) {
      setProfileError(error.message || "Could not save your profile.");
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
      await updatePassword(passwordForm.current, passwordForm.next);
      setPasswordForm({ current: "", next: "", confirm: "" });
      setProfileMessage("");
      setPasswordMessage("Password updated successfully.");
      setIsChangingPassword(false);
    } catch (error) {
      setPasswordError(error.message || "Could not update your password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const updateProfileField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    if (profileMessage) setProfileMessage("");
    if (profileError) setProfileError("");
  };

  const updatePasswordField = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    if (passwordMessage) setPasswordMessage("");
    if (passwordError) setPasswordError("");
  };

  const hasChanges =
    (profile.name || "").trim() !== (admin?.name || "").trim() ||
    (profile.email || "").trim().toLowerCase() !==
      (admin?.email || "").trim().toLowerCase() ||
    (profile.phone || "").trim() !== (admin?.phone || "").trim() ||
    (profile.photo || "") !== (admin?.photo || "");

  const initials = (profile.name || profile.email || "A")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <section className="mx-auto w-full max-w-[1050px] px-[clamp(24px,4vw,48px)] py-[clamp(24px,4vw,48px)] text-[#151518] max-[760px]:px-[18px] max-[760px]:py-6 max-[480px]:px-3 max-[480px]:py-[18px]">
      <div className="mb-7">
        <span className="text-[10px] uppercase tracking-[.18em] text-[#777981]">Account settings</span>
        <h1 className={`mt-[7px] ${ADMIN_SERIF_FONT} text-[clamp(28px,4vw,40px)] font-normal tracking-[.015em]`}>Admin profile</h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-[18px]">
        <form className="w-full min-w-0 border border-[#e4e4e7] bg-white p-[clamp(28px,5vw,52px)] max-[480px]:px-[17px] max-[480px]:py-[22px] max-[380px]:px-3 max-[380px]:py-[18px]" onSubmit={handleProfileSave}>
          <div className="mb-[22px] flex items-center gap-[11px] border-b border-[#ededee] pb-[17px]">
            <div className="grid h-9 w-9 shrink-0 place-items-center border border-[#e1e1e4] text-[#33343a]">
              <UserRound size={17} />
            </div>
            <div>
              <h3 className="mb-1 text-[13px] font-semibold tracking-[.02em] text-[#17171a]">Personal details</h3>
              <p className="text-[10px] text-[#777981]">Manage your administrator identity.</p>
            </div>
          </div>

          <div className="mb-[22px] flex items-center gap-4">
            <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#dfe0e3] bg-[#f0f0f2] text-[25px] font-semibold text-[#25262a]">
              {profile.photo ? (
                <img className="block h-full w-full rounded-full object-cover" src={profile.photo} alt="Admin profile" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-[10px]">
              <button
                type="button"
                className="relative inline-flex min-h-8 items-center gap-[7px] rounded-none border border-[#d9d9dd] bg-white px-[11px] text-[10px] text-[#303137] hover:bg-[#f4f4f5]"
                onClick={() => setIsEditingPhoto((editing) => !editing)}
              >
                <Camera size={14} />{" "}
                {isEditingPhoto ? "Cancel photo edit" : "Edit photo"}
              </button>
              {isEditingPhoto && (
                <>
                  <label className="relative inline-flex min-h-8 items-center gap-[7px] rounded-none border border-[#d9d9dd] bg-white px-[11px] text-[10px] text-[#303137] hover:bg-[#f4f4f5]">
                    Choose image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute h-px w-px overflow-hidden [clip-path:inset(50%)]"
                    />
                  </label>
                  {profile.photo && (
                    <button
                      type="button"
                      className="cursor-pointer border-0 bg-transparent px-0.5 py-1.5 text-[10px] text-[#74767d] hover:text-[#111]"
                      onClick={() => {
                        setProfile((current) => ({ ...current, photo: "" }));
                        if (profileMessage) setProfileMessage("");
                        if (profileError) setProfileError("");
                      }}
                    >
                      Remove photo
                    </button>
                  )}
                  <small className="basis-full text-[9px] text-[#85878d]">Image file up to 2 MB. Save profile to apply.</small>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-[15px]">
            <label className="grid gap-[7px] text-[10px] font-semibold tracking-[.035em] text-[#5f6066]">
              Full name
              <input
                name="name"
                value={profile.name}
                onChange={updateProfileField}
                placeholder="Your name"
                autoComplete="name"
                className="min-h-10 w-full rounded-none border border-[#dedee2] bg-white px-[11px] py-[9px] text-[12px] text-[#17171a] outline-none focus:border-[#707178]"
              />
            </label>
            <label className="grid gap-[7px] text-[10px] font-semibold tracking-[.035em] text-[#5f6066]">
              Email address
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={updateProfileField}
                placeholder="admin@example.com"
                autoComplete="email"
                required
                className="min-h-10 w-full rounded-none border border-[#dedee2] bg-white px-[11px] py-[9px] text-[12px] text-[#17171a] outline-none focus:border-[#707178]"
              />
            </label>
            <label className="grid gap-[7px] text-[10px] font-semibold tracking-[.035em] text-[#5f6066]">
              Phone number
              <input
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={updateProfileField}
                placeholder="Optional"
                autoComplete="tel"
                className="min-h-10 w-full rounded-none border border-[#dedee2] bg-white px-[11px] py-[9px] text-[12px] text-[#17171a] outline-none focus:border-[#707178]"
              />
            </label>
          </div>

          <div className="mt-7 flex items-center justify-between gap-5 border-y border-[#ededee] py-5 max-[480px]:items-start max-[480px]:flex-col">
            <div>
              <strong className="text-[12px] font-semibold text-[#25262a]">Password</strong>
              <span className="mt-[5px] block text-[10px] text-[#777981]">
                Update the password used to sign in to the admin panel.
              </span>
            </div>
            <button
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-none border border-[#d9d9dd] bg-white px-[15px] text-[10px] font-semibold text-[#292a2f] transition-colors hover:border-[#151518] hover:bg-[#151518] hover:text-white"
              type="button"
              onClick={() => {
                setIsChangingPassword(true);
                setPasswordError("");
                setPasswordMessage("");
              }}
            >
              <KeyRound size={14} /> Change password
            </button>
          </div>

          {profileError && (
            <p className="mt-[13px] text-[10px] text-[#a43e3e]" role="alert">
              {profileError}
            </p>
          )}
          {profileMessage && (
            <p className="mt-[13px] text-[10px] text-[#39784c]" role="status">
              {profileMessage}
            </p>
          )}
          {passwordMessage && (
            <p className="mt-[13px] text-[10px] text-[#39784c]" role="status">
              {passwordMessage}
            </p>
          )}
          <div className="mt-[21px] flex min-h-11 items-center justify-between gap-3 border-t border-[#ededee] pt-[17px] max-[480px]:items-start max-[480px]:flex-col">
            <span className="inline-flex items-center gap-1.5 text-[9px] text-[#777981]">
              <ShieldCheck size={14} /> Admin account
              {hasChanges && (
                <span className="animate-[fadeInBadge_.2s_ease_both] text-[9.5px] font-semibold text-[#d97706]">
                  • Unsaved changes
                </span>
              )}
            </span>

            {(hasChanges || isSavingProfile) && (
              <button
                className="inline-flex min-h-9 items-center justify-center gap-[7px] rounded-none whitespace-nowrap border border-[#151518] bg-[#151518] px-[13px] text-[10px] font-semibold text-white shadow-[0_2px_8px_rgb(0_0_0_/_15%)] transition hover:-translate-y-px hover:border-[#27272a] hover:bg-[#27272a] disabled:cursor-wait disabled:opacity-60 animate-[saveBtnAppear_.22s_cubic-bezier(.16,.75,.25,1)_both]"
                type="submit"
                disabled={isSavingProfile}
                title="Save changes to your administrator profile"
              >
                <Save
                  size={14}
                  className={
                    isSavingProfile
                      ? "animate-spin"
                        : ""
                  }
                />
                <span>{isSavingProfile ? "Saving…" : "Save profile"}</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {isChangingPassword && (
        <div
          className="fixed inset-0 z-[1100] grid place-items-center bg-[rgb(15_15_18_/_46%)] p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setIsChangingPassword(false);
          }}
        >
          <section
            className="max-h-[min(90vh,700px)] w-[min(100%,440px)] overflow-y-auto border border-[#e4e4e7] bg-white p-[26px] shadow-[0_20px_70px_rgb(0_0_0_/_18%)] max-[380px]:px-[14px] max-[380px]:py-[18px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-password-title"
          >
            <div className="mb-[22px] flex items-center gap-[11px] border-b border-[#ededee] pb-[17px]">
              <div className="grid h-9 w-9 shrink-0 place-items-center border border-[#e1e1e4] text-[#33343a]">
                <KeyRound size={17} />
              </div>
              <div>
                <h3 className="mb-1 text-[13px] font-semibold tracking-[.02em] text-[#17171a]" id="admin-password-title">Change password</h3>
                <p className="text-[10px] text-[#777981]">Confirm your current password to continue.</p>
              </div>
            </div>
            <form onSubmit={handlePasswordSave}>
              <div className="grid gap-[15px]">
                <label className="grid gap-[7px] text-[10px] font-semibold tracking-[.035em] text-[#5f6066]">
                  Current password
                  <input
                    name="current"
                    type="password"
                    value={passwordForm.current}
                    onChange={updatePasswordField}
                    autoComplete="current-password"
                    required
                    className="min-h-10 w-full border border-[#dedee2] bg-white px-[11px] py-[9px] text-[12px] text-[#17171a] outline-none focus:border-[#707178]"
                  />
                </label>
                <label className="grid gap-[7px] text-[10px] font-semibold tracking-[.035em] text-[#5f6066]">
                  New password
                  <input
                    name="next"
                    type="password"
                    value={passwordForm.next}
                    onChange={updatePasswordField}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="min-h-10 w-full border border-[#dedee2] bg-white px-[11px] py-[9px] text-[12px] text-[#17171a] outline-none focus:border-[#707178]"
                  />
                </label>
                <label className="grid gap-[7px] text-[10px] font-semibold tracking-[.035em] text-[#5f6066]">
                  Confirm new password
                  <input
                    name="confirm"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={updatePasswordField}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="min-h-10 w-full border border-[#dedee2] bg-white px-[11px] py-[9px] text-[12px] text-[#17171a] outline-none focus:border-[#707178]"
                  />
                </label>
              </div>
              {passwordError && (
                <p className="mt-[13px] text-[10px] text-[#a43e3e]" role="alert">
                  {passwordError}
                </p>
              )}
              <div className="mt-[21px] flex min-h-11 items-center justify-end gap-3 border-t border-[#ededee] pt-[17px] max-[480px]:flex-row max-[480px]:items-stretch">
                <button
                  type="button"
                  className="relative inline-flex min-h-8 items-center gap-[7px] rounded-none border border-[#d9d9dd] bg-white px-[11px] text-[10px] text-[#303137] hover:bg-[#f4f4f5]"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ current: "", next: "", confirm: "" });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex min-h-9 items-center justify-center gap-[7px] rounded-none whitespace-nowrap border border-[#151518] bg-[#151518] px-[13px] text-[10px] font-semibold text-white transition-colors hover:bg-[#33343a] disabled:cursor-wait disabled:opacity-60"
                  type="submit"
                  disabled={isSavingPassword}
                >
                  <KeyRound size={14} />{" "}
                  {isSavingPassword ? "Updating…" : "Update password"}
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
